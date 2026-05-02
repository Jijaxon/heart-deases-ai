"""
Bemorlar boshqaruvi API.
CRUD operatsiyalar, CSV import, pagination, search, filter.
"""
import io
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import (
    PatientCreate, PatientResponse,
    PatientListResponse, ImportResponse
)
from app.core.security import get_current_active_user

router = APIRouter(prefix="/patients", tags=["Bemorlar"])

# CSV ustun nomlari → DB ustun nomlari mapping
CSV_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal", "target"
]


@router.get("/", response_model=PatientListResponse)
def get_patients(
    page: int = Query(1, ge=1, description="Sahifa raqami"),
    page_size: int = Query(10, ge=1, le=100, description="Sahifadagi elementlar soni"),
    search: Optional[str] = Query(None, description="ID bo'yicha qidirish"),
    target: Optional[int] = Query(None, ge=0, le=1, description="0=sog'lom, 1=kasal"),
    min_age: Optional[int] = Query(None, ge=1, description="Minimal yosh"),
    max_age: Optional[int] = Query(None, le=120, description="Maksimal yosh"),
    trained: Optional[bool] = Query(None, description="O'qitilgan/o'qitilmagan"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Bemorlar ro'yxati.
    Pagination, search va filter qo'llab-quvvatlanadi.
    
    Filterlar:
    - target: 0 (sog'lom) yoki 1 (kasal)
    - min_age/max_age: Yosh diapazoni
    - trained: Model o'qitishda ishlatilganmi
    """
    query = db.query(models.Patient)
    
    # Search (ID bo'yicha)
    if search:
        try:
            patient_id = int(search)
            query = query.filter(models.Patient.id == patient_id)
        except ValueError:
            pass  # Raqam emas - natija bo'sh
    
    # Filterlar
    if target is not None:
        query = query.filter(models.Patient.target == target)
    if min_age is not None:
        query = query.filter(models.Patient.age >= min_age)
    if max_age is not None:
        query = query.filter(models.Patient.age <= max_age)
    if trained is not None:
        query = query.filter(models.Patient.trained == trained)
    
    # Umumiy son
    total = query.count()
    total_pages = (total + page_size - 1) // page_size
    
    # Sahifalash
    patients = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return PatientListResponse(
        patients=patients,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/", response_model=PatientResponse, status_code=201)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Yangi bemor qo'shadi. trained=False bo'ladi (hali o'qitilmagan)."""
    new_patient = models.Patient(**patient_data.model_dump(), trained=False)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Bitta bemor ma'lumotlarini qaytaradi."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Bemor #{patient_id} topilmadi")
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Bemor ma'lumotlarini yangilaydi."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Bemor #{patient_id} topilmadi")
    
    for key, value in patient_data.model_dump().items():
        setattr(patient, key, value)
    
    # Yangilanganda trained qayta False bo'ladi
    patient.trained = False
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Bemorni o'chiradi."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Bemor #{patient_id} topilmadi")
    db.delete(patient)
    db.commit()
    return {"message": f"Bemor #{patient_id} o'chirildi"}


@router.post("/import/csv", response_model=ImportResponse)
async def import_csv(
    file: UploadFile = File(..., description="CSV fayl (heart.csv)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    CSV fayldan bemorlarni import qiladi.
    
    CSV format: age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal,target
    
    - Allaqachon mavjud yozuvlar o'tkazib yuboriladi
    - Barcha import qilingan yozuvlar trained=False bo'ladi
    - Bu funksiya bir martalik import uchun mo'ljallangan
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Faqat CSV fayl qabul qilinadi")
    
    content = await file.read()
    
    try:
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV o'qishda xatolik: {str(e)}")
    
    # Ustunlarni tekshirish
    required_cols = CSV_COLUMNS[:-1]  # target optional
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Quyidagi ustunlar topilmadi: {missing}"
        )
    
    imported = 0
    skipped = 0
    
    for _, row in df.iterrows():
        try:
            patient = models.Patient(
                age=int(row['age']),
                sex=int(row['sex']),
                cp=int(row['cp']),
                trestbps=int(row['trestbps']),
                chol=int(row['chol']),
                fbs=int(row['fbs']),
                restecg=int(row['restecg']),
                thalach=int(row['thalach']),
                exang=int(row['exang']),
                oldpeak=float(row['oldpeak']),
                slope=int(row['slope']),
                ca=int(row['ca']),
                thal=int(row['thal']),
                target=int(row['target']) if 'target' in df.columns and pd.notna(row.get('target')) else None,
                trained=False,
                source="csv_import"
            )
            db.add(patient)
            imported += 1
        except Exception:
            skipped += 1
    
    db.commit()
    
    return ImportResponse(
        success=True,
        imported_count=imported,
        skipped_count=skipped,
        message=f"{imported} ta bemor import qilindi, {skipped} ta o'tkazib yuborildi"
    )

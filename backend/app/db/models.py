"""
SQLAlchemy ORM modellari.
Patients, Predictions va Users jadvallari shu yerda ta'riflanadi.
"""
from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Patient(Base):
    """
    Bemorlar jadvali.
    CSV dan import qilingan va yangi qo'shilgan bemorlar saqlanadi.
    """
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Klinik ko'rsatkichlar
    age = Column(Integer, nullable=False, comment="Yosh")
    sex = Column(Integer, nullable=False, comment="Jins: 1=erkak, 0=ayol")
    cp = Column(Integer, nullable=False, comment="Ko'krak og'rig'i turi: 0-3")
    trestbps = Column(Integer, nullable=False, comment="Tinch holatdagi qon bosimi (mm Hg)")
    chol = Column(Integer, nullable=False, comment="Serum xolesterin (mg/dl)")
    fbs = Column(Integer, nullable=False, comment="Och qoringa qand > 120 mg/dl: 1=ha")
    restecg = Column(Integer, nullable=False, comment="Tinch holatdagi EKG natijalari: 0-2")
    thalach = Column(Integer, nullable=False, comment="Maksimal yurak urishi")
    exang = Column(Integer, nullable=False, comment="Jismoniy mashq angina: 1=ha")
    oldpeak = Column(Float, nullable=False, comment="ST depressiyasi")
    slope = Column(Integer, nullable=False, comment="ST segment slope: 0-2")
    ca = Column(Integer, nullable=False, comment="Asosiy tomirlar soni: 0-3")
    thal = Column(Integer, nullable=False, comment="Thalassemia: 0-3")
    
    # Maqsad ustun
    target = Column(Integer, nullable=True, comment="0=sog'lom, 1=kasal")
    
    # Model holati
    trained = Column(Boolean, default=False, comment="Bu yozuv model o'qitishda ishlatilganmi")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String(50), default="csv_import", comment="Ma'lumot manbai")

    # Relationship
    predictions = relationship("Prediction", back_populates="patient")


class Prediction(Base):
    """
    Prognozlar jadvali.
    Har bir predict so'rovi natijasi saqlanadi (history tracking).
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, comment="Bazadagi bemor ID")
    
    # Prognoz natijalari
    prediction = Column(Integer, nullable=False, comment="0=sog'lom, 1=kasal")
    probability = Column(Float, nullable=False, comment="Kasallik ehtimoli (0-1)")
    risk_score = Column(Integer, nullable=False, comment="Xavf balli 0-100")
    
    # Klasterlash natijalari
    cluster_kmeans = Column(Integer, nullable=True, comment="KMeans klasteri")
    cluster_dbscan = Column(Integer, nullable=True, comment="DBSCAN klasteri (-1=outlier)")
    risk_label = Column(String(20), nullable=True, comment="High/Medium/Low Risk")
    
    # Qo'shimcha ma'lumotlar
    model_used = Column(String(50), default="random_forest", comment="Ishlatilgan model")
    recommendations = Column(Text, nullable=True, comment="JSON formatdagi tavsiyalar")
    feature_importance = Column(Text, nullable=True, comment="JSON formatdagi feature importances")
    
    # Bemor ma'lumotlari (patient_id bo'lmasa ham saqlanadi)
    trained = Column(Boolean, default=False, comment="Bu prediction retrain uchun ishlatilganmi")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    patient = relationship("Patient", back_populates="predictions")


class User(Base):
    """
    Foydalanuvchilar jadvali.
    Doctor va admin loginlari uchun.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="doctor", comment="doctor yoki admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelMetrics(Base):
    """
    Model ko'rsatkichlari jadvali.
    Har bir train sessiyasi natijalari saqlanadi.
    """
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50), nullable=False, comment="logistic_regression, random_forest, xgboost")
    accuracy = Column(Float, nullable=True)
    test_accuracy = Column(Float, nullable=True)
    cv_mean = Column(Float, nullable=True)
    cv_std = Column(Float, nullable=True)
    train_accuracy = Column(Float, nullable=True)
    overfitting_gap = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    training_samples = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=False, comment="Hozirda ishlatilayotgan model")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

"""
Autentifikatsiya API.
Doctor/Admin login va ro'yxatdan o'tish endpointlari.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, get_current_active_user
)

router = APIRouter(prefix="/auth", tags=["Autentifikatsiya"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Yangi foydalanuvchi (doctor/admin) ro'yxatdan o'tkazadi.
    Username va email unikal bo'lishi kerak.
    """
    # Username mavjudligini tekshirish
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(
            status_code=400,
            detail=f"'{user_data.username}' username allaqachon mavjud"
        )
    
    # Email mavjudligini tekshirish
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(
            status_code=400,
            detail=f"'{user_data.email}' email allaqachon ro'yxatdan o'tgan"
        )
    
    # Yangi foydalanuvchi yaratish
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role or "doctor",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Foydalanuvchi login. JWT token qaytaradi.
    
    Credentials:
    - username: foydalanuvchi nomi
    - password: parol
    """
    # Foydalanuvchini topish
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()
    
    # Parolni tekshirish
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username yoki parol noto'g'ri",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Hisob aktiv emas")
    
    # JWT token yaratish
    access_token = create_access_token(data={"sub": user.username})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: models.User = Depends(get_current_active_user)
):
    """Joriy foydalanuvchi ma'lumotlarini qaytaradi."""
    return current_user

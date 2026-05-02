# """
# JWT autentifikatsiya va parol xavfsizligi moduli.
# Doctor/admin loginlari uchun ishlatiladi.
# """
# from datetime import datetime, timedelta
# from typing import Optional
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session

# from app.core.config import settings
# from app.db.database import get_db
# from app.db import models

# # Parol hashlash konteksti (bcrypt algoritmi)
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # OAuth2 token URL
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """Oddiy parolni hashed parol bilan solishtiradi."""
#     return pwd_context.verify(plain_password, hashed_password)


# def get_password_hash(password: str) -> str:
#     """Parolni bcrypt bilan hashlaydi."""
#     return pwd_context.hash(password)


# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#     """
#     JWT access token yaratadi.
    
#     Args:
#         data: Token ichiga joylanadigan ma'lumotlar
#         expires_delta: Token amal qilish muddati
#     """
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (
#         expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     )
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# async def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# ) -> models.User:
#     """
#     JWT tokendan joriy foydalanuvchini oladi.
#     Token noto'g'ri bo'lsa 401 xatolik qaytaradi.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Token noto'g'ri yoki muddati o'tgan",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception

#     user = db.query(models.User).filter(models.User.username == username).first()
#     if user is None:
#         raise credentials_exception
#     return user


# async def get_current_active_user(
#     current_user: models.User = Depends(get_current_user)
# ) -> models.User:
#     """Faqat aktiv foydalanuvchilarni ruxsat beradi."""
#     if not current_user.is_active:
#         raise HTTPException(status_code=400, detail="Foydalanuvchi aktiv emas")
#     return current_user

"""
JWT autentifikatsiya va parol xavfsizligi moduli.
Doctor/admin loginlari uchun ishlatiladi.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.db import models

# Parol hashlash konteksti (bcrypt algoritmi)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _truncate_password(password: str) -> str:
    """Bcrypt 72 byte cheklovini hal qilish uchun"""
    # Bcrypt faqat 72 baytgacha ishlaydi
    password_bytes = password.encode('utf-8')[:72]
    return password_bytes.decode('utf-8', errors='ignore')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Oddiy parolni hashed parol bilan solishtiradi."""
    try:
        return pwd_context.verify(_truncate_password(plain_password), hashed_password)
    except ValueError as e:
        if "password cannot be longer than 72 bytes" in str(e):
            # Agar xato yuz bersa, qisqartirilgan versiyani sinab ko'ramiz
            return pwd_context.verify(_truncate_password(plain_password), hashed_password)
        raise


def get_password_hash(password: str) -> str:
    """Parolni bcrypt bilan hashlaydi."""
    return pwd_context.hash(_truncate_password(password))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT access token yaratadi.
    
    Args:
        data: Token ichiga joylanadigan ma'lumotlar
        expires_delta: Token amal qilish muddati
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    JWT tokendan joriy foydalanuvchini oladi.
    Token noto'g'ri bo'lsa 401 xatolik qaytaradi.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token noto'g'ri yoki muddati o'tgan",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Faqat aktiv foydalanuvchilarni ruxsat beradi."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Foydalanuvchi aktiv emas")
    return current_user
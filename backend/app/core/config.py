"""
Ilova konfiguratsiyasi.
Barcha muhit o'zgaruvchilari shu yerda boshqariladi.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Ma'lumotlar bazasi
    DATABASE_URL: str = "postgresql://postgres:1234@localhost:5432/heart_disease_db"

    # JWT sozlamalari
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Ilova nomi
    APP_NAME: str = "Heart Disease AI"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Settings singleton - bir marta yaratiladi, qayta ishlatiladi."""
    return Settings()


settings = get_settings()

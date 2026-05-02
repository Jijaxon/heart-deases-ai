"""
SQLAlchemy ma'lumotlar bazasi ulanish moduli.
PostgreSQL bilan ishlash uchun engine va session yaratadi.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from ..core.config import settings

# SQLAlchemy engine - PostgreSQL ulanishi
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # Ulanish hayotligini tekshiradi
    pool_size=10,             # Connection pool hajmi
    max_overflow=20,          # Qo'shimcha ulanishlar soni
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Barcha modellar shu Base dan meros oladi
Base = declarative_base()


def get_db():
    """
    FastAPI dependency injection uchun DB session generator.
    Request tugaganda session avtomatik yopiladi.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Barcha jadvallarni ma'lumotlar bazasida yaratadi."""
    Base.metadata.create_all(bind=engine)

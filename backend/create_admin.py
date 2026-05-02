"""
Admin foydalanuvchi yaratish skripti.
Birinchi marta ishga tushirishdan oldin bajaring.

Ishlatish:
    python create_admin.py
"""
import sys
sys.path.append('.')

# from app.db.database import SessionLocal, create_tables
from app.db.database import SessionLocal, create_tables
from app.db.models import User
from app.core.security import get_password_hash

def create_admin():
    create_tables()
    db = SessionLocal()
    
    # Allaqachon mavjudligini tekshirish
    if db.query(User).filter(User.username == 'admin').first():
        print("✅ Admin allaqachon mavjud")
        db.close()
        return
    
    admin = User(
        username='admin',
        email='admin@heartai.com',
        full_name='Administrator',
        hashed_password=get_password_hash('admin123'),
        role='admin',
        is_active=True,
    )
    
    doctor = User(
        username='doctor',
        email='doctor@heartai.com',
        full_name='Doktor Aliyev',
        hashed_password=get_password_hash('doctor123'),
        role='doctor',
        is_active=True,
    )
    
    db.add(admin)
    db.add(doctor)
    db.commit()
    
    print("✅ Foydalanuvchilar yaratildi:")
    print("   Admin   → username: admin   | parol: admin123")
    print("   Doctor  → username: doctor  | parol: doctor123")
    db.close()

if __name__ == '__main__':
    create_admin()

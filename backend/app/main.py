"""
Heart Disease AI - FastAPI asosiy ilova fayli.
Barcha routerlar shu yerda ro'yxatdan o'tkaziladi.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.database import create_tables
from .api import auth, patients, predictions

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI ilovasini yaratish
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## Yurak Kasalligi AI Diagnostika Tizimi
    
    ### Imkoniyatlar:
    - 🧠 **Classification** - Bemor kasal/sog'lom prognozi (Logistic Regression, Random Forest, XGBoost)
    - 📊 **Clustering** - KMeans (High/Medium/Low Risk) + DBSCAN (Outlier detection)
    - 💡 **Smart Recommendations** - Shaxsiy tibbiy tavsiyalar
    - 📈 **Dashboard** - Statistika va vizualizatsiya
    - 🔄 **Auto Retraining** - Yangi ma'lumotlar bilan model yangilash
    - 🔐 **Authentication** - JWT asosidagi xavfsizlik
    
    ### Ishlatish tartibi:
    1. `/api/auth/login` - Login qiling
    2. `/api/patients/import/csv` - CSV import qiling  
    3. `/api/ml/train` - Modelni o'qiting
    4. `/api/ml/predict` - Prognoz qiling
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────────────────────────────────────────────────────────────────────────
# CORS - Frontend React bilan ishlash uchun
# ──────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────────
# API Routerlar
# ──────────────────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")


# ──────────────────────────────────────────────────────────────────────────────
# Startup event - DB jadvallarini yaratish
# ──────────────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Ilova ishga tushganda jadvallarni yaratadi."""
    create_tables()
    print(f"✅ {settings.APP_NAME} ishga tushdi")
    print(f"📚 API Docs: http://localhost:8000/docs")


@app.get("/")
def root():
    """API holat tekshiruvi."""
    from .ml.model import heart_model
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "ishlamoqda",
        "docs": "/docs",
        "model_trained": heart_model.is_trained,
    }


@app.get("/health")
def health_check():
    """Ilova sog'lom yoki yo'qligini tekshiradi."""
    from .ml.model import heart_model
    return {
        "status": "ok",
        "model_loaded": heart_model.is_trained,
        "model_name": heart_model.model_name if heart_model.is_trained else None,
    }

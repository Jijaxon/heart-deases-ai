"""
Pydantic sxemalari - API kirish/chiqish validatsiyasi.
Request va Response modellari shu yerda ta'riflanadi.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Patient Schemas ───────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    """Bemor asosiy maydonlari."""
    age: int = Field(..., ge=1, le=120, description="Yosh")
    sex: int = Field(..., ge=0, le=1, description="Jins: 1=erkak, 0=ayol")
    cp: int = Field(..., ge=0, le=3, description="Ko'krak og'rig'i turi")
    trestbps: int = Field(..., ge=50, le=300, description="Qon bosimi")
    chol: int = Field(..., ge=100, le=600, description="Xolesterin")
    fbs: int = Field(..., ge=0, le=1, description="Qand darajasi")
    restecg: int = Field(..., ge=0, le=2, description="EKG natijasi")
    thalach: int = Field(..., ge=50, le=250, description="Maks. yurak urishi")
    exang: int = Field(..., ge=0, le=1, description="Mashq angina")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depressiya")
    slope: int = Field(..., ge=0, le=2, description="ST slope")
    ca: int = Field(..., ge=0, le=4, description="Tomirlar soni")
    thal: int = Field(..., ge=0, le=3, description="Thalassemia")


class PatientCreate(PatientBase):
    """Yangi bemor qo'shish uchun schema."""
    target: Optional[int] = Field(None, ge=0, le=1, description="0=sog'lom, 1=kasal")
    source: Optional[str] = "manual"


class PatientResponse(PatientBase):
    """Bemor ma'lumotlarini qaytarish uchun schema."""
    id: int
    target: Optional[int]
    trained: bool
    created_at: datetime
    source: str

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    """Sahifalangan bemor ro'yxati."""
    patients: List[PatientResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Prediction Schemas ────────────────────────────────────────────────────────

class PredictRequest(PatientBase):
    """Prognoz so'rovi uchun schema - bemor ma'lumotlari kiritiladi."""
    model_name: Optional[str] = Field("random_forest", description="Model tanlash")


class FeatureImportanceItem(BaseModel):
    """Bitta feature importance elementi."""
    feature: str
    importance: float
    direction: str  # "yuqori" yoki "past"
    value: float


class RecommendationItem(BaseModel):
    """Bitta tavsiya elementi."""
    category: str
    message: str
    priority: str  # "high", "medium", "low"


class PredictResponse(BaseModel):
    """Prognoz natijasi - batafsil ma'lumot bilan."""
    prediction: int
    prediction_label: str          # "Kasal" yoki "Sog'lom"
    probability: float             # Kasallik ehtimoli
    risk_score: int                # 0-100 ball
    risk_level: str                # "Yuqori", "O'rta", "Past"
    
    # Tushuntirish
    top_features: List[FeatureImportanceItem]
    recommendations: List[RecommendationItem]
    
    # Meta
    model_used: str
    prediction_id: Optional[int]


class PredictionHistoryResponse(BaseModel):
    """Prognoz tarixi elementi."""
    id: int
    prediction: int
    prediction_label: str
    probability: float
    risk_score: int
    risk_label: Optional[str]
    model_used: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Training Schemas ──────────────────────────────────────────────────────────

class TrainRequest(BaseModel):
    """Model o'qitish so'rovi."""
    model_name: str = Field("random_forest", description="logistic_regression, random_forest, xgboost")
    use_only_untrained: bool = Field(False, description="Faqat yangi ma'lumotlarda o'qit")


class ModelMetricsResponse(BaseModel):
    """Model ko'rsatkichlari."""
    model_name: str
    accuracy: Optional[float]
    test_accuracy: Optional[float]
    cv_mean: Optional[float]
    cv_std: Optional[float]
    train_accuracy: Optional[float]
    overfitting_gap: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    roc_auc: Optional[float]
    training_samples: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TrainResponse(BaseModel):
    """O'qitish natijasi."""
    success: bool
    message: str
    metrics: ModelMetricsResponse
    trained_samples: int


# ─── Auth Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Yangi foydalanuvchi yaratish."""
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    full_name: Optional[str]
    password: str = Field(..., min_length=6)
    role: Optional[str] = "doctor"


class UserResponse(BaseModel):
    """Foydalanuvchi ma'lumotlari."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token javobi."""
    access_token: str
    token_type: str
    user: UserResponse


# ─── Dashboard Schemas ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    """Dashboard uchun umumiy statistika."""
    total_patients: int
    sick_patients: int
    healthy_patients: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_predictions: int
    avg_age: float
    avg_chol: float
    model_accuracy: Optional[float]

    healthy_female_patients: int = 0
    healthy_male_patients: int = 0
    sick_female_patients: int = 0
    sick_male_patients: int = 0


# ─── CSV Import Schema ─────────────────────────────────────────────────────────

class ImportResponse(BaseModel):
    """CSV import natijasi."""
    success: bool
    imported_count: int
    skipped_count: int
    message: str

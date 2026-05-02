# 🫀 Heart Disease AI — Yurak Kasalligi Diagnostika Tizimi

Fullstack AI-powered yurak kasalligi diagnostika tizimi.

## 🏗️ Loyiha Arxitekturasi

```
heart-disease-ai/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── api/               # REST API endpointlar
│   │   │   ├── auth.py        # JWT login/register
│   │   │   ├── patients.py    # CRUD + CSV import
│   │   │   └── predictions.py # Predict + Train + Clustering
│   │   ├── core/
│   │   │   ├── config.py      # Konfiguratsiya
│   │   │   └── security.py    # JWT, password hash
│   │   ├── db/
│   │   │   ├── database.py    # SQLAlchemy engine
│   │   │   └── models.py      # ORM modellari
│   │   ├── ml/
│   │   │   ├── model.py       # AI/ML engine (asosiy)
│   │   │   └── saved_models/  # Trained model fayllar
│   │   ├── schemas/
│   │   │   └── schemas.py     # Pydantic sxemalar
│   │   └── main.py            # FastAPI app
│   ├── requirements.txt
│   └── .env
│
└── frontend/                  # React + Vite + TailwindCSS v4
    ├── src/
    │   ├── pages/             # Sahifalar
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── PatientsPage.jsx
    │   │   ├── PredictPage.jsx
    │   │   ├── ClusteringPage.jsx
    │   │   ├── ModelsPage.jsx
    │   │   ├── HistoryPage.jsx
    │   │   └── TrainPage.jsx
    │   ├── store/             # Redux Toolkit
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── patientsSlice.js
    │   │       ├── mlSlice.js
    │   │       └── themeSlice.js
    │   ├── components/
    │   │   └── layout/
    │   │       └── AppLayout.jsx
    │   └── utils/
    │       ├── api.js         # Axios instance
    │       └── helpers.js     # Yordamchi funksiyalar
    ├── package.json
    └── vite.config.js
```

## 🤖 AI/ML Imkoniyatlar

### Classification (Tasniflash)
| Model | Afzalliklari |
|-------|-------------|
| Logistic Regression | Oddiy, tez, tushunish oson |
| Random Forest | Yuqori aniqlik, tavsiya etiladi |
| XGBoost | Pro darajali, eng yaxshi natija |

### Clustering (Guruhlash)
- **KMeans**: 3 ta guruh — High/Medium/Low Risk
- **DBSCAN**: Avtomatik guruhlar + **Outlier detection** (anomal bemorlar)

### Smart Recommendations
- Xolesterin bo'yicha tavsiya
- Qon bosimi nazorati
- Jismoniy faollik maslahat
- Tibbiy tekshiruv eslatmalari

## 🚀 O'rnatish

### 1. PostgreSQL bazasini yarating

```sql
CREATE DATABASE heart_disease_db;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE heart_disease_db TO postgres;
```

### 2. Backend o'rnatish

```bash
cd backend

# Virtual muhit yaratish
python -m venv venv
source venv/bin/activate      # Linux/Mac
# yoki
venv\Scripts\activate          # Windows

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# .env faylni tahrirlash
cp .env.example .env
nano .env   # DATABASE_URL va SECRET_KEY ni o'zgartiring

# Serverni ishga tushurish
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend o'rnatish

```bash
cd frontend
npm install
npm run dev
```

### 4. Admin foydalanuvchi yaratish

Birinchi marta ishga tushurgach:
```bash
# API docs orqali: http://localhost:8000/docs
# POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "Administrator",
  "password": "admin123",
  "role": "admin"
}
```

### 5. CSV import qilish

1. `http://localhost:5173` ga kiring
2. Patients → CSV Import
3. `heart.csv` faylini yuklang (UCI Heart Disease Dataset formatida)
4. Train → "Modelni O'qitish" tugmasini bosing

## 📡 API Endpointlar

### Autentifikatsiya
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish (JWT olish) |
| GET | `/api/auth/me` | Joriy user |

### Bemorlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | `/api/patients/` | Ro'yxat (pagination+filter) |
| POST | `/api/patients/` | Yangi bemor |
| GET | `/api/patients/{id}` | Bitta bemor |
| PUT | `/api/patients/{id}` | Yangilash |
| DELETE | `/api/patients/{id}` | O'chirish |
| POST | `/api/patients/import/csv` | CSV import |

### ML
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/ml/predict` | Prognoz qilish |
| POST | `/api/ml/train` | Modelni o'qitish |
| GET | `/api/ml/history` | Prognozlar tarixi |
| GET | `/api/ml/metrics` | Model ko'rsatkichlari |
| GET | `/api/ml/compare` | Modellarni solishtirish |
| GET | `/api/ml/clustering` | Klasterlash vizualizatsiya |
| GET | `/api/ml/feature-importance` | Feature importances |
| GET | `/api/ml/dashboard/stats` | Dashboard statistika |

## 🗄️ Ma'lumotlar Bazasi Sxemasi

### patients jadvali
```sql
id, age, sex, cp, trestbps, chol, fbs, restecg,
thalach, exang, oldpeak, slope, ca, thal,
target, trained, created_at, source
```
> `trained=True` → model o'qitishda ishlatilgan

### predictions jadvali
```sql
id, patient_id, prediction, probability, risk_score,
cluster_kmeans, cluster_dbscan, risk_label,
model_used, recommendations, feature_importance,
trained, created_at
```
> `trained=False` (default) → retrain uchun yangi ma'lumot

### users jadvali
```sql
id, username, email, full_name, hashed_password,
role, is_active, created_at
```

### model_metrics jadvali
```sql
id, model_name, accuracy, precision, recall,
f1_score, roc_auc, training_samples, is_active, created_at
```

## 💡 Ishlatish Tartibi

```
1. CSV import qiling (heart.csv)
2. Train → modelni o'qiting (random_forest tavsiya)
3. Predict → bemor ma'lumotlarini kiriting
4. Natijani ko'ring:
   - Kasal/Sog'lom (ehtimol foizi bilan)
   - Risk Score (0-100)
   - Asosiy omillar (feature importance)
   - Shaxsiy tavsiyalar
5. Clustering → KMeans & DBSCAN vizualizatsiya
6. History → barcha prognozlar tarixi
```

## 🛠️ Texnologiyalar

**Backend:**
- FastAPI — modern Python web framework
- SQLAlchemy — ORM
- PostgreSQL — ma'lumotlar bazasi
- scikit-learn — ML kutubxona
- XGBoost — gradient boosting
- joblib — model saqlash

**Frontend:**
- React 18 + Vite
- TailwindCSS v4 (PostCSS ishlatilmaydi!)
- Redux Toolkit — holat boshqaruvi
- Recharts — grafik kutubxona
- Lucide React — ikonkalar
- React Router v6

## 📊 CSV Format

```csv
age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal,target
63,1,3,145,233,1,0,150,0,2.3,0,0,1,1
37,1,2,130,250,0,1,187,0,3.5,0,0,2,1
...
```

Dataset: [UCI Heart Disease Dataset](https://archive.ics.uci.edu/dataset/45/heart+disease)

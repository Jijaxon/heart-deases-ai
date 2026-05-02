"""
Namuna CSV fayl generatsiya qilish - TO'G'RILANGAN VERSIYA
Real heart disease dataset statistikasiga yaqin
"""
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500  # Ko'proq ma'lumot yaxshi natija beradi

# ============================================================
# 1. Haqiqiy dataset statistikasiga asoslangan generatsiya
# ============================================================

# Yosh (30-80 oralig'ida, o'rtacha 55)
age = np.random.normal(55, 10, n).clip(30, 80).astype(int)

# Jins: 68% erkak, 32% ayol (Cleveland datasetiga o'xshash)
sex = np.random.choice([0, 1], n, p=[0.32, 0.68])

# Ko'krak og'rig'i (cp): Haqiqiy tarqalishga yakin
# 0: Tipik angina (10%), 1: Atipik angina (20%),
# 2: Og'riq bo'lmagan (45%), 3: Asimptomatik (25%)
cp = np.random.choice([0, 1, 2, 3], n, p=[0.10, 0.20, 0.45, 0.25])

# Qon bosimi (normal: 120-130, yuqori: 140+)
trestbps = np.random.normal(130, 15, n).clip(90, 200).astype(int)

# Xolesterin (normal: <200, chegarada: 200-240, yuqori: >240)
chol = np.random.normal(220, 50, n).clip(150, 400).astype(int)

# Och qoringa qand (fbs) – 15% da yuqori
fbs = np.random.choice([0, 1], n, p=[0.85, 0.15])

# EKG (restecg): 0: Normal (70%), 1: Anormallik (20%), 2: Gipertrofiya (10%)
restecg = np.random.choice([0, 1, 2], n, p=[0.70, 0.20, 0.10])

# Maksimal yurak urishi (yoshga bog'liq)
thalach_base = 220 - age
thalach = np.random.normal(thalach_base, 15, n).clip(60, 200).astype(int)

# Mashq anginasi (exang) – 30% da bor
exang = np.random.choice([0, 1], n, p=[0.70, 0.30])

# ST depressiya (oldpeak) – ko'pchilikda 0, ba'zilarida yuqori
oldpeak = np.where(
    np.random.random(n) < 0.7,
    0,
    np.round(np.random.exponential(1.5, n), 1)
).clip(0, 6)

# ST slope (oldpeak bilan bog'liq)
slope = np.zeros(n, dtype=int)
for i in range(n):
    if oldpeak[i] == 0:
        slope[i] = 2  # Yuqoriga (eng yaxshi)
    elif oldpeak[i] < 1.5:
        slope[i] = 1  # Tekis (o'rtacha)
    else:
        slope[i] = 0  # Pastga (eng yomon)

# Tomirlar soni (ca) – ko'pchilikda 0
ca = np.random.choice([0, 1, 2, 3], n, p=[0.65, 0.20, 0.10, 0.05])

# Thalassemia – ko'pchilikda normal (1)
thal = np.random.choice([0, 1, 2, 3], n, p=[0.05, 0.60, 0.20, 0.15])

# ============================================================
# 2. Realistic target (haqiqiy kasallik ehtimoli)
# ============================================================

# Har bir omilning hissasi
risk_score = np.zeros(n)

# Kuchli xavf omillari (each up to 30%)
risk_score += (cp == 0) * 0.30      # Tipik angina
risk_score += (ca >= 2) * 0.25      # 2+ toraygan tomir
risk_score += (thal == 3) * 0.20    # Reversible defect

# O'rtacha xavf omillari (each up to 15%)
risk_score += (age > 60) * 0.15
risk_score += (sex == 1) * 0.10
risk_score += (chol > 240) * 0.12
risk_score += (trestbps > 140) * 0.10
risk_score += (oldpeak > 2) * 0.15
risk_score += (exang == 1) * 0.10
risk_score += (slope == 0) * 0.10

# Himoya omillari (salbiy hissa)
risk_score -= (thalach > 160) * 0.10
risk_score -= (cp == 2) * 0.10

# Cheklash va target yaratish
risk_score = risk_score.clip(0, 1)
target = (risk_score + np.random.uniform(-0.15, 0.15, n) > 0.5).astype(int)

# ============================================================
# 3. DataFrame yaratish va saqlash
# ============================================================

df = pd.DataFrame({
    'age': age,
    'sex': sex,
    'cp': cp,
    'trestbps': trestbps,
    'chol': chol,
    'fbs': fbs,
    'restecg': restecg,
    'thalach': thalach,
    'exang': exang,
    'oldpeak': oldpeak,
    'slope': slope,
    'ca': ca,
    'thal': thal,
    'target': target
})

# Saqlash
df.to_csv('heart_disease_data.csv', index=False)

# ============================================================
# 4. Statistika chiqarish
# ============================================================

print("=" * 50)
print("✅ HEART DISEASE DATASET GENERATED")
print("=" * 50)
print(f"📊 Umumiy yozuvlar: {len(df)}")
print(f"   - Kasal (target=1): {df.target.sum()} ({df.target.sum()/len(df)*100:.1f}%)")
print(f"   - Sog'lom (target=0): {(df.target==0).sum()} ({(df.target==0).sum()/len(df)*100:.1f}%)")
print()
print("📈 Feature distribution:")
print(f"   cp (0-3): {df.cp.value_counts().sort_index().to_dict()}")
print(f"   thal (0-3): {df.thal.value_counts().sort_index().to_dict()}")
print(f"   slope: {df.slope.value_counts().sort_index().to_dict()}")
print()
print("💾 Fayl saqlandi: heart_disease_data.csv")
print("=" * 50)

# ============================================================
# 5. Sog'lom odam uchun test
# ============================================================
print()
print("🧪 TEST: Sog'lom odam parametrlari:")
healthy = {
    'age': 32, 'sex': 0, 'cp': 2, 'trestbps': 115, 'chol': 170,
    'fbs': 0, 'restecg': 0, 'thalach': 165, 'exang': 0,
    'oldpeak': 0, 'slope': 2, 'ca': 0, 'thal': 1
}
print(f"   Yosh: {healthy['age']}, Jins: Ayol, cp: Og'riq bo'lmagan (2)")
print(f"   Qon bosimi: 115, Xolesterin: 170, Yurak urishi: 165")
print(f"   slope: Yuqoriga (2), ca: 0, thal: 1")
print()
print("   ⚠️ Ushbu bemor SOG'LOM bo'lishi kerak (target=0)")
print("   ==============================================")
# Texnik Topshiriq (Technical Specification)
## Loyiha: Heart Disease AI — Intellektual Diagnostika Tizimi

### 1. Loyihaning Umumiy G'oyasi
Ushbu loyiha tibbiyot xodimlari va kardiologlar uchun mo'ljallangan bo'lib, sun'iy intellekt (AI) yordamida yurak kasalliklarini erta bosqichda aniqlash, bemorlarni xavf guruhlariga ajratish va shaxsiy tibbiy tavsiyalar berishga xizmat qiladi. Tizim nafaqat bashorat qiladi, balki mavjud ma'lumotlar asosida yangi modellarni o'qitish va ularni solishtirish imkoniyatini ham beradi.

---

### 2. Tizimning Asosiy Funksiyalari

#### 2.1. Foydalanuvchilar Boshqaruvi (Auth)
*   **Kirish va Ro'yxatdan o'tish:** JWT (JSON Web Token) asosidagi xavfsiz autentifikatsiya.
*   **Rollar:** Admin (to'liq nazorat) va Shifokor (faqat bemorlar bilan ishlash) rollarini qo'llab-quvvatlash.
*   **Profil:** Foydalanuvchi ma'lumotlarini tahrirlash.

#### 2.2. Bemorlar Ma'lumotlar Bazasi (Data Management)
*   **CRUD Amallar:** Bemorlarni qo'shish, ko'rish, tahrirlash va o'chirish.
*   **CSV Import:** Katta hajmdagi ma'lumotlarni (masalan, UCI Heart Disease dataset) tizimga yuklash.
*   **Filtrlash va Qidiruv:** Bemorlarni yoshi, jinsi va xavf darajasi bo'yicha saralash.

#### 2.3. Sun'iy Intellekt va Mashinali O'qitish (AI/ML)
*   **Klassifikatsiya (Bashorat qilish):**
    *   `Logistic Regression`, `Random Forest`, `XGBoost` algoritmlari yordamida kasallik ehtimolini aniqlash.
    *   Natijada ehtimollik foizi (%) va risk darajasi (Low, Medium, High) ko'rsatiladi.
*   **Klasterlash (Guruhlash):**
    *   `K-Means`: Bemorlarni o'xshashlik belgilari bo'yicha 3 ta asosiy xavf guruhiga ajratish.
    *   `DBSCAN`: Anomal holatlarni (Outliers) aniqlash — noodatiy belgilar bilan og'rigan bemorlarni alohida ajratish.
*   **Modelni O'qitish (Training):**
    *   Yangi yuklangan ma'lumotlar asosida modelni qayta o'qitish (Retraining).
    *   Metrikalar: Accuracy, Precision, Recall, F1-score va ROC-AUC ko'rsatkichlarini hisoblash.
*   **Feature Importance:** Qaysi tibbiy belgilar (masalan, xolesterin yoki qon bosimi) tashxisga eng ko'p ta'sir qilayotganini ko'rsatish.

#### 2.4. Smart Tavsiyalar
*   AI natijalariga asoslangan avtomatik tavsiyalar:
    *   Parhez va turmush tarzi bo'yicha maslahatlar.
    *   Tibbiy ko'rikka chaqiruv eslatmalari.
    *   Xolesterin va qon bosimi nazorati bo'yicha ko'rsatmalar.

#### 2.5. Dashboard va Vizualizatsiya
*   Umumiy statistika: Bemorlar soni, o'rtacha xavf darajasi, o'qitilgan modellar.
*   Interaktiv grafiklar: Kasallikning yoshga bog'liqligi, xolesterin taqsimoti va h.k.

---

### 3. Texnologik Stek (Tech Stack)

*   **Frontend:** React.js, Vite, TailwindCSS v4, Redux Toolkit (State management), Recharts (Grafiklar).
*   **Backend:** FastAPI (Python), SQLAlchemy (ORM), Uvicorn.
*   **Ma'lumotlar bazasi:** PostgreSQL.
*   **ML Kutubxonalar:** Scikit-learn, XGBoost, Pandas, Numpy, Joblib (modellarni saqlash uchun).

---

### 4. Ma'lumotlar Arxitekturasi

Tizim quyidagi asosiy jadvallar ustiga quriladi:
1.  **Users:** Foydalanuvchi ma'lumotlari va rollari.
2.  **Patients:** Bemorlarning tibbiy ko'rsatkichlari (age, chol, trestbps, thalach va h.k.).
3.  **Predictions:** AI tomonidan chiqarilgan xulosalar, ehtimolliklar va klaster IDlari.
4.  **ModelMetrics:** Har bir o'qitilgan modelning aniqlik ko'rsatkichlari tarixi.

---

### 5. Nofunksional Talablar
*   **Xavfsizlik:** Barcha parollar xeshlanishi (bcrypt) va API endpointlar JWT bilan himoyalanishi shart.
*   **Ishlash tezligi:** Katta hajmdagi ma'lumotlar (600k+) bilan ishlashda API javob vaqti 2 soniyadan oshmasligi kerak.
*   **Responsive Design:** Tizim planshet va kompyuterlarda birdek qulay ishlashi lozim.

---

### 6. Loyihaning Kelajakdagi Istiqboli
*   Mobil ilova versiyasini ishlab chiqish.
*   Telegram bot orqali bemorlarga natijalarni yuborish.
*   Real vaqt rejimida tibbiy qurilmalardan (smart-watch) ma'lumotlarni qabul qilish integratsiyasi.

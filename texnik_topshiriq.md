# "Yurak Kasalliklarini Sun'iy Intellekt Yordamida Aniqlash" (Heart Disease AI) tizimi uchun TEXNIK TOPSHIRIQ

## 1. UMUMIY MA’LUMOTLAR

### 1.1. Axborot tizimining nomi
"Yurak Kasalliklarini Sun'iy Intellekt Yordamida Aniqlash" axborot tizimi (qisqacha "Heart Disease AI").

### 1.2. Axborot tizimi buyurtmachisi va ishlab chiquvchi tashkilotning nomi
**Buyurtmachi:** [Buyurtmachi tashkilot/shaxs nomi]
**Ishlab chiquvchi:** [Ishlab chiquvchi nomi yoki jamoasi]

### 1.3. Axborot tizimi yaratishga asos bo‘ladigan hujjatlar
Mazkur axborot tizimi O‘zbekiston Respublikasining raqamli iqtisodiyot va sog'liqni saqlash tizimini raqamlashtirish bo'yicha tegishli qarorlari hamda buyurtmachi va ishlab chiquvchi o‘rtasida tuzilgan shartnoma (topshiriq) asosida yaratiladi.

### 1.4. Ishlarni boshlash va tugatishning reja bo‘yicha muddatlari
Loyiha ustida ishlashni boshlash sanasi: [Boshlanish sanasi]
Loyihani tugatish va topshirish sanasi: [Tugash sanasi]

### 1.5. Ishlar natijalarni rasmiylashtirish va taqdim etish tartibi
Tizim quyidagi natijalar bilan birga topshiriladi:
- Tayyor va ishchi holatdagi dasturiy mahsulot (veb-ilova).
- Tizimning manba kodlari (source code) va o'rnatish bo'yicha yo'riqnoma.
- Sun'iy intellekt (ML) modellarining o'qitilgan fayllari (.pkl va boshqalar).
- Tizimdan foydalanish bo'yicha foydalanuvchi va administrator uchun qo'llanmalar.
- Mazkur texnik topshiriq va arxitektura bo'yicha hujjatlar.

---

## 2. AT VAZIFASI VA YARATISH MAQSADLARI

### 2.1. AT vazifasi
"Heart Disease AI" axborot tizimining asosiy vazifasi bemorlarning tibbiy ko'rsatkichlari (yoshi, jinsi, qon bosimi, xolesterin miqdori, EKG natijalari va b.) asosida sun'iy intellekt modellarini (Logistic Regression, Random Forest, XGBoost va h.k.) qo'llagan holda yurak-qon tomir kasalliklari ehtimolini bashorat qilish va shifokorlarga tashxis qo'yish jarayonida ko'maklashishdan iborat. Shuningdek, tizim bemor va shifokor rollarini ajratgan holda ishlashni ta'minlaydi.

### 2.2. AT yaratish maqsadlari
- Shifokorlarga yurak kasalliklarini barvaqt aniqlashda raqamli yordamchi sifatidagi qulay vositani taqdim etish.
- Tibbiy ma'lumotlar asosida kasallik xavfini aniq va tezkor hisoblash (predict qilish).
- Inson omili tufayli yuzaga kelishi mumkin bo'lgan tibbiy xatoliklarni kamaytirish.
- Bemorlarning holatini tizimli ravishda saqlash, monitoring qilish va shifokor tomonidan yakuniy tashxis tasdiqlanishi tizimini joriy etish.

---

## 3. AXBOROTLASHTIRISH OBYEKTINING XARAKTERISTIKALARI

### 3.1. Axborotlashtirish obyektini tartibga soluvchi hujjatlar
Axborotlashtirish obyekti – bu bemorlarning tibbiy ko'rsatkichlari, diagnostika natijalari va shifokor tomonidan qo'yiladigan yakuniy tashxislar bazasi. U shaxsiy ma'lumotlarni himoya qilish bo'yicha O'zbekiston Respublikasining "Shaxsga doir ma'lumotlar to'g'risida"gi qonuni va sog'liqni saqlash vazirligining me'yoriy-huquqiy hujjatlari bilan tartibga solinadi.

### 3.2. Axborotlashtirish obyektining kundalik holati
Hozirgi kunda bemorlarning tibbiy ko'rsatkichlarini tahlil qilish asosan an'anaviy usulda, shifokorning shaxsiy tajribasi va ko'plab qog'oz shaklidagi yoki tarqoq elektron ma'lumotlar tahlili orqali amalga oshiriladi. Bu ko'p vaqt talab etadi va ba'zida muhim omillar e'tibordan chetda qolishi mumkin.

### 3.3. ATni joriy qilish yordamida hal qilinishi kerak bo‘lgan muammolar
- Yurak kasalliklarini barvaqt va avtomatik tarzda bashorat qilish imkoniyatining yo'qligi.
- Shifokorlar va bemorlar o'rtasida raqamli diagnostika ma'lumotlari almashinuvining sekinligi.
- ML modellaridan foydalangan holda ilmiy asoslangan statistik bashoratlarni kundalik tibbiyot amaliyotiga joriy etish qiyinchiliklari.

---

## 4. ATGA QO‘YILADIGAN TALABLAR

### 4.1. Umumiy ATga qo‘yiladigan talablar

#### 4.1.1. AT strukturasi va ishlashiga qo‘yiladigan talablar
Tizim "Mijoz-Server" (Client-Server) arxitekturasida qurilishi kerak.
- **Frontend (Mijoz qismi):** Foydalanuvchi interfeysi, bemor va shifokor kabinetlari (React/Redux texnologiyalari).
- **Backend (Server qismi):** API xizmatlari, avtorizatsiya va rollar boshqaruvi, sun'iy intellekt modellari bilan ishlash mantiqlari (FastAPI/Python texnologiyalari).
- **Ma'lumotlar bazasi:** Foydalanuvchilar, ularning test ko'rsatkichlari va tashxislarni saqlash uchun relyatsion ma'lumotlar bazasi (PostgreSQL yoki unga o'xshash).

#### 4.1.2. Ishonchlilikka qo‘yiladigan talablar
- Tizim 24/7 rejimida uzluksiz ishlashi kerak.
- Sun'iy intellekt modellarining bashorat aniqligi (Accuracy, Precision, Recall) yetarli darajada bo'lishi talab etiladi.
- Dasturiy nosozliklar yuzaga kelganda ma'lumotlarning yo'qotilmasligi ta'minlanishi kerak (Zaxira nusxalash - Backup).

#### 4.1.3. Tizim komponentlaridan foydalanish, texnik xizmat ko‘rsatish, ta’mirlash va saqlashga qo‘yiladigan talablar
Tizimni serverga joylashtirish (deployment) Docker konteynerlari yordamida amalga oshirilishi tavsiya etiladi. Bu oson texnik xizmat ko'rsatish va tizimni tezkor kengaytirish imkonini beradi.

#### 4.1.4. Patent va litsenziya sofligiga qo‘yiladigan talablar
Tizimni ishlab chiqishda Ochiq kodli (Open Source) dasturiy ta'minot litsenziyalariga rioya qilinishi, tijorat maqsadida foydalanish taqiqlangan yopiq litsenziyali kutubxonalardan qochish kerak.

#### 4.1.5. Standartlashtirishga qo‘yiladigan talablar
- API larni yaratishda RESTful arxitekturasi standartlariga qat'iy amal qilinishi lozim.
- Kod yozishda belgilangan standart qoidalari (masalan Python uchun PEP8) inobatga olinishi kerak.

#### 4.1.6. Qo‘shimcha talablar
- **Xavfsizlik:** Barcha foydalanuvchilar JWT (JSON Web Token) tokenlari asosida autentifikatsiya qilinishi, parollar tizimda xeshlanib saqlanishi kerak.
- **Maxfiylik:** Bemorlarning tibbiy ma'lumotlari faqatgina ularni davolovchi shifokor va bemorning o'zi uchun ko'rinadigan bo'lishi lozim.

### 4.2. AT bajaradigan funksiyalarga qo‘yiladigan talablar
Tizim quyidagi asosiy modullardan iborat bo‘lishi kerak:
1. **Autentifikatsiya va avtorizatsiya moduli:** Foydalanuvchilarni "Bemor" va "Shifokor" rollari asosida ro'yxatdan o'tkazish hamda tizimga kirish (Login/Register).
2. **Bemor shaxsiy kabineti:** Bemor o'zining tibbiy analizi ko'rsatkichlarini kiritishi va AI tizimining dastlabki xulosalarini (kasallik xavfi mavjudligi yoki yo'qligini) ko'rish imkoniyati.
3. **ML Bashorat (Prediction) moduli:** Kiritilgan tibbiy ma'lumotlarni oldindan o'qitilgan modellar (masalan, Random Forest yoki XGBoost) orqali tahlil qilib, yurak kasalligi ehtimolini aniqlash.
4. **Shifokor shaxsiy kabineti va Tashxis moduli:**
   - Shifokor ro'yxatdan o'tgan bemorlarning kiritgan ma'lumotlari va AI tomonidan bashorat qilingan (predict qilingan) natijalarini ro'yxat shaklida ko'radi.
   - Shifokor bemorning barcha ma'lumotlari va AI xulosasini tahlil qilib, tizim ichida **o'zining yakuniy tibbiy tashxisini (diagnozini) qo'yadi va bemorga tasdiqlab yuboradi**. Bemor esa o'z kabinetida ushbu rasmiy tashxisni qabul qilib oladi.
5. **Hisobot moduli:** Foydalanuvchilar o'zining avvalgi tekshiruv natijalarini (tarixni) va shifokor qo'ygan tashxislarni doimiy ko'rib turish imkoniyati.

### 4.3. Ta’minot turlariga qo‘yiladigan talablar

#### 4.3.1. Matematik ta’minotga qo‘yiladigan talablar
Yurak kasalliklarini bashorat qilish uchun klasifikatsiya (Classification) ML algoritmlari qo'llaniladi. Jumladan:
- Logistic Regression
- Random Forest Classifier
- XGBoost Classifier
Ma'lumotlar bazasidagi xususiyatlar (yosh, qon bosimi va h.k.) modelga kirishidan oldin to'g'ri qayta ishlanib standartlashtirilishi (masalan, StandardScaler yordamida) kerak.

#### 4.3.2. Axborot ta’minotiga qo‘yiladigan talablar
Ma'lumotlar bazasi kamida quyidagi axborot strukturalarini o'z ichiga olishi kerak:
- **Foydalanuvchilar (Users):** ID, Ismi, familiyasi, Email, Parol, Rol (Bemor/Shifokor).
- **Tibbiy yozuvlar (Medical Records):** Bemor IDsi, Tibbiy ko'rsatkichlari, AI tomonidan qilingan bashorat (Prediction natijasi), Sana.
- **Tashxislar (Diagnoses):** Tibbiy yozuv IDsi, Shifokor IDsi, Shifokorning yakuniy tashxisi, Tasdiqlangan sana va izohlar.

#### 4.3.3. Dasturiy ta’minotga qo‘yiladigan talablar
- **Backend (Server dasturiy qismi):** Python (FastAPI yordamida), SQLAlchemy (ORM), Scikit-learn, XGBoost kabi kutubxonalar.
- **Frontend (Mijoz dasturiy qismi):** React, JavaScript, HTML/CSS.
- **Ma'lumotlar bazasi boshqaruv tizimi:** PostgreSQL.

#### 4.3.4. Metrologik ta’minotiga qo‘yiladigan talablar
Sun'iy intellekt modellarining sifatini baholash uchun Accuracy metrikasidan foydalaniladi. Ushbu ko'rsatkichlar modellar o'qitilishi jarayonida tahlil qilinib hujjatlashtirib boriladi.

#### 4.3.5. Tashkiliy ta’minotga qo‘yiladigan talablar
Tizimni muvaffaqiyatli ishga tushirish uchun administrator yoki texnik qo'llab-quvvatlash xodimi tayinlanishi, u tizim foydalanuvchilarini (ayniqsa shifokor rollarini tasdiqlashda) boshqarishi hamda yuzaga kelgan muammolarni bartaraf etilishini nazorat qilishi talab qilinadi.

#### 4.3.6. Uslubiy ta’minotga qo‘yiladigan talablar
Foydalanuvchilar (bemor va shifokor) uchun mo'ljallangan yo'riqnomalar tizim interfeysida tushunarli tilda ishlab chiqilishi lozim. Har bir kiritiladigan tibbiy ko'rsatkich haqida ma'lumot (Tooltip) berib o'tilishi foydalanishni qulaylashtiradi.

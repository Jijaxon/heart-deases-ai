# Yurak Kasalliklarini Bashorat Qilish Loyihasidagi Modellar

Ushbu loyihada bemorlarning tibbiy ko'rsatkichlariga asoslanib, yurak kasalligi xavfini aniqlash va bashorat qilish uchun bir qator Machine Learning (Mashinali o'qitish) modellari qo'llanilgan.

## 1. Loyihada ishlatilgan modellar ro'yxati

Loyihaning backend qismida asosan 3 ta klassifikatsiya modellari joriy qilingan:
1. **Random Forest Classifier** (Tasodifiy O'rmon - loyihada asosiy / default model sifatida tanlangan)
2. **XGBoost Classifier** (Extreme Gradient Boosting)
3. **Logistic Regression** (Logistik Regressiya)
4. **StandardScaler** (Ma'lumotlarni qayta ishlash / normallashtirish uchun qo'shimcha yordamchi algoritm)

## 2. Modellar nima sababdan va qayerda ishlatilmoqda?

**Qayerda ishlatiladi:** 
Barcha modellar tizimning backend qismida joylashgan bo'lib, aniqrog'i `backend/app/ml/model.py` faylidagi `HeartDiseaseModel` klassi ichida (`_create_classifier`, `train` va `predict` metodlarida) yaratiladi, o'qitiladi va ishlatiladi. API (masalan, `backend/app/api/predictions.py`) mijozdan kelgan so'rovlarni aynan shu model obyektiga uzatadi.

**Nima sababdan ishlatiladi:**
Ushbu modellar bemorning 13 xil klinik xususiyatlari (yoshi, jinsi, xolesterin, qon bosimi, EKG natijalari va boshqalar) ga tahlil qilib, **yurak kasalligi bor yoki yo'qligini** tashxislash uchun qo'llaniladi.
Bunga qo'shimcha ravishda modellar quyidagi vazifalarni ham bajaradi:
- Kasallikning **ehtimollik foizini** (probability) hisoblab berish (Risk Score hisoblash uchun).
- Qaysi omil (feature) kasallikka qanchalik kuchli ta'sir qilganini (**feature importance**) ko'rsatish, ya'ni shifokorlarga tavsiyalar berishda osonlashtirish.

---

## 3. Modellarning ishlash prinsiplari va bashorat qilish mexanizmlari

Har bir model turli xil matematik va mantiqiy asoslarda ishlaydi:

### 1. Random Forest Classifier (Tasodifiy O'rmon)
- **Ishlash prinsipi:** Bu algoritm "Ansambl" (Ensemble) usuliga kiradi va o'qitish jarayonida yuzlab mustaqil "Qaror daraxtlari"ni (Decision Trees) yaratadi. Har bir daraxt bemorlarning tasodifiy xususiyatlar qismidan foydalangan holda o'zining qoidalarini (shartlarini) ishlab chiqadi.
- **Qanday bashorat qiladi:** Yangi bemor ma'lumotlari kiritilganda, tizimdagi har bir qaror daraxti o'zining alohida bashoratini yoki "ovozini" beradi (masalan, 100 ta daraxtdan 85 tasi "kasal", 15 tasi "sog'lom" deb bashorat qildi). Algoritm eng ko'p ovoz olgan variantni yakuniy natija sifatida qabul qiladi (**Majority voting**). Bu usul aniqlikni keskin oshiradi va modelning ma'lumotlarni shunchaki yodlab olishi (overfitting) ehtimolini kamaytiradi.

### 2. XGBoost Classifier (Extreme Gradient Boosting)
- **Ishlash prinsipi:** Bu ham daraxtlarga asoslangan kuchli ansambl usuli, ammo daraxtlar avvalgidek parallel emas, balki **ketma-ket (sequential)** ravishda quriladi. Dastlabki daraxt qandaydir bashorat qiladi, lekin unda xatolar bo'lishi aniq. Keyingi yaratilgan daraxt aynan oldingi daraxt yo'l qo'ygan xatolarni topib, ularni tuzatishga qaratilgan bo'ladi.
- **Qanday bashorat qiladi:** Barcha yaratilgan ketma-ket daraxtlarning natijalari va xatoni qoplash ko'rsatkichlari ma'lum vaznlar bilan jamlanib, bitta kuchli va o'ta aniq yakuniy bashorat hosil bo'ladi. XGBoost murakkab bog'liqliklarni tez topishi va yuqori darajadagi samaradorlik ko'rsatishi bilan ajralib turadi.

### 3. Logistic Regression (Logistik Regressiya)
- **Ishlash prinsipi:** Bu eng an'anaviy, sodda va tez ishlaydigan chiziqli model. U bemorning 13 xil xususiyatining har biriga ma'lum bir **vazn (weight)** belgilab chiqadi va ularni o'zaro ko'paytirib, yig'indisini hisoblaydi.
- **Qanday bashorat qiladi:** Hosil bo'lgan yig'indi matematik "Sigmoid" funksiyasiga uzatiladi. Sigmoid funksiyasi har qanday sonni **0 va 1 oralig'idagi ehtimollikka** aylantiradi. Agar hisoblangan ehtimollik 0.5 (ya'ni 50%) dan yuqori bo'lsa, model bemorni "Kasal" deb klassifikatsiya qiladi, aks holda "Sog'lom" deydi. Bu model natijalarni matematik jihatdan tushunish va interpretatsiya qilish eng oson bo'lgan algoritm hisoblanadi.

### 4. StandardScaler (Ma'lumotlarni Normallashtirish)
- **Vazifasi:** Algoritmlar (ayniqsa Logistik regressiya kabi modellar) raqamlar farqiga juda ta'sirchan. Masalan, bemorning qondagi xolesterini 250 bo'lishi mumkin, ST depressiya esa 1.5. Model kattaroq raqamga ega bo'lgan omilni "muhimroq" deb o'ylab xato qilmasligi uchun barcha parametrlar `StandardScaler` orqali bir xil shkalaga tushiriladi. Bu jarayon barcha qiymatlarning o'rtacha qiymatini 0 ga va standart og'ishini 1 ga tenglashtiradi, natijada model xolisona bashorat qiladi.

# راحيق داتا — توثيق API (باللغة العربية)
ملاحظة: كتبت ال readme ب gpt لاني مكسل:)
## نظرة عامة
هذا المشروع عبارة عن **خادم API** مبني بـ **Node.js** و **Fastify** يقدم بيانات إسلامية من ملفات JSON داخل مجلد `database/`، مع دعم **الـ Cache باستخدام Redis** لرفع الأداء.

### نقاط يقدمها الـ API
- الأذكار (`/api/athkar`)
- أدعية القرآن (`/api/adaia/quran`)
- أدعية السنة (`/api/adaia/sunnah`)
- أسئلة وأجوبة (`/api/questions`)
- التفاسير (metadata + نصوص التفسير) (`/api/quran/tafsser/...`)
- نص القرآن (بشكل عادي أو مع حروف/رموز) (`/api/quran/text/...`)
- بيانات ميتاداتا للقرآن (الجزء/الصفحة/الأرباع/السجود/السور) (`/api/quran/metadata/...`)

> ملاحظة: إذا لم يتوفر Redis سيستمر تشغيل الـ API لكن بدون cache.

---

## المتطلبات
- Node.js (مطلوب)
- Redis (اختياري لكنه موصى به لتحسين الأداء)

---

## تثبيت وتشغيل المشروع
1) التثبيت:
```bash
npm install
```

2) التشغيل:
```bash
npm start
```

3) الافتراضي:
- سيعمل على `http://localhost:3000`

---

## إعدادات البيئة (Environment Variables)
يمكن تعديل الإعدادات عبر متغيرات البيئة التالية:

- `PORT` : رقم المنفذ (افتراضيًا `3000`)
- `REDIS_HOST` : عنوان Redis (افتراضيًا `127.0.0.1`)
- `REDIS_PORT` : منفذ Redis (افتراضيًا `6379`)
- `MAX_KEYWORD_LENGTH` : آخر عدد للحروف الى تقدر تكتبها في ال keywords (افتراضياً `100`)
- `MIN_KEYWORD_LENGTH` : أقل عدد للحروف في keyword (افتراضياً `2`)
- `MAX_QUERY_URL_LENGTH` : أقصى طول للـ query string (افتراضياً `2048`)
- `MAX_CATEGORY_LENGTH` : أقصى طول لقيمة category في `/api/athkar` (افتراضياً `60`)
- `RATE_LIMIT_WINDOW_MS` : نافذة الـ Rate limit بالملي ثانية (افتراضياً `60000`)
- `RATE_LIMIT_MAX_REQUESTS` : أقصى عدد طلبات في النافذة لكل IP + مسار (افتراضياً `30`)


---

## قواعد البحث (Query & Validation)
- بعض endpoints تسمح بباراميتر `keyword` للبحث.
- يتم تمرير جميع endpoints التي تعتمد على البحث عبر middleware (`src/middleware.js`) لإضافة حمايات إضافية.

### 1) keyword
- **يجب أن يكون نصًا (string)**.
- في حال كان موجودًا:
  - الحد الأدنى للطول: **حرفين**.
  - الحد الأعلى للطول: **100 حرف**.
- غير ذلك سيتم إرجاع **400 Bad Request**.

### 2) surah / ayah / level (للمسارات التي تستخدمها)
- `surah`: عدد صحيح ضمن **1..114**.
- `ayah`: عدد صحيح ضمن **1..286**.
- `level` (في `/api/questions`): عدد صحيح ضمن **1..10**.
- غير ذلك سيتم إرجاع **400 Bad Request**.

### 3) typeText (تفاسير)
- يتم رفض أي قيمة لا تطابق أحد الأنواع المسموحة (قائمة hard-coded) لتقليل مخاطر تمرير أسماء ملفات غير متوقعة أو محاولة traversal.
- غير ذلك سيتم إرجاع **400 Bad Request**.

### 4) Rate limiting (حماية من الإفراط)
- يوجد Rate limit داخل middleware على مستوى الـ IP + المسار.
- الحد: **30 طلب / دقيقة**.
- عند تجاوز الحد سيتم إرجاع **429 Too Many Requests**.

### 5) حماية من Query كبيرة الحجم
- إذا كان `request.query` (جزء الاستعلام) كبيرًا جدًا يتم إرجاع **400 Bad Request**.


---

## Endpoints
> جميع الروابط تبدأ بـ `/api`.

### 1) الأذكار
#### جلب الأذكار مع بحث
- **GET** `/api/athkar`
- Query parameters:
  - `keyword` (اختياري) — كلمة بحث ضمن النصوص/المحتوى
  - `category` (اختياري) — فلترة حسب الفئة

مثال:
```bash
curl "http://localhost:3000/api/athkar?keyword=رحمة"
```

---

### 2) أدعية القرآن
#### جلب أدعية القرآن مع بحث
- **GET** `/api/adaia/quran`
- Query parameters:
  - `keyword` (اختياري)

مثال:
```bash
curl "http://localhost:3000/api/adaia/quran?keyword=إيمان"
```

---

### 3) أدعية السنة
#### جلب أدعية السنة مع بحث
- **GET** `/api/adaia/sunnah`
- Query parameters:
  - `keyword` (اختياري)

مثال:
```bash
curl "http://localhost:3000/api/adaia/sunnah?keyword=صلاة"
```

---

### 4) الأسئلة والأجوبة
#### (أ) جلب الأسئلة
- **GET** `/api/questions`
- Query parameters:
  - `keyword` (اختياري) — ضمن `question_name` أو ضمن الإجابات
  - `level` (اختياري) — مستوى السؤال (`easy|medium|hard` كما هو موجود في البيانات)

مثال:
```bash
curl "http://localhost:3000/api/questions?level=easy&keyword=طهارة"
```

---

#### (ب) أسئلة عشوائية
- **GET** `/api/questions/random`
- Query parameters:
  - `diffuclt` (اختياري) — مستوى الصعوبة: `easy` أو `medium` أو `hard` أو `random` (افتراضيًا: `random`)
  - `count` (اختياري) — عدد الأسئلة العشوائية (افتراضيًا: `1`)

مثال (عشوائي - متوسط - 5 أسئلة):
```bash
curl "http://localhost:3000/api/questions/random?diffuclt=medium&count=5"
```

مثال (عشوائي من أي مستوى):
```bash
curl "http://localhost:3000/api/questions/random?diffuclt=random&count=3"
```

#### (ج) الإصدار الخاص بالاسئلة
- **GET** `/api/questions/version`
مثال:
```bash
curl "http://localhost:3000/api/questions/version"
```

---

## 5) التفاسير (Tafseer)

### (أ) قائمة أنواع التفاسير (Metadata)
- **GET** `/api/quran/tafsser/metadata`

يرجع قائمة فيها الحقول مثل:
- `typeText`
- `typeTextInRelatedLanguage`
- `typeInNativeLanguage`

---

### (ب) تفاصيل نوع تفسير واحد (Metadata)
- **GET** `/api/quran/tafsser/:typeText/metadata`

مثال:
```bash
curl "http://localhost:3000/api/quran/tafsser/ar_muyassar/metadata"
```

إذا لم يوجد النوع سيتم إرجاع 404.

---

### (ج) نصوص التفسير حسب النوع والفلاتر
- **GET** `/api/quran/tafsser/:typeText`
- Query parameters:
  - `keyword` (اختياري)
  - `surah` (اختياري)
  - `ayah` (اختياري)

مثال:
```bash
curl "http://localhost:3000/api/quran/tafsser/ar_muyassar?surah=2&ayah=255"
```

**الرد** (هيكل تقريبي):
```json
{
  "metadata": { "typeText": "..." },
  "data": [
    { "sura": "...", "aya": "...", "text": "..." }
  ]
}
```

---

## 6) نص القرآن

### (أ) النص العادي (Normal Text)
- **GET** `/api/quran/text/normal`
- Query parameters:
  - `surah` (اختياري)
  - `ayah` (اختياري)
  - `keyword` (اختياري)

ملاحظة: البحث عن `keyword` يتم بتنظيف علامات التشكيل وبعض التطبيع للأحرف العربية.

مثال:
```bash
curl "http://localhost:3000/api/quran/text/normal?surah=1&ayah=1"
```

---

### (ب) النص مع حروف/رموز (Glyphs)
- **GET** `/api/quran/text/glyphs`
- Query parameters:
  - `surah` (اختياري)
  - `ayah` (اختياري)
  - `keyword` (اختياري)

الفكرة هنا: يتم جلب بيانات النص من `quran_normal_text.json` ثم يتم محاولة استبدال المحتوى ببيانات `quran.json` (Glyphs) عند تطابق (السورة:الآية).

مثال:
```bash
curl "http://localhost:3000/api/quran/text/glyphs?surah=2&ayah=255"
```

---

## 7) ميتاداتا القرآن (Metadata)

### (أ) الجزو (Juz)
- **GET** `/api/quran/metadata/juz`
- Query parameter:
  - `surah` (اختياري)

---

### (ب) بيانات الصفحة (Page Data)
- **GET** `/api/quran/metadata/page`
- Query parameters:
  - `surah` (اختياري)
  - `ayah` (اختياري)

---

### (ج) الأرباع (Quarters)
- **GET** `/api/quran/metadata/quarters`
- Query parameters:
  - `surah` (اختياري)
  - `ayah` (اختياري)

---

### (د) آيات السجود (Sajdah)
- **GET** `/api/quran/metadata/sajdah`
- Query parameters:
  - `surah` (اختياري)
  - `ayah` (اختياري)

---

### (هـ) السور (Surahs)
- **GET** `/api/quran/metadata/surahs`
- Query parameter:
  - `number` (اختياري)

مثال:
```bash
curl "http://localhost:3000/api/quran/metadata/surahs?number=2"
```

---

## ملاحظات حول الأداء (Caching)
- يتم استخدام Redis عبر مفاتيح Cache تتضمن نوع الـ endpoint وباراميترات الاستعلام.
- في حال فشل Redis أو عدم توفره، سيتم الرجوع للبيانات مباشرة من ملفات JSON.

---

## هيكل البيانات (ملفات داخل مجلد database/)
أهم المسارات:
- `database/athker_adaia/athkar.json`
- `database/athker_adaia/quran_adaia.json`
- `database/athker_adaia/sna_adaia.json`
- `database/questions/questions.json`
- `database/quran/tafsser/*.json` (ملفات التفاسير)
- `database/quran/text/quran_normal_text.json` و `database/quran/text/quran.json`
- `database/quran/metadata/*.json`

---

## تشغيل سريع (Quick Start)
```bash
npm install
npm start
```
ثم جرّب:
```bash
curl "http://localhost:3000/api/quran/tafsser/metadata"
```



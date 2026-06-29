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

---

## قواعد البحث (Query & Validation)
- بعض endpoints تسمح بباراميتر `keyword` للبحث.
- يوجد middleware يفحص `keyword` بحيث:
  - إذا كان موجودًا وكان طوله أقل من **حرفين** سيتم إرجاع **400 Bad Request**.

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
#### جلب الأسئلة
- **GET** `/api/questions`
- Query parameters:
  - `keyword` (اختياري) — ضمن `question_name` أو ضمن الإجابات
  - `level` (اختياري) — مستوى السؤال (كما هو موجود في البيانات)

مثال:
```bash
curl "http://localhost:3000/api/questions?level=1&keyword=طهارة"
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



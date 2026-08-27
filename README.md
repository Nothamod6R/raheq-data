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
- نص القرآن (بشكل عادي أو مع حروف/رموز) (`/api/quran/text/...`) — مع حقل الآيات المتشابهة `similar`
- بيانات ميتاداتا للقرآن (الجزء/الصفحة/الأرباع/السجود/السور) (`/api/quran/metadata/...`)

> ملاحظة: إذا لم يتوفر Redis سيستمر تشغيل الـ API لكن بدون cache.

---
## التوثيق (Swagger UI)

يحتوي هذا المشروع على توثيق تلقائي لواجهة **OpenAPI 3** يتم توليده من مسارات Fastify، ويتم عرضه من خلال **Swagger UI**.

### تشغيل الـ API

```bash
npm install
npm start
```

بشكل افتراضي يعمل الخادم على:

```text
http://localhost:3000
```

ويمكن تغيير المنفذ باستخدام متغير البيئة `PORT`.

تشغيل Redis اختياري؛ تعمل واجهة الـ API بشكل طبيعي بدونه، ولكن لن تتوفر ميزة التخزين المؤقت (Caching).

### Swagger UI

* **التوثيق التفاعلي (Swagger UI):** `http://localhost:3000/docs`
* **OpenAPI JSON:** `http://localhost:3000/docs/json`
* **OpenAPI YAML:** `http://localhost:3000/docs/yaml`

يتم توثيق كل Endpoint مع:

* طريقة HTTP والمسار.
* معاملات المسار (Path Parameters).
* معاملات الاستعلام (Query Parameters).
* جسم الطلب (Request Body) عند وجوده.
* الاستجابات (Responses).
* مخططات الاستجابة (Response Schemas).
* أمثلة واقعية للاستخدام.

كما يتم تنظيم الـ Endpoints ضمن مجموعات مثل:

* **مواقيت الصلاة**
* **الأذكار**
* **الأدعية**
* **القرآن**
* **التفسير**
* **الأسئلة**
* **التقويم الهجري**
* **البيانات الوصفية (Metadata)**

### استخدام "جرّب الآن" (Try it out)

1. افتح Swagger UI من المسار `/docs`.
2. اختر أي Endpoint، مثل `GET /api/prayer-times`.
3. اضغط على **Try it out**.
4. أدخل المعاملات المطلوبة ثم اضغط **Execute**.
5. ستظهر نتيجة الطلب أسفل الواجهة، بما في ذلك:

   * حالة الاستجابة.
   * Headers.
   * محتوى JSON.

كما يتم توثيق استجابات الأخطاء مثل `400` و`404` و`429`.

### تحديث التوثيق عند إضافة Endpoint جديد

1. أضف الـ Route الجديد في `src/route.js` كالمعتاد، **ولا تحتاج إلى إضافة `schema` إلى الـ Route**.

2. أضف التوثيق المقابل له إلى كائن `operations` الموجود في:

```text
src/swagger-docs.js
```

ويجب أن يكون مفتاح الـ operation مطابقًا لمسار الـ Route.

بالنسبة إلى معاملات المسار، استخدم الصيغة:

```text
{param}
```

مثال:

```text
/api/quran/tafsser/{typeText}
```

ويجب أن يتضمن التوثيق، حسب الحاجة:

* `summary`
* `description`
* `parameters`
* `responses`

وبالنسبة إلى القوائم والمخططات القابلة لإعادة الاستخدام، استخدم الـ schemas المشتركة الموجودة في `components` أو `responseSchemas`.

3. بعد ذلك، يتم توليد مواصفات Swagger/OpenAPI تلقائيًا عند تشغيل المشروع، ولا تحتاج إلى أي إعدادات إضافية.

> **ملاحظة:** يتم حقن التوثيق باستخدام `transformObject` في `@fastify/swagger`، ولا تتم إضافة Fastify route schemas إلى المسارات. هذا التصميم يمنع التوثيق من التأثير بشكل غير مقصود على آلية التحقق من الطلبات (Validation) أو تسلسل الاستجابات (Response Serialization).

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

## تشغيل الاختبارات (Tests)

يستخدم المشروع **مزوّد الاختبارات المدمج في Node.js** (`node:test`) ولا يتطلب أي
مكتبات خارجية. لا يحتاج الاختبار إلى Redis؛ فتُستخدم نسخة وهمية (stub) من
الاتصال حتى تعمل الاختبارات دون تشغيل أي خادم.

```bash
npm test
```

الأمر يعادل:

```bash
node --experimental-test-module-mocks --test --test-concurrency=4 'test/*.test.js'
```

> `--experimental-test-module-mocks` ضروري لتجريد (mock) وحدة `index.js` التي
> تُنشئ اتصال Redis. `--test-concurrency=4` يشغّل كل ملف اختبار في عملية مستقلة
> حتى لا يتشاركوا حالة (مثل حد الـ Rate-limiting أو إعدادات البيئة).

الاختبارات تغطي:
- **مواقيت الصلاة**: دقة الحساب مقابل النتائج المرجعية، طرق الحساب والمذاهب،
  والتحقق من المدخلات.
- **التقويم الهجري**: التحويل بين الهجري والميلادي ومعالجة الأخطاء.
- **التحقق من الاستعلامات (middleware)**: حدود `keyword`/`surah`/`ayah`/`level`/
  `number`/`category` و `typeText`، وحماية طول الاستعلام.
- **Rate limiting**: إرجاع `429` عند تجاوز الحد الأقصى للطلبات.
- **الوحدة الخدمية للآيات المتشابهة** (`similar`).
- **وحدات `utils`**: `shuffleArray` و`removeArabicDiacritics` و`readJsonFile`
  و`handleCache`.
- **Controllers البيانات**: الأذكار والأدعية والأسئلة والقرآن.

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
curl "http://localhost:3000/api/quran/text/normal?surah=2&ayah=2"
```

#### الحقل `similar` (الآيات المتشابهة)
- كل آية في الاستجابة تحتوي على حقل إضافي باسم `similar` من نوع **`array of strings`** (مصفوفة نصوص).
- قيمته معرفات الآيات المتشابهة بصيغة `surah:ayah`، مثل: `"8:2"`، `"27:2"`، `"31:3"`.
- يرتبط الحقل بالآية المطلوبة فقط (علاقة باتجاه واحد، ولا تُعاد الآية المعاكسة تلقائيًا).
- إذا لم توجد آيات متشابهة للآية المطلوبة تُرجع المصفوفة الفارغة `[]` (وليس `null`)، ولا يتم حذف الحقل أبدًا.
- البيانات مأخوذة من `database/quran/text/similar.json` وتُحمّل مرة واحدة عند تشغيل الخادم (لا تتم قراءة الملف عند كل طلب).

مثال على الاستجابة:
```json
[
  {
    "surah_number": 2,
    "verse_number": 2,
    "content": "...",
    "similar": [
      "8:2",
      "27:2",
      "31:3"
    ]
  }
]
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

ملاحظة: كل آية في هذا الـ endpoint تحمل أيضًا الحقل `similar` بنفس مواصفات النص العادي أعلاه (مصفوفة نصوص بصيغة `surah:ayah`، وتُرجع `[]` عند عدم وجود آيات متشابهة).

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

<<<<<<< HEAD
## طرق حساب أوقات الصلاة (Calculation Methods)
=======
### (و) تخطيط المصحف (Mushaf Layout)

- **GET** `/api/quran/layout/page/:page`
- Path parameter:
  - `page` (مطلوب): رقم الصفحة من 1 إلى 604.

يعيد هذا الـ Endpoint **تخطيط صفحة المصحف الكاملة** بصيغة **صفحة ← سطر ← كلمة**
دون الحاجة لتخمين فواصل الأسطر من جهة الواجهة. البيانات مصدرها
`database/quran/text/layout/normalized/` (مجموعة `zonetecde/mushaf-layout`
المستوردة بتثبيت commit رقم `72116ce4` — انظر `database/quran/text/layout/README.md`).

تتكون الاستجابة من كائن بصيغة:

```json
{
  "page": 3,
  "lines": [
    { "line": 1, "type": "text", "verseRange": { "start": { "surah": 2, "verse": 6 }, "end": { "surah": 2, "verse": 6 } },
      "words": [
        { "location": "2:6:1", "surah": 2, "verse": 6, "word": 1, "text": "إِنَّ",
          "endOfVerse": false, "glyphs": { "qpc1": "ﭑ", "qpc2": "ﱁ" } }
      ] }
  ]
}
```

- كل سطر له `type`: `surah-header` (رأس سورة)، `basmala`، أو `text`.
- كل كلمة تحمل `location` بصيغة `surah:verse:wordIndex` لربطها ببيانات القرآن
  الموجودة بالفعل (`surah:verse` → `/api/quran/text/...`) دون الحاجة إلى فهرس
  مصفوفة غير مستقر.
- رموز QPC تأتي من المصدر، وهي **منفصلة** عن `qcfData` (المرجع في
  `database/quran/text/quran.json`). القطع/التوافق موضّح في ملف README الخاص
  بالمجموعة.

مثال:
```bash
curl "http://localhost:3000/api/quran/layout/page/1"
```

---

## 8) أوقات الصلاة (Prayer Times)
>>>>>>> 0dfcd93 (Add quran QCF page layout from (https://github.com/zonetecde/mushaf-layout) repo)

| الطريقة                   | Fajr | Isha |
|---------------------------|------|------|
| `muslim_world_league`     | 18°  | 17°  |
| `north_america`           | 15°  | 15°  |
| `egyptian`                | 19.5°| 17.5°|
| `umm_al_qura`              | 18.5°| Maghrib + 90 دقيقة (120 دقيقة في رمضان) |
| `karachi`                 | 18°  | 18°  |
| `gulf_region`              | 19.5°| Maghrib + 90 دقيقة |
| `kuwait`                  | 18°  | 17.5°|
| `qatar`                   | 18°  | Maghrib + 90 دقيقة |
| `singapore`                | 20°  | 18°  |
| `france`                  | 12°  | 12°  |
| `turkey`                  | 18°  | 17°  |
| `russia`                  | 16°  | 15°  |
| `moonsighting_committee`   | 18°  | 18°  |
| `dubai`                   | 18.2°| 18.2°|
| `jakim`                   | 20°  | 18°  |
| `tunisia`                 | 18°  | 18°  |
| `algeria`                 | 18°  | 17°  |
| `indonesia`                | 20°  | 18°  |
| `morocco`                 | 19°  | 17°  |

> القيم السابقة هي معاملات الحساب المستخدمة داخل المحرك، وليست مجرد أسماء للطرق.

---

## طريقة حساب العصر (Madhab)

يتم تحديد وقت صلاة العصر باستخدام `madhab`.

القيم المدعومة:

```text
shafi
hanafi
```

### Shafi

يستخدم معامل ظل:

```text
1
```

مثال:

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=shafi&date=2026-08-11"
```

### Hanafi

يستخدم معامل ظل:

```text
2
```

مثال:

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=hanafi&date=2026-08-11"
```

الاختلاف بين `shafi` و`hanafi` يؤثر على **Asr فقط**، بينما بقية الأوقات تعتمد على الموقع والتاريخ وطريقة الحساب.

---

## الأوقات التي يرجعها API

الـ endpoint يرجع أوقات:

```text
Fajr
Sunrise
Dhuhr
Asr
Maghrib
Isha
```

ويتم إرجاع الأوقات بصيغة:

```text
HH:MM
```

مع التقريب إلى أقرب دقيقة.

مثال تقريبي:

```json
{
  "times": {
    "fajr": "03:43",
    "sunrise": "05:06",
    "dhuhr": "11:39",
    "asr": "15:08",
    "maghrib": "18:13",
    "isha": "19:30"
  }
}
```

### صيغة 12 ساعة (hours_12)

يدعم الـ endpoint معامل استعلام اختياري:

```text
hours_12
```

- النوع: `boolean`
- القيمة الافتراضية: `false`
- القيم المقبولة: `true` / `false` / `1` / `0` / `yes` / `no`

عندما يكون `hours_12=true` يتم إرجاع الأوقات بصيغة 12 ساعة مع لاحقة `AM`/`PM` بدلًا من صيغة 24 ساعة.

مثال:

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=shafi&date=2026-08-11&hours_12=true"
```

مثال على الاستجابة:

```json
{
  "times": {
    "fajr": "03:43 AM",
    "sunrise": "05:06 AM",
    "dhuhr": "11:39 AM",
    "asr": "03:08 PM",
    "maghrib": "06:13 PM",
    "isha": "07:30 PM"
  }
}
```

> ملاحظة: هذا المعامل لا يؤثر على منطق الحساب الفلكي، فقط على صيغة تنسيق النص (Formatting) للأوقات المُرجعة.

---

## طريقة الحساب الفلكية

المحرك الفلكي موجود داخل المشروع ولا يعتمد على مكتبة خارجية أو API خارجي وقت التشغيل.

يتم الحساب اعتمادًا على:

1. تحويل التاريخ الميلادي إلى **Julian Day**.
2. حساب موقع الشمس.
3. حساب:

   * Solar declination
   * Equation of Time
4. حساب الظهر الشمسي (`Dhuhr`) اعتمادًا على خط الطول و`utcOffset`.
5. حساب زوايا الساعة (`Hour Angle`) للأوقات المرتبطة بزاوية الشمس.
6. حساب:

   * Fajr
   * Sunrise
   * Dhuhr
   * Asr
   * Maghrib
   * Isha
7. التعامل مع خطوط العرض العالية والحالات التي لا يمكن فيها الوصول إلى زاوية شمسية معينة.

إذا تعذر حساب وقت معين بسبب الظروف الفلكية، لا يتم إرجاع `NaN` أو `Infinity`، وإنما يمكن أن تكون قيمة الوقت `null`.

---

## Sunrise / Maghrib

يتم حساب الشروق والغروب باستخدام زاوية شمسية تتضمن تأثيرًا تقريبيًا للانكسار وحجم قرص الشمس:

```text
-0.833°
```

لذلك قد تختلف النتائج دقيقة واحدة عن بعض التطبيقات أو المواقع التي تستخدم معاملات مختلفة للـ refraction أو طرق تقريب مختلفة.

---

## Umm al-Qura

طريقة:

```text
umm_al_qura
```

تستخدم:

```text
Fajr = 18.5°
Isha = Maghrib + 90 minutes
```

وخلال شهر رمضان يتم تطبيق قاعدة:

```text
Isha = Maghrib + 120 minutes
```

يتم تحديد رمضان باستخدام جدول بداية الأشهر الهجرية الرسمي الخاص بـ **Umm al-Qura** بدل الاعتماد على تحويل هجري حسابي تقريبي.

خارج نطاق البيانات المتوفرة في الجدول، يتم الرجوع إلى قاعدة `90 minutes` بدل التسبب في فشل الحساب.

---

## Fixed-Minute Isha

بعض طرق الحساب لا تستخدم زاوية فلكية لحساب Isha، وإنما عددًا ثابتًا من الدقائق بعد Maghrib.

في هذه الحالة:

```text
Isha = Maghrib + configured minutes
```

ومن أمثلة الطرق التي تستخدم هذا الأسلوب:

```text
umm_al_qura
gulf_region
qatar
```

حيث تستخدم هذه الطرق `90 minutes` في الحالة العادية.

---

## التعامل مع المناطق عالية خطوط العرض

عند وجود موقع جغرافي لا تصل فيه الشمس إلى الزاوية المطلوبة لـ Fajr أو Isha أو غيرها، لا يقوم المحرك بإرجاع قيم غير صالحة مثل:

```text
NaN
Infinity
```

يتم تطبيق تصحيح مناسب للحالات عالية خطوط العرض، وإذا تعذر الحصول على وقت صالح بعد ذلك، يتم إرجاع:

```json
null
```

بدلًا من قيمة غير صحيحة.

---

## أخطاء التحقق (Validation Errors)

إذا كانت إحدى القيم غير صالحة، يتم إرجاع:

```http
400 Bad Request
```

مثال:

```json
{
  "error": "Invalid latitude"
}
```

أمثلة على القيم غير الصالحة:

```text
latitude > 90
latitude < -90

longitude > 180
longitude < -180

utcOffset خارج النطاق -12..14

method غير مدعومة

madhab غير مدعوم

date بصيغة غير صحيحة

تاريخ غير موجود مثل:
2026-02-30
```

---

## أمثلة عملية

### Doha — MWL — Shafi

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=shafi&date=2026-08-11"
```

نتيجة اختبار:

```json
{
  "times": {
    "fajr": "03:43",
    "sunrise": "05:06",
    "dhuhr": "11:39",
    "asr": "15:08",
    "maghrib": "18:13",
    "isha": "19:30"
  }
}
```

### Doha — MWL — Hanafi

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=hanafi&date=2026-08-11"
```

مثال نتيجة:

```json
{
  "times": {
    "fajr": "03:43",
    "sunrise": "05:06",
    "dhuhr": "11:39",
    "asr": "16:17",
    "maghrib": "18:13",
    "isha": "19:30"
  }
}
```

لاحظ أن الفرق الأساسي بين المثالين هو وقت `Asr`.

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
- `database/quran/text/similar.json` (بيانات الآيات المتشابهة `similar`)
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



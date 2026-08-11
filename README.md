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

## 8) أوقات الصلاة (Prayer Times)

يوفر الـ API حساب أوقات الصلاة اعتمادًا على **الإحداثيات الجغرافية والتاريخ وطريقة الحساب والمذهب**.

يتم حساب أوقات الصلاة محليًا داخل الخادم باستخدام محرك فلكي مدمج، ولا يعتمد endpoint على API خارجي وقت التشغيل.

### Endpoint

* **GET** `/api/prayer-times`

### Query Parameters

| Parameter   | النوع  | مطلوب | الوصف                                                                                     |
| ----------- | ------ | ----- | ----------------------------------------------------------------------------------------- |
| `latitude`  | number | نعم   | خط العرض، من `-90` إلى `90`                                                               |
| `longitude` | number | نعم   | خط الطول، من `-180` إلى `180`                                                             |
| `utcOffset` | number | نعم   | فرق التوقيت عن UTC، من `-12` إلى `14`، ويدعم القيم العشرية مثل `5.5`                      |
| `method`    | string | نعم   | طريقة حساب أوقات الصلاة                                                                   |
| `madhab`    | string | نعم   | طريقة حساب العصر: `shafi` أو `hanafi`                                                     |
| `date`      | string | لا    | التاريخ بصيغة `YYYY-MM-DD`، وإذا لم يتم إرساله يتم استخدام التاريخ المحلي حسب `utcOffset` |

### مثال

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=shafi&date=2026-08-11"
```

---

### `latitude`

خط العرض للموقع.

القيم المسموحة:

```text
-90 .. 90
```

مثال الدوحة:

```text
25.2854
```

---

### `longitude`

خط الطول للموقع.

القيم المسموحة:

```text
-180 .. 180
```

مثال الدوحة:

```text
51.531
```

---

### `utcOffset`

فرق التوقيت المحلي عن UTC.

القيم المسموحة:

```text
-12 .. 14
```

ويدعم القيم العشرية، مثل:

```text
5.5
5.75
```

مثال قطر:

```text
utcOffset=3
```

> يجب إرسال الـ UTC offset الخاص بالموقع والتاريخ المطلوب. الـ API لا يعتمد على timezone الخاص بالسيرفر لحساب أوقات الصلاة.

---

### `date`

التاريخ المطلوب بصيغة:

```text
YYYY-MM-DD
```

مثال:

```text
date=2026-08-11
```

إذا لم يتم إرسال `date`، يتم تحديد التاريخ المحلي باستخدام `utcOffset` بدل الاعتماد على تاريخ UTC الخاص بالسيرفر.

مثال:

```bash
curl "http://localhost:3000/api/prayer-times?latitude=25.2854&longitude=51.531&utcOffset=3&method=muslim_world_league&madhab=shafi"
```

---

## طرق حساب الصلاة (Calculation Methods)

يدعم `/api/prayer-times` الطرق التالية:

| Method                   |  Fajr |   Isha |
| ------------------------ | ----: | -----: |
| `muslim_world_league`    |   18° |    17° |
| `north_america`          |   15° |    15° |
| `egyptian`               | 19.5° |  17.5° |
| `umm_al_qura`            | 18.5° | 90 min |
| `karachi`                |   18° |    18° |
| `gulf_region`            | 19.5° | 90 min |
| `kuwait`                 |   18° |    18° |
| `qatar`                  |   18° | 90 min |
| `singapore`              |   20° |    18° |
| `france`                 |   12° |    12° |
| `turkey`                 |   18° |    17° |
| `russia`                 |   16° |    15° |
| `moonsighting_committee` |   18° |    18° |
| `dubai`                  | 18.2° |  18.2° |
| `jakim`                  |   20° |    18° |
| `tunisia`                |   18° |    18° |
| `algeria`                |   18° |    17° |
| `indonesia`              |   20° |    18° |
| `morocco`                |   19° |    17° |

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

## التحقق من دقة الحساب

تم اختبار محرك أوقات الصلاة باستخدام مواقع جغرافية مختلفة في نصفي الكرة الأرضية، بالإضافة إلى تواريخ مختلفة خلال السنة.

من أمثلة الاختبارات:

* Doha
* Cairo
* London
* New York
* Jakarta
* Sydney

كما تم اختبار:

* MWL
* Egyptian
* North America
* Qatar
* Indonesia
* Shafi
* Hanafi
* الإحداثيات السالبة
* فروقات UTC الصحيحة والعشرية
* المناطق ذات خطوط العرض العالية
* الانقلاب الشتوي
* اختلاف المنطقة الزمنية للسيرفر عن المنطقة المطلوبة
* حدود منتصف الليل المحلي

النتائج الخارجية أظهرت أن معظم الأوقات تتطابق مع المصادر المرجعية ضمن **0–1 دقيقة**، مع إمكانية وجود اختلافات بسيطة بسبب طريقة التقريب أو معاملات الانكسار الشمسي المستخدمة من كل مصدر.

> المصادر الخارجية تستخدم للتحقق والاختبار فقط، ولا يعتمد الـ API عليها وقت التشغيل.

---

## ملاحظة مهمة حول UTC Offset

الـ API يعتمد على `utcOffset` الذي يرسله العميل.

لذلك، عند استخدام التطبيق في منطقة تعتمد على **التوقيت الصيفي (DST)**، يجب إرسال قيمة الـ UTC offset الصحيحة للتاريخ المطلوب.

مثال:

```text
London - Winter:
utcOffset=0

London - Summer:
utcOffset=1
```

وكذلك Sydney:

```text
Sydney - Winter:
utcOffset=10

Sydney - Summer:
utcOffset=11
```

لذلك يفضل أن يقوم العميل بحساب الـ offset الصحيح حسب الموقع والتاريخ بدل تخزين قيمة ثابتة طوال السنة.

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



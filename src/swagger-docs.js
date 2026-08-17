export const components = {
  Error: {
    type: 'object',
    description: 'Standard error payload used for 400 and 429 responses.',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' }
    },
    required: ['error', 'message']
  },
  HijriError: {
    type: 'object',
    description: 'Error payload returned by the /api/hijri/* endpoints.',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    },
    required: ['success', 'message']
  },
  NotFoundError: {
    type: 'object',
    properties: {
      error: { type: 'string', example: 'Not Found' },
      message: { type: 'string' }
    },
    required: ['error', 'message']
  },
  PrayerMetadata: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Fajr'
          },
          arabicName: {
            type: 'string',
            example: 'الفجر'
          },
          rakahs: {
            type: 'integer',
            example: 2
          },
          sajdahs: {
            type: 'integer',
            example: 4
          },
          sunnahBefore: {
            oneOf: [
              {
                type: 'integer'
              },
              {
                type: 'array',
                items: {
                  type: 'integer'
                }
              }
            ],
            example: 2
          },
          sunnahAfter: {
            type: 'integer',
            example: 0
          }
        },
        required: [
          'name',
          'arabicName',
          'rakahs',
          'sajdahs',
          'sunnahBefore',
          'sunnahAfter'
        ]
      },

  AthkarItem: {
    type: 'object',
    description: 'A single dhikr within an athkar category.',
    properties: {
      id: { type: 'integer', description: 'Item id within the category.' },
      text: { type: 'string', description: 'The dhikr (remembrance) text.' },
      count: { type: 'integer', description: 'Number of repetitions prescribed.' }
    },
    required: ['id', 'text', 'count']
  },
  AthkarCategory: {
    type: 'object',
    description: 'A category of athkar with its list of items.',
    properties: {
      id: { type: 'integer', description: 'Category id.' },
      category: { type: 'string', description: 'Category name (Arabic).' },
      array: {
        type: 'array',
        description: 'List of athkar items in this category.',
        items: { $ref: '#/components/schemas/AthkarItem' }
      }
    },
    required: ['id', 'category', 'array']
  },
  DuaItem: {
    type: 'object',
    description: 'A dua (supplication) with its reference.',
    properties: {
      reference: { type: 'string', description: 'Reference/source of the dua (e.g. a surah:ayah, hadith source).' },
      text: { type: 'string', description: 'The dua text.' }
    },
    required: ['reference', 'text']
  },
  Question: {
    type: 'object',
    description: 'A multiple-choice Islamic question.',
    properties: {
      id: { type: 'integer', description: 'Question id.' },
      level: {
        type: 'string',
        description: 'Question difficulty level.',
        enum: ['easy', 'medium', 'hard']
      },
      question_name: { type: 'string', description: 'The question text (Arabic).' },
      answers: {
        type: 'array',
        description: 'Possible answers (Arabic).',
        items: { type: 'string' }
      },
      correct_answer: { type: 'integer', description: 'Index of the correct answer within `answers`.' }
    },
    required: ['id', 'level', 'question_name', 'answers', 'correct_answer']
  },
  QuestionVersion: {
    type: 'object',
    description: 'Version of the questions dataset.',
    properties: {
      version: { type: 'integer', description: 'Questions dataset version number.' }
    },
    required: ['version']
  },
  TafseerMeta: {
    type: 'object',
    description: 'Metadata about a single tafseer (Quran interpretation).',
    properties: {
      typeText: { type: 'string', description: 'Tafseer type identifier used in the route path.' },
      typeTextInRelatedLanguage: { type: 'string', description: 'Tafseer name in its related language.' },
      typeInNativeLanguage: { type: 'string', description: 'Tafseer language.' }
    },
    required: ['typeText', 'typeTextInRelatedLanguage', 'typeInNativeLanguage']
  },
  TafseerEntry: {
    type: 'object',
    description: 'A single tafseer entry for one ayah.',
    properties: {
      id: { type: 'integer' },
      sura: { type: 'integer', description: 'Surah number (1-114).' },
      aya: { type: 'integer', description: 'Ayah number within the surah.' },
      text: { type: 'string', description: 'The tafseer text.' }
    },
    required: ['id', 'sura', 'aya', 'text']
  },
  TafseerResponse: {
    type: 'object',
    description: 'Filtered tafseer entries together with the tafseer metadata.',
    properties: {
      metadata: { $ref: '#/components/schemas/TafseerMeta' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/TafseerEntry' }
      }
    },
    required: ['metadata', 'data']
  },
  Verse: {
    type: 'object',
    description: 'A Quran verse in plain (diacritic-free) text.',
    properties: {
      surah_number: { type: 'integer', description: 'Surah number (1-114).' },
      verse_number: { type: 'integer', description: 'Verse number within the surah.' },
      content: { type: 'string', description: 'Verse text.' },
      similar: {
        type: 'array',
        description: 'Similar verses references in the form "surah:ayah".',
        items: { type: 'string', example: '2:282' }
      }
    },
    required: ['surah_number', 'verse_number', 'content', 'similar']
  },
  GlyphVerse: {
    type: 'object',
    description: 'A Quran verse with full glyph rendering (QCF) data.',
    properties: {
      surah_number: { type: 'integer', description: 'Surah number (1-114).' },
      verse_number: { type: 'integer', description: 'Verse number within the surah.' },
      qcfData: { type: 'string', description: 'QCF glyph encoded text of the verse.' },
      content: { type: 'string', description: 'Verse text with diacritics.' },
      similar: {
        type: 'array',
        description: 'Similar verses references in the form "surah:ayah".',
        items: { type: 'string', example: '2:282' }
      }
    },
    required: ['surah_number', 'verse_number', 'qcfData', 'content', 'similar']
  },
  Juz: {
    type: 'object',
    description: 'A juz (one of 30 parts) of the Quran.',
    properties: {
      id: { type: 'integer', description: 'Juz number (1-30).' },
      surahs: {
        type: 'array',
        description: 'Surah numbers included in this juz.',
        items: { type: 'integer' }
      },
      verses: {
        type: 'object',
        description: 'Verse ranges per surah. Keys are surah numbers, values are [start, end].',
        additionalProperties: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: { type: 'integer' }
        }
      }
    },
    required: ['id', 'surahs', 'verses']
  },
  PageData: {
    type: 'object',
    description: 'A Quran page definition (start and end verse of each page).',
    properties: {
      surah: { type: 'integer', description: 'Surah number (1-114).' },
      start: { type: 'integer', description: 'First verse of the page.' },
      end: { type: 'integer', description: 'Last verse of the page.' }
    },
    required: ['surah', 'start', 'end']
  },
  Quarter: {
    type: 'object',
    description: 'A hizb quarter marker (used by quarters and sajdah endpoints).',
    properties: {
      surah: { type: 'integer', description: 'Surah number (1-114).' },
      ayah: { type: 'integer', description: 'Ayah number within the surah.' }
    },
    required: ['surah', 'ayah']
  },
  Surah: {
    type: 'object',
    description: 'Metadata describing a surah.',
    properties: {
      number: { type: 'integer', description: 'Surah number (1-114).' },
      name: { type: 'string', description: 'Surah name in Arabic.' },
      englishName: { type: 'string', description: 'Surah name transliteration.' },
      englishNameTranslation: { type: 'string', description: 'English translation of the surah name.' },
      numberOfAyahs: { type: 'integer', description: 'Total number of ayahs.' },
      revelationType: {
        type: 'string',
        description: 'Whether the surah was revealed in Makkah or Madinah.',
        enum: ['Meccan', 'Medinan']
      }
    },
    required: ['number', 'name', 'englishName', 'englishNameTranslation', 'numberOfAyahs', 'revelationType']
  }
};
export const responseSchemas = {
  PrayerTimes: {
    type: 'object',
    description: 'Computed prayer times for a specific date and location.',
    properties: {
      date: { type: 'string', format: 'date', description: 'Date the times were computed for (YYYY-MM-DD).' },
      location: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude used for the calculation.' },
          longitude: { type: 'number', description: 'Longitude used for the calculation.' },
          utcOffset: { type: 'number', description: 'UTC offset (in hours) used for the calculation.' }
        },
        required: ['latitude', 'longitude', 'utcOffset']
      },
      calculation: {
        type: 'object',
        description: 'Calculation method and Asr madhab used.',
        properties: {
          method: { type: 'string', description: 'Calculation method used.' },
          madhab: { type: 'string', enum: ['shafi', 'hanafi'], description: 'Asr madhab used.' }
        },
        required: ['method', 'madhab']
      },
      times: {
        type: 'object',
        description: 'The five daily prayers plus sunrise, formatted as HH:MM local time.',
        properties: {
          fajr: { type: 'string', description: 'Dawn prayer time (HH:MM).' },
          sunrise: { type: 'string', description: 'Sunrise time (HH:MM).' },
          dhuhr: { type: 'string', description: 'Noon prayer time (HH:MM).' },
          asr: { type: 'string', description: 'Afternoon prayer time (HH:MM).' },
          maghrib: { type: 'string', description: 'Sunset prayer time (HH:MM).' },
          isha: { type: 'string', description: 'Night prayer time (HH:MM).' }
        },
        required: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
      }
    },
    required: ['date', 'location', 'calculation', 'times']
  },
  HijriDate: {
    type: 'object',
    description: 'A date expressed in the Hijri (Islamic) calendar.',
    properties: {
      year: { type: 'integer', description: 'Hijri year.' },
      month: { type: 'integer', description: 'Hijri month (1-12).' },
      day: { type: 'integer', description: 'Day of the month (1-30).' },
      monthName: { type: 'string', description: 'Hijri month name in Arabic.' },
      formatted: { type: 'string', description: 'Short formatted date, e.g. "3/3/1448 هـ".' },
      formattedArabic: { type: 'string', description: 'Long Arabic formatted date, e.g. "3 ربيع الأول 1448 هـ".' }
    },
    required: ['year', 'month', 'day', 'monthName', 'formatted', 'formattedArabic']
  },
  GregorianDate: {
    type: 'object',
    description: 'A date expressed in the Gregorian calendar.',
    properties: {
      year: { type: 'integer' },
      month: { type: 'integer', description: 'Gregorian month (1-12).' },
      day: { type: 'integer' },
      formatted: { type: 'string', description: 'Formatted date, e.g. "16/08/2026 م".' }
    },
    required: ['year', 'month', 'day', 'formatted']
  },
  HijriToday: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      gregorian: { type: 'string', format: 'date', description: 'Today s Gregorian date (YYYY-MM-DD).' },
      daysOffset: { type: 'integer', description: 'Day offset applied to today (same as the `days` query).' },
      hijri: { $ref: '#/components/schemas/HijriDate' }
    },
    required: ['success', 'gregorian', 'daysOffset', 'hijri']
  },
  HijriFromGregorian: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      input: { type: 'string', format: 'date', description: 'Gregorian input date (YYYY-MM-DD).' },
      hijri: { $ref: '#/components/schemas/HijriDate' }
    },
    required: ['success', 'input', 'hijri']
  },
  HijriToGregorian: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      input: {
        type: 'object',
        description: 'Hijri input date.',
        properties: {
          year: { type: 'integer' },
          month: { type: 'integer' },
          day: { type: 'integer' }
        },
        required: ['year', 'month', 'day']
      },
      gregorian: { $ref: '#/components/schemas/GregorianDate' }
    },
    required: ['success', 'input', 'gregorian']
  }
};

const queryParam = (name, schema, description, required = false) => ({
  name,
  in: 'query',
  description,
  required,
  schema
});

const pathParam = (name, schema, description) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema
});

const json = (schema, example, description = 'Successful response') => ({
  description,
  content: { 'application/json': { schema, example } }
});

const jsonErr = (schema, example, description) => ({
  description,
  content: { 'application/json': { schema, example } }
});

const ERROR_SCHEMA = { $ref: '#/components/schemas/Error' };
const HIJRI_ERROR_SCHEMA = { $ref: '#/components/schemas/HijriError' };
const NOT_FOUND_SCHEMA = { $ref: '#/components/schemas/NotFoundError' };

const BAD_REQUEST = jsonErr(ERROR_SCHEMA, { error: 'Bad Request', message: 'Invalid surah parameter.' }, 'Bad Request - a query/path parameter is invalid.');
const TOO_MANY_REQUESTS = jsonErr(ERROR_SCHEMA, { error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' }, 'Too Many Requests - rate limit exceeded for this IP and route.');

const PRAYER_TIMES_EXAMPLE = {
  date: '2026-08-11',
  location: { latitude: 25.2854, longitude: 51.531, utcOffset: 3 },
  calculation: { method: 'muslim_world_league', madhab: 'shafi' },
  times: { fajr: '03:43', sunrise: '05:06', dhuhr: '11:39', asr: '15:08', maghrib: '18:13', isha: '19:30' }
};

const HIJRI_DATE_EXAMPLE = {
  year: 1448, month: 3, day: 3,
  monthName: 'ربيع الأول',
  formatted: '3/3/1448 هـ',
  formattedArabic: '3 ربيع الأول 1448 هـ'
};

const operations = {
  '/api/athkar': {
    get: {
      tags: ['Athkar'],
      summary: 'List athkar (Islamic remembrances)',
      description: 'Returns athkar grouped by category. Optionally filters by a search keyword and/or a category. Applies the shared search middleware (rate limiting and keyword/category validation). No authentication is required.',
      parameters: [
        queryParam('keyword', { type: 'string' }, 'Search term. Matches against the dhikr text and category names. When present it must be 2-100 characters.', false),
        queryParam('category', { type: 'string', maxLength: 60 }, 'Filter athkar by category name (max 60 characters). Categories are stored in Arabic.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/AthkarCategory' } }, [
          { id: 1, category: 'أذكار الصباح', array: [{ id: 1, text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ ...', count: 1 }] }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
  '/api/adaia/quran': {
    get: {
      tags: ['Dua'],
      summary: 'List dua (supplications) from the Quran',
      description: 'Returns supplications taken from the Quran. Optionally filters by a search keyword matched against the dua text or its reference. Applies the shared search middleware.',
      parameters: [
        queryParam('keyword', { type: 'string' }, 'Search term matching the dua text or reference. When present it must be 2-100 characters.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/DuaItem' } }, [
          { reference: 'الفاتحة', text: '" بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ..."' }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
  '/api/adaia/sunnah': {
    get: {
      tags: ['Dua'],
      summary: 'List dua (supplications) from the Sunnah',
      description: 'Returns supplications attributed to the Prophet (peace be upon him). Optionally filters by a search keyword matched against the dua text or its hadith reference. Applies the shared search middleware.',
      parameters: [
        queryParam('keyword', { type: 'string' }, 'Search term matching the dua text or reference. When present it must be 2-100 characters.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/DuaItem' } }, [
          { reference: 'متفق عليه', text: 'اللهم لك الحمد أنت نور السماوات والأرض ...' }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
'/api/questions': {
    get: {
      tags: ['Questions'],
      summary: 'List Islamic questions',
      description: 'Returns multiple-choice Islamic questions. Optionally filters by a difficulty level and/or a search keyword matched against the question text or answers. Applies the shared search middleware.',
      parameters: [
        queryParam('keyword', { type: 'string' }, 'Search term matching the question or its answers. When present it must be 2-100 characters.', false),
        queryParam('level', { type: 'string', enum: ['easy', 'medium', 'hard'] }, 'Filter by question difficulty. The stored levels are "easy", "medium" or "hard".', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Question' } }, [
          {
            id: 1,
            level: 'easy',
            question_name: 'ما هي أول سورة نزلت في القرآن الكريم؟',
            answers: ['سورة الفاتحة', 'سورة العلق', 'سورة الإخلاص', 'سورة البقرة'],
            correct_answer: 1
          }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
  '/api/questions/random': {
    get: {
      tags: ['Questions'],
      summary: 'Get random Islamic questions',
      description: 'Returns a random selection of Islamic questions. Difficulty (`diffuclt`) selects the pool; if it is not one of the known levels a random level is chosen. `count` controls how many questions are returned (defaults to 1). Applies the shared search middleware.',
      parameters: [
        queryParam('diffuclt', { type: 'string', enum: ['random', 'easy', 'medium', 'hard'] }, 'Difficulty of the questions to pick from. Anything other than easy/medium/hard behaves as "random".', false),
        queryParam('count', { type: 'integer', minimum: 1 }, 'Number of random questions to return. Defaults to 1 when omitted or invalid.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Question' } }, [
          {
            id: 4,
            level: 'hard',
            question_name: 'كم عدد سور القرآن الكريم؟',
            answers: ['100 سورة', '114 سورة', '120 سورة', '110 سورة'],
            correct_answer: 1
          }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
  '/api/questions/version': {
    get: {
      tags: ['Questions'],
      summary: 'Get questions dataset version',
      description: 'Returns the version number of the questions dataset (read from the first element of the questions file).',
      parameters: [],
      responses: {
        200: json({ $ref: '#/components/schemas/QuestionVersion' }, { version: 1 })
      }
    }
  },
'/api/prayer-times': {
    get: {
      tags: ['Prayer Times'],
      summary: 'Get prayer times for a date and location',
      description: 'Computes the five daily prayer times (plus sunrise) for a given date, coordinates and UTC offset using the requested calculation method and Asr madhab.\n\nThe following calculation methods are supported:\n- `muslim_world_league` (18\u00b0 / 17\u00b0)\n- `north_america` (15\u00b0 / 15\u00b0)\n- `egyptian` (19.5\u00b0 / 17.5\u00b0)\n- `umm_al_qura` (18.5\u00b0 Fajr; Isha is 90 minutes after Maghrib, and 120 minutes during Ramadan)\n- `karachi` (18\u00b0 / 18\u00b0)\n- `gulf_region` (19.5\u00b0 / 90 min)\n- `kuwait` (18\u00b0 / 17.5\u00b0)\n- `qatar` (18\u00b0 / 90 min)\n- `singapore` (20\u00b0 / 18\u00b0)\n- `france` (12\u00b0 / 12\u00b0)\n- `turkey` (18\u00b0 / 17\u00b0)\n- `russia` (16\u00b0 / 15\u00b0)\n- `moonsighting_committee` (18\u00b0 / 18\u00b0)\n- `dubai` (18.2\u00b0 / 18.2\u00b0)\n- `jakim` (20\u00b0 / 18\u00b0)\n- `tunisia` (18\u00b0 / 18\u00b0)\n- `algeria` (18\u00b0 / 17\u00b0)\n- `indonesia` (20\u00b0 / 18\u00b0)\n- `morocco` (19\u00b0 / 17\u00b0)\n\nAsr madhabs: `shafi` (factor 1) and `hanafi` (factor 2). The `utcOffset` must reflect the client local time for the requested date (including DST when applicable); it is not inferred by the server.',
      parameters: [
        queryParam('latitude', { type: 'number', minimum: -90, maximum: 90 }, 'Latitude of the location.', true),
        queryParam('longitude', { type: 'number', minimum: -180, maximum: 180 }, 'Longitude of the location.', true),
        queryParam('utcOffset', { type: 'number', minimum: -12, maximum: 14 }, 'UTC offset in hours for the location (fractional offsets such as 5.5 are supported).', true),
        queryParam('method', { type: 'string', enum: ['muslim_world_league', 'north_america', 'egyptian', 'umm_al_qura', 'karachi', 'gulf_region', 'kuwait', 'qatar', 'singapore', 'france', 'turkey', 'russia', 'moonsighting_committee', 'dubai', 'jakim', 'tunisia', 'algeria', 'indonesia', 'morocco'] }, 'Calculation method. Must be one of the supported methods.', true),
        queryParam('madhab', { type: 'string', enum: ['shafi', 'hanafi'] }, 'Asr madhab calculation.', true),
        queryParam('date', { type: 'string', format: 'date' }, 'Date in YYYY-MM-DD format. Defaults to the current local date computed from `utcOffset`.', false)
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/PrayerTimes' }, PRAYER_TIMES_EXAMPLE),
        400: jsonErr({ type: 'object', properties: { error: { type: 'string' } }, required: ['error'] }, { error: 'Invalid latitude' }, 'Bad Request - one of latitude, longitude, utcOffset, method, madhab or date is invalid.')
      }
    }
  },
'/api/prayer/metadata': {
  get: {
    tags: ['Prayer MetaData'],
    summary: 'Get prayer metadata',
    description:
      'Get metadata for a prayer including its name, Arabic name, rakahs, sajdahs, and sunnah information.',
    parameters: [
      queryParam(
        'prayer',
        {
          type: 'string',
          enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
        },
        'Prayer name.',
        true
      )
    ],
    responses: {
      200: json(
        {
          type: 'object',
          properties: {
            data: {
              $ref: '#/components/schemas/PrayerMetadata'
            }
          },
          required: ['data']
        },
        PRAYER_METADATA_EXAMPLE
      ),

      400: jsonErr(
        {
          type: 'object',
          properties: {
            error: {
              type: 'string'
            }
          },
          required: ['error']
        },
        {
          error: 'Invalid prayer name'
        },
        'Bad Request - prayer must be one of fajr, dhuhr, asr, maghrib or isha.'
      )
    }
  }
},
  '/api/hijri/today': {
    get: {
      tags: ['Hijri Calendar'],
      summary: 'Get today date in the Hijri calendar',
      description: 'Returns today date converted to the Hijri (Islamic) calendar. An optional day offset can be applied.',
      parameters: [
        queryParam('days', { type: 'integer' }, 'Day offset to apply to today (may be negative). Defaults to 0.', false)
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/HijriToday' }, {
          success: true,
          gregorian: '2026-08-16',
          daysOffset: 0,
          hijri: HIJRI_DATE_EXAMPLE
        }),
        400: jsonErr(HIJRI_ERROR_SCHEMA, { success: false, message: 'Invalid days value' }, 'Bad Request - the days value is not a valid number.')
      }
    }
  },
'/api/hijri/from-gregorian': {
    get: {
      tags: ['Hijri Calendar'],
      summary: 'Convert a Gregorian date to Hijri',
      description: 'Converts a Gregorian date (YYYY-MM-DD) to the Hijri calendar. When `date` is omitted today date is used.',
      parameters: [
        queryParam('date', { type: 'string', format: 'date' }, 'Gregorian date to convert in YYYY-MM-DD format. Defaults to today.', false)
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/HijriFromGregorian' }, {
          success: true,
          input: '2026-08-16',
          hijri: HIJRI_DATE_EXAMPLE
        }),
        400: jsonErr(HIJRI_ERROR_SCHEMA, { success: false, message: 'Invaild date' }, 'Bad Request - the date could not be parsed.')
      }
    }
  },
  '/api/hijri/to-gregorian': {
    get: {
      tags: ['Hijri Calendar'],
      summary: 'Convert a Hijri date to Gregorian',
      description: 'Converts a Hijri (year, month, day) date to the Gregorian calendar. All three values are required; month must be 1-12 and day must be 1-30.',
      parameters: [
        queryParam('year', { type: 'integer' }, 'Hijri year.', true),
        queryParam('month', { type: 'integer', minimum: 1, maximum: 12 }, 'Hijri month (1-12).', true),
        queryParam('day', { type: 'integer', minimum: 1, maximum: 30 }, 'Hijri day (1-30).', true)
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/HijriToGregorian' }, {
          success: true,
          input: { year: 1448, month: 3, day: 3 },
          gregorian: { year: 2026, month: 8, day: 16, formatted: '16/08/2026 م' }
        }),
        400: jsonErr(HIJRI_ERROR_SCHEMA, { success: false, message: 'You should send this query (month, year, day)' }, 'Bad Request - required params missing, or the Hijri date values are invalid.')
      }
    }
  },
'/api/quran/tafsser/metadata': {
    get: {
      tags: ['Tafsir'],
      summary: 'List available tafseer (interpretations)',
      description: 'Returns metadata for every supported tafseer type, including its identifier, localized name and the language it is written in.',
      parameters: [],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/TafseerMeta' } }, [
          { typeText: 'ar_muyassar', typeTextInRelatedLanguage: 'التفسير الميسر', typeInNativeLanguage: 'العربية' },
          { typeText: 'en_sahih', typeTextInRelatedLanguage: 'English - Sahih International', typeInNativeLanguage: 'English' }
        ])
      }
    }
  },
  '/api/quran/tafsser/{typeText}/metadata': {
    get: {
      tags: ['Tafsir'],
      summary: 'Get metadata for a single tafseer',
      description: 'Returns the metadata of a single tafseer identified by its `typeText` identifier. Returns 404 when the tafseer type is not supported.',
      parameters: [
        pathParam('typeText', { type: 'string' }, 'Tafseer type identifier (e.g. "ar_muyassar", "en_sahih", "katheer"). Must be one of the supported values.')
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/TafseerMeta' }, { typeText: 'ar_muyassar', typeTextInRelatedLanguage: 'التفسير الميسر', typeInNativeLanguage: 'العربية' }),
        404: jsonErr(NOT_FOUND_SCHEMA, { error: 'Not Found', message: "ERROR: Can't found the tafsser." }, 'Not Found - the tafseer type does not exist.')
      }
    }
  },
  '/api/quran/tafsser/{typeText}': {
    get: {
      tags: ['Tafsir'],
      summary: 'Get filtered tafseer text',
      description: 'Returns the tafseer text for a given tafseer type, optionally filtered by surah, ayah and/or a search keyword. The response includes the tafseer metadata and the filtered entries. Applies the shared search middleware, including validation of the `typeText` path parameter against the supported list.',
      parameters: [
        pathParam('typeText', { type: 'string' }, 'Tafseer type identifier. Must be one of the supported values (validated by middleware).'),
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter by surah number (1-114).', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter by ayah number within the surah.', false),
        queryParam('keyword', { type: 'string' }, 'Search keyword matched against the tafseer text. When present it must be 2-100 characters.', false)
      ],
      responses: {
        200: json({ $ref: '#/components/schemas/TafseerResponse' }, {
          metadata: { typeText: 'ar_muyassar', typeTextInRelatedLanguage: 'التفسير الميسر', typeInNativeLanguage: 'العربية' },
          data: [{ id: 1, sura: 1, aya: 1, text: 'سورة الفاتحة سميت هذه السورة بالفاتحة؛ لأنه يفتتح بها القرآن العظيم...' }]
        }),
        400: BAD_REQUEST,
        404: jsonErr(NOT_FOUND_SCHEMA, { error: 'Not Found', message: "ERROR: Can't found the tafsser." }, 'Not Found - the tafseer type does not exist.'),
        429: TOO_MANY_REQUESTS
      }
    }
  },
'/api/quran/text/normal': {
    get: {
      tags: ['Quran'],
      summary: 'Get Quran verses in plain text',
      description: 'Returns Quran verses in plain (diacritic-free) Arabic. Each verse includes a list of similar verses. Optionally filters by surah, ayah and/or a search keyword (searched without diacritics). Applies the shared search middleware.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter by surah number (1-114).', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter by ayah number within the surah.', false),
        queryParam('keyword', { type: 'string' }, 'Search keyword matched against the verse text (diacritics are ignored). When present it must be 2-100 characters.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Verse' } }, [
          { surah_number: 1, verse_number: 1, content: 'بسم الله الرحمان الرحيم', similar: [] }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
  '/api/quran/text/glyphs': {
    get: {
      tags: ['Quran'],
      summary: 'Get Quran verses with glyph (QCF) data',
      description: 'Returns Quran verses with full glyph (QCF) rendering data and diacritic-perfect text. Each verse includes a list of similar verses. Optionally filters by surah, ayah and/or a search keyword. Applies the shared search middleware.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter by surah number (1-114).', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter by ayah number within the surah.', false),
        queryParam('keyword', { type: 'string' }, 'Search keyword matched against the verse text (diacritics are ignored). When present it must be 2-100 characters.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/GlyphVerse' } }, [
          { surah_number: 1, verse_number: 1, qcfData: 'ﱁ ﱂ ﱃ ﱄ ﱅ', content: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ', similar: [] }
        ]),
        400: BAD_REQUEST,
        429: TOO_MANY_REQUESTS
      }
    }
  },
'/api/quran/metadata/juz': {
    get: {
      tags: ['Metadata'],
      summary: 'Get juz (parts) metadata',
      description: 'Returns metadata for the 30 juz of the Quran, including the surahs they span and their verse ranges. Optionally filters by surah.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter to juz that contain this surah number.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Juz' } }, [
          { id: 1, surahs: [1, 2], verses: { '1': [1, 7], '2': [1, 141] } }
        ])
      }
    }
  },
  '/api/quran/metadata/page': {
    get: {
      tags: ['Metadata'],
      summary: 'Get page (page_data) metadata',
      description: 'Returns Quran page definitions (start/end verse of each page). Optionally filters by surah and/or ayah.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter pages belonging to this surah.', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter pages that contain this ayah number.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/PageData' } }, [
          { surah: 1, start: 1, end: 7 }
        ])
      }
    }
  },
  '/api/quran/metadata/quarters': {
    get: {
      tags: ['Metadata'],
      summary: 'Get hizb quarter metadata',
      description: 'Returns the marker positions for the hizb quarters of the Quran. Optionally filters by surah and/or ayah.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter quarter markers in this surah.', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter quarter markers at this ayah.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Quarter' } }, [
          { surah: 2, ayah: 26 }
        ])
      }
    }
  },
  '/api/quran/metadata/sajdah': {
    get: {
      tags: ['Metadata'],
      summary: 'Get sajdah (prostration) verses',
      description: 'Returns the Quran verses where prostration (sajdah) is prescribed. Optionally filters by surah and/or ayah.',
      parameters: [
        queryParam('surah', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter prostration verses in this surah.', false),
        queryParam('ayah', { type: 'integer', minimum: 1, maximum: 286 }, 'Filter prostration verse at this ayah.', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Quarter' } }, [
          { surah: 7, ayah: 206 }
        ])
      }
    }
  },
  '/api/quran/metadata/surahs': {
    get: {
      tags: ['Metadata'],
      summary: 'Get surah metadata list',
      description: 'Returns metadata for all surahs. Optionally filters by surah `number`.',
      parameters: [
        queryParam('number', { type: 'integer', minimum: 1, maximum: 114 }, 'Filter to a single surah by number (1-114).', false)
      ],
      responses: {
        200: json({ type: 'array', items: { $ref: '#/components/schemas/Surah' } }, [
          { number: 1, name: 'ٱلْفَاتِحَةِ', englishName: 'Al-Faatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' }
        ])
      }
    }
  }
};
export function applySwaggerDocs(openapiObject) {
  openapiObject.components = openapiObject.components || {};
  openapiObject.components.schemas = Object.assign(
    {},
    openapiObject.components.schemas,
    components,
    responseSchemas
  );

  for (const [path, methods] of Object.entries(operations)) {
    if (!openapiObject.paths[path]) {
      openapiObject.paths[path] = {};
    }
    for (const [method, operation] of Object.entries(methods)) {
      openapiObject.paths[path][method] = operation;
    }
  }

  return openapiObject;
}

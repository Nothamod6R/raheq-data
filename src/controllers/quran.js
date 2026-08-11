import path from 'path';
import { readJsonFile, handleCache, removeArabicDiacritics } from '../utils.js';

const tafaseerMetadata = [
    { typeText: 'ar_muyassar', typeTextInRelatedLanguage: 'التفسير الميسر', typeInNativeLanguage: 'العربية' },
    { typeText: 'en_sahih', typeTextInRelatedLanguage: 'English - Sahih International', typeInNativeLanguage: 'English' },
    { typeText: 'baghawy', typeTextInRelatedLanguage: 'تفسير البغوي', typeInNativeLanguage: 'العربية' },
    { typeText: 'katheer', typeTextInRelatedLanguage: 'تفسير ابن كثير', typeInNativeLanguage: 'العربية' },
    { typeText: 'qortoby', typeTextInRelatedLanguage: 'تفسير القرطبي', typeInNativeLanguage: 'العربية' },
    { typeText: 'sa3dy', typeTextInRelatedLanguage: 'تفسير السعدي', typeInNativeLanguage: 'العربية' },
    { typeText: 'tabary', typeTextInRelatedLanguage: 'تفسير الطبري', typeInNativeLanguage: 'العربية' },
    { typeText: 'waseet', typeTextInRelatedLanguage: 'التفسير الوسيط', typeInNativeLanguage: 'العربية' },
    { typeText: 'tanweer', typeTextInRelatedLanguage: 'تفسير التحرير والتنوير', typeInNativeLanguage: 'العربية' },
    { typeText: 'tafheem', typeTextInRelatedLanguage: 'Tafheem-ul-Quran by Syed Abu-al-A la Maududi', typeInNativeLanguage: 'English' },
    { typeText: 'bn_bengali', typeTextInRelatedLanguage: 'বাংলা ভাষা - মুহিউদ্দীন খান', typeInNativeLanguage: 'Bengali' },
    { typeText: 'bs_korkut', typeTextInRelatedLanguage: 'Bosanski - Korkut', typeInNativeLanguage: 'Bosnian' },
    { typeText: 'de_bubenheim', typeTextInRelatedLanguage: 'Deutsch - Bubenheim & Elyas', typeInNativeLanguage: 'German' },
    { typeText: 'es_navio', typeTextInRelatedLanguage: 'Español - Abdel Ghani Navio', typeInNativeLanguage: 'Spanish' },
    { typeText: 'fr_hamidullah', typeTextInRelatedLanguage: 'Français - Hamidullah', typeInNativeLanguage: 'French' },
    { typeText: 'ha_gumi', typeTextInRelatedLanguage: 'Hausa - Gumi', typeInNativeLanguage: 'Hausa' },
    { typeText: 'id_indonesian', typeTextInRelatedLanguage: 'Indonesian - Bahasa Indonesia', typeInNativeLanguage: 'Indonesian' },
    { typeText: 'indonesian', typeTextInRelatedLanguage: 'Indonesian - Tafsir Jalalayn', typeInNativeLanguage: 'Indonesian' },
    { typeText: 'it_piccardo', typeTextInRelatedLanguage: 'Italiano - Piccardo', typeInNativeLanguage: 'Italian' },
    { typeText: 'ku_asan', typeTextInRelatedLanguage: 'كوردى - برهان محمد أمين', typeInNativeLanguage: 'Kurdish' },
    { typeText: 'ml_abdulhameed', typeTextInRelatedLanguage: 'Malayalam - Abdul Hameed and Kunhi', typeInNativeLanguage: 'Malayalam' },
    { typeText: 'ms_basmeih', typeTextInRelatedLanguage: 'Melayu - Basmeih', typeInNativeLanguage: 'Malay' },
    { typeText: 'nl_siregar', typeTextInRelatedLanguage: 'Dutch - Sofian Siregar', typeInNativeLanguage: 'Dutch' },
    { typeText: 'pr_tagi', typeTextInRelatedLanguage: 'فارسى - حسین تاجی گله داری', typeInNativeLanguage: 'Persian' },
    { typeText: 'pt_elhayek', typeTextInRelatedLanguage: 'Português - El Hayek', typeInNativeLanguage: 'Portuguese' },
    { typeText: 'ru_kuliev', typeTextInRelatedLanguage: 'Русский - Кулиев', typeInNativeLanguage: 'Russian' },
    { typeText: 'russian', typeTextInRelatedLanguage: 'Русский - Кулиев -ас-Саادي', typeInNativeLanguage: 'Russian' },
    { typeText: 'so_abduh', typeTextInRelatedLanguage: 'Somali - Abduh', typeInNativeLanguage: 'Somali' },
    { typeText: 'sq_nahi', typeTextInRelatedLanguage: 'Shqiptar - Efendi Nahi', typeInNativeLanguage: 'Albanian' },
    { typeText: 'sv_bernstrom', typeTextInRelatedLanguage: 'Swedish - Bernström', typeInNativeLanguage: 'Swedish' },
    { typeText: 'sw_barwani', typeTextInRelatedLanguage: 'Swahili - Al-Barwani', typeInNativeLanguage: 'Swahili' },
    { typeText: 'ta_tamil', typeTextInRelatedLanguage: 'தமிழ் - ஜான் டிரஸ்ட்', typeInNativeLanguage: 'Tamil' },
    { typeText: 'th_thai', typeTextInRelatedLanguage: 'ภาษาไทย - ภาษาไทย', typeInNativeLanguage: 'Thai' },
    { typeText: 'tr_diyanet', typeTextInRelatedLanguage: 'Türkçe - Diyanet Isleri', typeInNativeLanguage: 'Turkish' },
    { typeText: 'ur_jalandhry', typeTextInRelatedLanguage: 'اردو - جالندربرى', typeInNativeLanguage: 'Urdu' },
    { typeText: 'uz_sodik', typeTextInRelatedLanguage: 'Uzbek - Мухаммад الصدّيق', typeInNativeLanguage: 'Uzbek' },
    { typeText: 'zh_jian', typeTextInRelatedLanguage: '中国语文 - Ma Jian', typeInNativeLanguage: 'Chinese' }
];

export const getTafseerMetadata = async (request, reply) => {
    return reply.send(tafaseerMetadata);
};

export const getSingleTafseerMetadata = async (request, reply) => {
    const { typeText } = request.params;
    const targetTafseer = tafaseerMetadata.find(t => t.typeText === typeText);
    if (!targetTafseer) {
        return reply.status(404).send({ error: "Not Found", message: "ERROR: Can't found the tafsser." });
    }
    return reply.send(targetTafseer);
};

export const getQuranTafseer = async (request, reply) => {
    const { typeText } = request.params;
    const { keyword, surah, ayah } = request.query;

    const targetTafseer = tafaseerMetadata.find(t => t.typeText === typeText);
    if (!targetTafseer) {
        return reply.status(404).send({ error: "Not Found", message: "ERROR: Can't found the tafsser." });
    }

    const cacheKey = `tafseer:${typeText}:${surah || 'all'}:${ayah || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', 'tafsser', `${typeText}.json`);
        let tafseerData = await readJsonFile(filePath);

        if (surah) {
            const searchSurah = surah.toString().trim();
            tafseerData = tafseerData.filter(item => {
                const itemSurah = (item.sura || item.surah || '').toString().trim();
                return itemSurah === searchSurah;
            });
        }
        if (ayah) {
            const searchAyah = ayah.toString().trim();
            tafseerData = tafseerData.filter(item => {
                const itemAyah = (item.aya || item.ayah || '').toString().trim();
                return itemAyah === searchAyah;
            });
        }
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            tafseerData = tafseerData.filter(item => 
                item.text && item.text.toLowerCase().includes(lowerKeyword)
            );
        }

        return {
            metadata: targetTafseer,
            data: tafseerData
        };
    });

    return reply.send(data);
};

export const getQuranNormalText = async (request, reply) => {
    const { surah, ayah, keyword } = request.query;
    const cacheKey = `quran_text:normal:${surah || 'all'}:${ayah || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const normalPath = path.join(process.cwd(), 'database', 'quran', 'text', 'quran_normal_text.json');
        let quranData = await readJsonFile(normalPath);
        if (surah) {
            const searchSurah = surah.toString().trim();
            quranData = quranData.filter(item => 
                (item.surah_number || item.surah || '').toString().trim() === searchSurah
            );
        }
        if (ayah) {
            const searchAyah = ayah.toString().trim();
            quranData = quranData.filter(item => 
                (item.verse_number || item.verse || item.ayah || item.aya || '').toString().trim() === searchAyah
            );
        }
        if (keyword) {
            const cleanKeyword = removeArabicDiacritics(keyword).toLowerCase();
            quranData = quranData.filter(item => {
                const cleanContent = removeArabicDiacritics(item.content).toLowerCase();
                return cleanContent.includes(cleanKeyword);
            });
        }
        return quranData;
    });

    return reply.send(data);
};

export const getQuranWithGlyphsText = async (request, reply) => {
    const { surah, ayah, keyword } = request.query;
    const cacheKey = `quran_text:glyphs:${surah || 'all'}:${ayah || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const normalPath = path.join(process.cwd(), 'database', 'quran', 'text', 'quran_normal_text.json');
        const glyphsPath = path.join(process.cwd(), 'database', 'quran', 'text', 'quran.json');

        let normalData = await readJsonFile(normalPath);
        const glyphsData = await readJsonFile(glyphsPath);

        if (surah) {
            const searchSurah = surah.toString().trim();
            normalData = normalData.filter(item => 
                (item.surah_number || item.surah || '').toString().trim() === searchSurah
            );
        }
        if (ayah) {
            const searchAyah = ayah.toString().trim();
            normalData = normalData.filter(item => 
                (item.verse_number || item.verse || item.ayah || item.aya || '').toString().trim() === searchAyah
            );
        }
        if (keyword) {
            const cleanKeyword = removeArabicDiacritics(keyword).toLowerCase();
            normalData = normalData.filter(item => {
                const cleanContent = removeArabicDiacritics(item.content).toLowerCase();
                return cleanContent.includes(cleanKeyword);
            });
        }

        const glyphsMap = new Map(
            glyphsData.map(item => [`${item.surah_number}:${item.verse_number}`, item])
        );

        const result = normalData.map(normalItem => {
            const key = `${normalItem.surah_number}:${normalItem.verse_number}`;
            const glyphMatch = glyphsMap.get(key);
            
            return glyphMatch ? glyphMatch : {
                surah_number: normalItem.surah_number,
                verse_number: normalItem.verse_number,
                content: normalItem.content
            };
        });

        return result;
    });

    return reply.send(data);
};


export const getJuzMetadata = async (request, reply) => {
    const { surah } = request.query;
    const cacheKey = `quran_metadata:juz:${surah || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', "metadata", 'juz.json');
        let juzData = await readJsonFile(filePath);
        if (surah) {
            const searchSurah = parseInt(surah, 10);
            juzData = juzData.filter(item => item.surahs && item.surahs.includes(searchSurah));
        }
        return juzData;
    });
    return reply.send(data);
};

export const getPageDataMetadata = async (request, reply) => {
    const { surah, ayah } = request.query;
    const cacheKey = `quran_metadata:page:${surah || 'all'}:${ayah || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', "metadata",'page_data.json');
        let pageData = await readJsonFile(filePath);
        if (surah) {
            const searchSurah = surah.toString().trim();
            pageData = pageData.filter(item => (item.surah || '').toString().trim() === searchSurah);
        }
        if (ayah) {
            const searchAyah = parseInt(ayah, 10);
            pageData = pageData.filter(item => searchAyah >= parseInt(item.start, 10) && searchAyah <= parseInt(item.end, 10));
        }
        return pageData;
    });
    return reply.send(data);
};

export const getQuartersMetadata = async (request, reply) => {
    const { surah, ayah } = request.query;
    const cacheKey = `quran_metadata:quarters:${surah || 'all'}:${ayah || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', "metadata",'quarters.json');
        let quartersData = await readJsonFile(filePath);
        if (surah) {
            const searchSurah = surah.toString().trim();
            quartersData = quartersData.filter(item => (item.surah || '').toString().trim() === searchSurah);
        }
        if (ayah) {
            const searchAyah = ayah.toString().trim();
            quartersData = quartersData.filter(item => (item.ayah || item.aya || '').toString().trim() === searchAyah);
        }
        return quartersData;
    });

    return reply.send(data);
};

export const getSajdahMetadata = async (request, reply) => {
    const { surah, ayah } = request.query;
    const cacheKey = `quran_metadata:sajdah:${surah || 'all'}:${ayah || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', "metadata",'sajdah_verses.json');
        let sajdahData = await readJsonFile(filePath);
        if (surah) {
            const searchSurah = surah.toString().trim();
            sajdahData = sajdahData.filter(item => (item.surah || '').toString().trim() === searchSurah);
        }
        if (ayah) {
            const searchAyah = ayah.toString().trim();
            sajdahData = sajdahData.filter(item => (item.ayah || item.aya || '').toString().trim() === searchAyah);
        }
        return sajdahData;
    });

    return reply.send(data);
};

export const getSurahsMetadata = async (request, reply) => {
    const { number } = request.query;
    const cacheKey = `quran_metadata:surahs:${number || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'quran', "metadata", 'surahs.json');
        let surahsData = await readJsonFile(filePath);
        if (number) {
            const searchNumber = number.toString().trim();
            surahsData = surahsData.filter(item => (item.number || '').toString().trim() === searchNumber);
        }
        return surahsData;
    });
    return reply.send(data);
};


import fs from 'fs/promises';
import path from 'path';
import { redisClient } from '../index.js';

const readJsonFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error While reading file: ${error.message}`);
    }
};

const handleCache = async (cacheKey, fetchFunction) => {
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const freshData = await fetchFunction();
        await redisClient.set(cacheKey, JSON.stringify(freshData));
        return freshData;
    } catch {
        return await fetchFunction();
    }
};

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
    { typeText: 'ta_tamil', typeTextInRelatedLanguage: 'தமிழ் - ஜான் டிரสต์', typeInNativeLanguage: 'Tamil' },
    { typeText: 'th_thai', typeTextInRelatedLanguage: 'ภาษาไทย - ภาษาไทย', typeInNativeLanguage: 'Thai' },
    { typeText: 'tr_diyanet', typeTextInRelatedLanguage: 'Türkçe - Diyanet Isleri', typeInNativeLanguage: 'Turkish' },
    { typeText: 'ur_jalandhry', typeTextInRelatedLanguage: 'اردو - جالندربرى', typeInNativeLanguage: 'Urdu' },
    { typeText: 'uz_sodik', typeTextInRelatedLanguage: 'Uzbek - Мухаммад الصدّيق', typeInNativeLanguage: 'Uzbek' },
    { typeText: 'zh_jian', typeTextInRelatedLanguage: '中国语文 - Ma Jian', typeInNativeLanguage: 'Chinese' }
];

export const getAthkar = async (request, reply) => {
    const { keyword, category } = request.query;
    const cacheKey = `athkar:${category || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'athkar.json');
        let result = await readJsonFile(filePath);

        if (category) {
            result = result.filter(item => item.category.includes(category));
        }

        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            result = result.map(item => {
                const filteredArray = item.array.filter(azkar => 
                    azkar.text.toLowerCase().includes(lowerKeyword)
                );
                if (item.category.toLowerCase().includes(lowerKeyword)) {
                    return item;
                } else if (filteredArray.length > 0) {
                    return { ...item, array: filteredArray };
                }
                return null;
            }).filter(item => item !== null);
        }
        return result;
    });

    return reply.send(data);
};

export const getQuranAdaia = async (request, reply) => {
    const { keyword } = request.query;
    const cacheKey = `quran_adaia:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'quran_adaia.json');
        const fileData = await readJsonFile(filePath);
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return fileData.filter(item => 
                item.text.toLowerCase().includes(lowerKeyword) || 
                item.reference.toLowerCase().includes(lowerKeyword)
            );
        }
        return fileData;
    });

    return reply.send(data);
};

export const getSunnahAdaia = async (request, reply) => {
    const { keyword } = request.query;
    const cacheKey = `sunnah_adaia:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'sna_adaia.json');
        const fileData = await readJsonFile(filePath);
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return fileData.filter(item => 
                item.text.toLowerCase().includes(lowerKeyword) || 
                item.reference.toLowerCase().includes(lowerKeyword)
            );
        }
        return fileData;
    });

    return reply.send(data);
};

export const getQuestions = async (request, reply) => {
    const { keyword, level } = request.query;
    const cacheKey = `questions:${level || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'questions', 'questions.json');
        let filtered = await readJsonFile(filePath);

        if (level) {
            filtered = filtered.filter(q => q.level === level);
        }

        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            filtered = filtered.filter(q => 
                q.question_name.toLowerCase().includes(lowerKeyword) ||
                q.answers.some(ans => ans.toLowerCase().includes(lowerKeyword))
            );
        }
        return filtered;
    });

    return reply.send(data);
};

export const getTafseerMetadata = async (request, reply) => {
    return reply.send(tafaseerMetadata);
};

export const getSingleTafseerMetadata = async (request, reply) => {
    const { typeText } = request.params;
    const targetTafseer = tafaseerMetadata.find(t => t.typeText === typeText);
    if (!targetTafseer) {
        return reply.status(404).send({ error: "Not Found", message: "tafsser not found." });
    }
    return reply.send(targetTafseer);
};

export const getQuranTafseer = async (request, reply) => {
    const { typeText } = request.params;
    const { keyword, surah, ayah } = request.query;

    const targetTafseer = tafaseerMetadata.find(t => t.typeText === typeText);
    if (!targetTafseer) {
        return reply.status(404).send({ error: "Not Found", message: "tafsser not found." });
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
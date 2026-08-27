import {
    getAthkar,
    getQuranAdaia,
    getSunnahAdaia
} from './controllers/athkar.js';
import {
    getQuestions,
    getRandomQuestions,
    getQuestionsVersion
} from './controllers/questions.js';
import {
    getTafseerMetadata,
    getSingleTafseerMetadata,
    getQuranTafseer,
    getQuranNormalText,
    getQuranWithGlyphsText,
    getJuzMetadata,
    getPageDataMetadata,
    getQuartersMetadata,
    getSajdahMetadata,
    getSurahsMetadata,
    getQuranLayoutPage
} from './controllers/quran.js';
import { getPrayerTimes } from './controllers/prayer.js';
import { getPrayerMetadata } from "./services/prayer-metadata.js";
import { validateSearchParams } from './middleware.js';
import {
    getHijriFromGregorian,
    getGregorianFromHijri,
    getTodayHijri
} from './controllers/hijra.js';


export const appRoutes = async (fastify, options) => {
    fastify.get('/api/athkar', { preHandler: [validateSearchParams] }, getAthkar);
    fastify.get('/api/adaia/quran', { preHandler: [validateSearchParams] }, getQuranAdaia);
    fastify.get('/api/adaia/sunnah', { preHandler: [validateSearchParams] }, getSunnahAdaia);

    fastify.get('/api/questions', { preHandler: [validateSearchParams] }, getQuestions);
    fastify.get('/api/questions/random', { preHandler: [validateSearchParams] }, getRandomQuestions);
    fastify.get('/api/questions/version', getQuestionsVersion);

    fastify.get('/api/prayer-times', getPrayerTimes);
    fastify.get('/api/prayer/metadata', getPrayerMetadata);

    fastify.get('/api/hijri/today', getTodayHijri);
    fastify.get('/api/hijri/from-gregorian', getHijriFromGregorian);
    fastify.get('/api/hijri/to-gregorian', getGregorianFromHijri);

    fastify.get('/api/quran/tafsser/metadata', getTafseerMetadata);
    fastify.get('/api/quran/tafsser/:typeText/metadata', getSingleTafseerMetadata);
    fastify.get('/api/quran/tafsser/:typeText', { preHandler: [validateSearchParams] }, getQuranTafseer);

    fastify.get('/api/quran/text/normal', { preHandler: [validateSearchParams] }, getQuranNormalText);
    fastify.get('/api/quran/text/glyphs', { preHandler: [validateSearchParams] }, getQuranWithGlyphsText);

    fastify.get('/api/quran/metadata/juz', getJuzMetadata);
    fastify.get('/api/quran/metadata/page', getPageDataMetadata);
    fastify.get('/api/quran/metadata/quarters', getQuartersMetadata);
    fastify.get('/api/quran/metadata/sajdah', getSajdahMetadata);
    fastify.get('/api/quran/metadata/surahs', getSurahsMetadata);

    fastify.get('/api/quran/layout/page/:page', getQuranLayoutPage);
};

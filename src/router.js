import { 
    getAthkar, 
    getQuranAdaia, 
    getSunnahAdaia, 
    getQuestions, 
    getTafseerMetadata, 
    getSingleTafseerMetadata,
    getQuranTafseer 
} from './controller.js';
import { validateSearchParams } from './middleware.js';

export const appRoutes = async (fastify, options) => {
    fastify.get('/api/athkar', { preHandler: [validateSearchParams] }, getAthkar);
    fastify.get('/api/adaia/quran', { preHandler: [validateSearchParams] }, getQuranAdaia);
    fastify.get('/api/adaia/sunnah', { preHandler: [validateSearchParams] }, getSunnahAdaia);
    fastify.get('/api/questions', { preHandler: [validateSearchParams] }, getQuestions);
    
    fastify.get('/api/quran/tafsser/metadata', getTafseerMetadata);
    fastify.get('/api/quran/tafsser/:typeText/metadata', getSingleTafseerMetadata);
    fastify.get('/api/quran/tafsser/:typeText', { preHandler: [validateSearchParams] }, getQuranTafseer);
};
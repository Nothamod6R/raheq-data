import { readFileSync } from 'node:fs';
import Fastify from 'fastify';
import Redis from 'ioredis';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
import { appRoutes } from './src/route.js';
import { applySwaggerDocs } from './src/swagger-docs.js';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const fastify = Fastify({ logger: false });

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
    if (!isRedisConnected) {
        console.warn("You don't have Redis, the api will running without it.");
        isRedisConnected = true; 
    }
});

redisClient.on('connect', async () => {
    isRedisConnected = true;
    try {
        await redisClient.config('SET', 'maxmemory', '100mb');
        await redisClient.config('SET', 'maxmemory-policy', 'allkeys-lru');
    } catch (e) {}
});

fastify.register(Swagger, {
    openapi: {
        info: {
            title: 'Raheq API',
            version: pkg.version,
            description:
                'Raheq API provides Islamic data and prayer-time services. ' +
                'It exposes Quran text and metadata, tafseer (interpretations), ' +
                'athkar (remembrances) and dua (supplications), a questions bank, ' +
                'Hijri calendar conversions and an astronomical prayer-time ' +
                'calculation engine. All responses are JSON; no authentication is required.',
            contact: { name: pkg.author },
            license: { name: pkg.license }
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Development server' }
        ],
        tags: [
            { name: 'Prayer Times', description: 'Prayer time calculations' },
            { name: 'Athkar', description: 'Islamic athkar (remembrances)' },
            { name: 'Dua', description: 'Supplications from the Quran and Sunnah' },
            { name: 'Quran', description: 'Quran text and verses' },
            { name: 'Tafsir', description: 'Quran interpretations (tafseer)' },
            { name: 'Metadata', description: 'Quran metadata: surahs, juz, pages, quarters, sajdah' },
            { name: 'Questions', description: 'Islamic questions and answers' },
            { name: 'Hijri Calendar', description: 'Gregorian <-> Hijri date conversion' }
        ]
    },
    transformObject: ({ openapiObject }) => applySwaggerDocs(openapiObject)
});

fastify.register(appRoutes);

fastify.register(SwaggerUI, { routePrefix: '/docs' });

const start = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
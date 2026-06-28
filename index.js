import Fastify from 'fastify';
import Redis from 'ioredis';
import { appRoutes } from './src/router.js';

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

fastify.register(appRoutes);

const start = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on port ${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
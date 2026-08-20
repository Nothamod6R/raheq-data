import { mock } from 'node:test';

/**
 * Creates a dummy Redis client that never caches (always a miss).
 * Controllers and utils read `redisClient` from `../index.js`; by stubbing it
 * with this object the real Redis connection (and the auto-started server in
 * index.js) is never set up during tests. The controllers then fall back to
 * reading the JSON data files directly.
 */
export const redisStub = () => ({
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
});

/**
 * Registers a module mock for `../index.js` so its `redisClient` export is
 * replaced with `redisStub()`. Call this at the very top of a test file,
 * *before* `await import('../src/...')` of any module that (transitively)
 * imports `../index.js`.
 */
export const registerRedisMock = () => {
    mock.module('../index.js', {
        namedExports: { redisClient: redisStub() },
    });
};
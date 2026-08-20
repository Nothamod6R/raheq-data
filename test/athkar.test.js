import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { registerRedisMock } from './helpers.js';

registerRedisMock();

const {
    getAthkar,
    getQuranAdaia,
    getSunnahAdaia,
} = await import('../src/controllers/athkar.js');

let app;

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/athkar', getAthkar);
    app.get('/api/adaia/quran', getQuranAdaia);
    app.get('/api/adaia/sunnah', getSunnahAdaia);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

test('GET /api/athkar returns all athkar categories', async () => {
    const res = await app.inject('/api/athkar');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((c) => c.id && c.category && Array.isArray(c.array)));
});

test('GET /api/athkar filters by category', async () => {
    const res = await app.inject('/api/athkar?category=الصباح');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((item) => item.category.includes('الصباح')));
});

test('GET /api/athkar filters by keyword inside items', async () => {
    const res = await app.inject('/api/athkar?keyword=الله');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    const hasAllItemsWithKeyword = body.every(
        (cat) =>
            cat.category.toLowerCase().includes('الله') ||
            cat.array.some((item) => item.text.toLowerCase().includes('الله')),
    );
    assert.equal(hasAllItemsWithKeyword, true);
});

test('GET /api/adaia/quran returns quran duas', async () => {
    const res = await app.inject('/api/adaia/quran');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((item) => item.reference && item.text));
});

test('GET /api/adaia/quran filters by keyword', async () => {
    const res = await app.inject('/api/adaia/quran?keyword=رب');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(
        body.every(
            (item) =>
                item.text.toLowerCase().includes('رب') ||
                item.reference.toLowerCase().includes('رب'),
        ),
    );
});

test('GET /api/adaia/sunnah returns sunnah duas', async () => {
    const res = await app.inject('/api/adaia/sunnah');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((item) => item.reference && item.text));
});

test('GET /api/adaia/sunnah returns known sunnah dua records', async () => {
    const res = await app.inject('/api/adaia/sunnah');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    const references = body.map((item) => item.reference);
    assert.ok(references.includes('متفق عليه'));
});
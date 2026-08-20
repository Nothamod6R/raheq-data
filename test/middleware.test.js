import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';

// Neutralize the rate limiter so validation tests never trip it.
process.env.RATE_LIMIT_MAX_REQUESTS = '1000000';
process.env.RATE_LIMIT_WINDOW_MS = '600000';
process.env.MAX_QUERY_URL_LENGTH = '1000';
process.env.MAX_KEYWORD_LENGTH = '100';
process.env.MIN_KEYWORD_LENGTH = '2';
process.env.MAX_CATEGORY_LENGTH = '60';

const { validateSearchParams } = await import('../src/middleware.js');

let app;
const ok = (request, reply) => reply.send({ ok: true });

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/search', { preHandler: [validateSearchParams] }, ok);
    app.get('/api/tafsser/:typeText', { preHandler: [validateSearchParams] }, ok);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

test('accepts a valid search with a keyword', async () => {
    const res = await app.inject('/api/search?keyword=سلام');
    assert.equal(res.statusCode, 200);
});

test('rejects a keyword that is too long', async () => {
    const res = await app.inject(`/api/search?keyword=${'x'.repeat(101)}`);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), {
        error: 'Bad Request',
        message: 'Keyword is too long. Max length is 100.',
    });
});

test('rejects a keyword that is too short', async () => {
    const res = await app.inject('/api/search?keyword=x');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), {
        error: 'Bad Request',
        message: 'The search word must be at least 2 characters long.',
    });
});

test('rejects a non-string keyword via a direct handler call', async () => {
    const reply = createReply();
    const result = await validateSearchParams(
        {
            ip: '1.1.1.1',
            headers: {},
            raw: { url: '/api/search' },
            routerPath: '/api/search',
            query: { keyword: ['a', 'b'] },
        },
        reply,
    );
    assert.equal(result.code, 400);
    assert.equal(result.payload.message, 'Invalid keyword type.');
});

test('accepts valid surah/ayah boundaries', async () => {
    assert.equal((await app.inject('/api/search?surah=114')).statusCode, 200);
    assert.equal((await app.inject('/api/search?surah=1&ayah=286')).statusCode, 200);
});

test('rejects an out-of-range surah', async () => {
    for (const bad of ['0', '115', 'abc']) {
        const res = await app.inject(`/api/search?surah=${bad}`);
        assert.equal(res.statusCode, 400, `surah=${bad} should fail`);
        assert.equal(res.json().message, 'Invalid surah parameter.');
    }
});

test('rejects an out-of-range ayah', async () => {
    for (const bad of ['0', '287']) {
        const res = await app.inject(`/api/search?ayah=${bad}`);
        assert.equal(res.statusCode, 400, `ayah=${bad} should fail`);
        assert.equal(res.json().message, 'Invalid ayah parameter.');
    }
});

test('rejects an out-of-range level', async () => {
    for (const bad of ['0', '11']) {
        const res = await app.inject(`/api/search?level=${bad}`);
        assert.equal(res.statusCode, 400, `level=${bad} should fail`);
        assert.equal(res.json().message, 'Invalid level parameter.');
    }
    assert.equal((await app.inject('/api/search?level=10')).statusCode, 200);
});

test('rejects an out-of-range number', async () => {
    for (const bad of ['0', '115']) {
        const res = await app.inject(`/api/search?number=${bad}`);
        assert.equal(res.statusCode, 400, `number=${bad} should fail`);
        assert.equal(res.json().message, 'Invalid number parameter.');
    }
    assert.equal((await app.inject('/api/search?number=114')).statusCode, 200);
});

test('accepts a known tafseer typeText', async () => {
    const res = await app.inject('/api/tafsser/ar_muyassar');
    assert.equal(res.statusCode, 200);
});

test('rejects an unknown tafseer typeText', async () => {
    const res = await app.inject('/api/tafsser/not_a_tafseer');
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().message, 'Invalid tafseer type.');
});

test('rejects a category that is too long', async () => {
    const res = await app.inject(`/api/search?category=${'x'.repeat(61)}`);
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().message, 'Category is too long.');
});

test('rejects a non-string category via a direct handler call', async () => {
    const reply = createReply();
    const result = await validateSearchParams(
        {
            ip: '1.1.1.1',
            headers: {},
            raw: { url: '/api/search' },
            routerPath: '/api/search',
            query: { category: { nested: true } },
        },
        reply,
    );
    assert.equal(result.code, 400);
    assert.equal(result.payload.message, 'Invalid category type.');
});

test('rejects a request whose URL exceeds the configured length', async () => {
    const res = await app.inject(`/api/search?keyword=${'y'.repeat(1100)}`);
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().message, 'Request query is too large.');
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function createReply() {
    const reply = {
        status(code) {
            this.code = code;
            return this;
        },
        send(payload) {
            return { code: this.code, payload };
        },
    };
    return reply;
}
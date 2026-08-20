import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';

// Force a low limit so we can reliably observe the 429 response.
process.env.RATE_LIMIT_MAX_REQUESTS = '3';
process.env.RATE_LIMIT_WINDOW_MS = '600000';
process.env.MAX_QUERY_URL_LENGTH = '1000';
process.env.MAX_KEYWORD_LENGTH = '100';
process.env.MIN_KEYWORD_LENGTH = '2';

const { validateSearchParams } = await import('../src/middleware.js');

const IP = '203.0.113.10';

test('returns 429 once the per-route/ip limit is exceeded', async () => {
    const app = Fastify({ logger: false });
    app.get('/api/limited', { preHandler: [validateSearchParams] }, (request, reply) =>
        reply.send({ ok: true }),
    );
    await app.ready();

    const headers = { 'x-forwarded-for': IP };

    // The first RATE_LIMIT_MAX_REQUESTS requests are allowed.
    for (let i = 0; i < 3; i += 1) {
        const res = await app.inject({ method: 'GET', url: '/api/limited', headers });
        assert.equal(res.statusCode, 200, `request ${i + 1} should be allowed`);
    }

    // The next request exceeds the window budget.
    const blocked = await app.inject({ method: 'GET', url: '/api/limited', headers });
    assert.equal(blocked.statusCode, 429);
    assert.deepEqual(blocked.json(), {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Try again later.',
    });

    await app.close();
});
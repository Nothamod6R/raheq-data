import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { registerRedisMock } from './helpers.js';

registerRedisMock();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_NORM = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'normalized');
const LAYOUT_SRC = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'source');

const { getQuranLayoutPage } = await import('../src/controllers/quran.js');

let app;
test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/quran/layout/page/:page', getQuranLayoutPage);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

test('GET /api/quran/layout/page/:page returns a valid page', async () => {
    const res = await app.inject('/api/quran/layout/page/3');
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.page, 3);
    assert.ok(Array.isArray(body.lines));
    assert.ok(body.lines.length > 0);
    const textLine = body.lines.find((l) => l.type === 'text');
    assert.ok(textLine, 'page 3 should contain a text line');
    assert.ok(textLine.words.length > 0);
    assert.match(textLine.words[0].location, /^\d+:\d+:\d+$/);
    assert.ok(textLine.words[0].surah > 0);
    assert.ok(textLine.words[0].verse > 0);
    assert.ok(textLine.words[0].word > 0);
    // words ordered by location
    const locs = textLine.words.map((w) => w.location.split(':').map(Number));
    const sorted = [...locs].sort((a, b) => {
        for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] - b[i];
        return 0;
    });
    assert.deepEqual(locs, sorted, 'words should be ordered by location');
});

test('layout page 1 contains a surah-header line', async () => {
    const res = await app.inject('/api/quran/layout/page/1');
    assert.equal(res.statusCode, 200);
    const body = res.json();
    const header = body.lines.find((l) => l.type === 'surah-header');
    assert.ok(header, 'expected a surah header on page 1');
    assert.equal(header.surah, 1);
});

test('layout 404 for invalid page', async () => {
    const res = await app.inject('/api/quran/layout/page/999');
    assert.equal(res.statusCode, 404);
    assert.equal(res.json().error, 'Not Found');
});

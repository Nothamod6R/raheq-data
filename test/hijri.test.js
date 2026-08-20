import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import {
    getHijriFromGregorian,
    getGregorianFromHijri,
    getTodayHijri,
} from '../src/controllers/hijra.js';

let app;

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/hijri/from-gregorian', getHijriFromGregorian);
    app.get('/api/hijri/to-gregorian', getGregorianFromHijri);
    app.get('/api/hijri/today', getTodayHijri);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

test('converts 2026-08-11 to the expected Hijri date', async () => {
    const res = await app.inject('/api/hijri/from-gregorian?date=2026-08-11');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.success, true);
    assert.equal(body.input, '2026-08-11');
    assert.deepEqual(body.hijri, {
        year: 1448,
        month: 2,
        day: 28,
        monthName: 'صفر',
        formatted: '28/2/1448 هـ',
        formattedArabic: '28 صفر 1448 هـ',
    });
});

test('converts 2026-01-01 to the expected Hijri date', async () => {
    const res = await app.inject('/api/hijri/from-gregorian?date=2026-01-01');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.deepEqual(
        { year: body.hijri.year, month: body.hijri.month, day: body.hijri.day, monthName: body.hijri.monthName },
        { year: 1447, month: 7, day: 12, monthName: 'رجب' },
    );
});

test('round-trips a Gregorian date through Hijri and back', async () => {
    const from = await app.inject('/api/hijri/from-gregorian?date=2026-08-11');
    const hijri = from.json().hijri;

    const to = await app.inject(
        `/api/hijri/to-gregorian?year=${hijri.year}&month=${hijri.month}&day=${hijri.day}`,
    );
    assert.equal(to.statusCode, 200);
    const back = to.json();

    assert.equal(back.success, true);
    assert.deepEqual(back.gregorian, {
        year: 2026,
        month: 8,
        day: 11,
        formatted: '11/08/2026 م',
    });
});

test('converts a known Hijri date back to Gregorian', async () => {
    const res = await app.inject('/api/hijri/to-gregorian?year=1447&month=7&day=12');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.success, true);
    assert.deepEqual(body.gregorian, {
        year: 2026,
        month: 1,
        day: 1,
        formatted: '01/01/2026 م',
    });
});

test('rejects a Hijri date that is missing parts', async () => {
    const res = await app.inject('/api/hijri/to-gregorian?year=1447&month=7');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), {
        success: false,
        message: 'You should send this query (month, year, day)',
    });
});

test('rejects an invalid Hijri month', async () => {
    const res = await app.inject('/api/hijri/to-gregorian?year=1447&month=13&day=1');
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().success, false);
    assert.equal(res.json().message, 'Invalid Hijri date values');
});

test('handles an invalid Gregorian date gracefully', async () => {
    const res = await app.inject('/api/hijri/from-gregorian?date=not-a-date');
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().success, false);
});

test('GET /api/hijri/today returns today plus an optional days offset', async () => {
    const res = await app.inject('/api/hijri/today?days=2');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.success, true);
    assert.equal(body.daysOffset, 2);
    assert.equal(typeof body.hijri.year, 'number');
    assert.equal(typeof body.hijri.month, 'number');
    assert.equal(typeof body.hijri.day, 'number');
    assert.match(body.gregorian, /^\d{4}-\d{2}-\d{2}$/);
});
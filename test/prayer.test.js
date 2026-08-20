import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { getPrayerTimes, getLocalDate } from '../src/controllers/prayer.js';

let app;

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/prayer-times', getPrayerTimes);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

const validQuery =
    'latitude=25.2854&longitude=51.531&utcOffset=3' +
    '&method=muslim_world_league&madhab=shafi&date=2026-08-11';

test('GET /api/prayer-times returns reference times for Doha', async () => {
    const res = await app.inject(`/api/prayer-times?${validQuery}`);
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.date, '2026-08-11');
    assert.deepEqual(body.location, {
        latitude: 25.2854,
        longitude: 51.531,
        utcOffset: 3,
    });
    assert.deepEqual(body.calculation, {
        method: 'muslim_world_league',
        madhab: 'shafi',
    });
    assert.deepEqual(body.times, {
        fajr: '03:43',
        sunrise: '05:06',
        dhuhr: '11:39',
        asr: '15:08',
        maghrib: '18:13',
        isha: '19:30',
    });
});

test('GET /api/prayer-times defaults the date to the local date', async () => {
    const res = await app.inject(
        '/api/prayer-times?latitude=0&longitude=0&utcOffset=0&method=qatar&madhab=shafi',
    );
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.match(body.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(body.times.fajr);
});

test('rejects a missing latitude', async () => {
    const res = await app.inject('/api/prayer-times?longitude=51&utcOffset=3&method=qatar&madhab=shafi');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid latitude' });
});

test('rejects an out-of-range longitude', async () => {
    const res = await app.inject('/api/prayer-times?latitude=25&longitude=181&utcOffset=3&method=qatar&madhab=shafi');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid longitude' });
});

test('rejects an invalid utcOffset', async () => {
    const res = await app.inject('/api/prayer-times?latitude=25&longitude=51&utcOffset=20&method=qatar&madhab=shafi');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid utcOffset' });
});

test('rejects an unsupported method', async () => {
    const res = await app.inject('/api/prayer-times?latitude=25&longitude=51&utcOffset=3&method=not_a_method&madhab=shafi');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid method' });
});

test('rejects an unsupported madhab', async () => {
    const res = await app.inject('/api/prayer-times?latitude=25&longitude=51&utcOffset=3&method=qatar&madhab=majority');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid madhab' });
});

test('rejects a date that does not exist', async () => {
    const res = await app.inject('/api/prayer-times?latitude=25&longitude=51&utcOffset=3&method=qatar&madhab=shafi&date=2026-02-30');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.json(), { error: 'Invalid date' });
});

test('getLocalDate formats a UTC ms timestamp with an offset', () => {
    // Date.UTC(2026, 7, 11, 0, 0, 0) with a +3 offset is still 2026-08-11 local.
    assert.equal(getLocalDate(3, Date.UTC(2026, 7, 11, 0, 0, 0)), '2026-08-11');
    // A negative offset can roll back to the previous day.
    assert.equal(getLocalDate(-5, Date.UTC(2026, 0, 1, 1, 0, 0)), '2025-12-31');
});
import test from 'node:test';
import assert from 'node:assert/strict';
import {
    computePrayerTimes,
    formatMinutes,
    SUPPORTED_METHODS,
    SUPPORTED_MADHABS,
    CALCULATION_METHODS,
} from '../src/services/prayer-times.js';

const DOHA = {
    year: 2026,
    month: 8,
    day: 11,
    latitude: 25.2854,
    longitude: 51.531,
    utcOffset: 3,
};

test('exposes the documented calculation methods and madhabs', () => {
    assert.deepEqual(SUPPORTED_MADHABS, ['shafi', 'hanafi']);
    for (const method of Object.keys(CALCULATION_METHODS)) {
        assert.ok(
            SUPPORTED_METHODS.includes(method),
            `SUPPORTED_METHODS is missing "${method}"`,
        );
    }
    assert.ok(SUPPORTED_METHODS.length >= 19, 'expected 19+ calculation methods');
});

test('Doha - MWL - Shafi matches the documented reference times', () => {
    const times = computePrayerTimes({
        ...DOHA,
        method: 'muslim_world_league',
        madhab: 'shafi',
    });

    assert.deepEqual(
        {
            fajr: formatMinutes(times.fajr),
            sunrise: formatMinutes(times.sunrise),
            dhuhr: formatMinutes(times.dhuhr),
            asr: formatMinutes(times.asr),
            maghrib: formatMinutes(times.maghrib),
            isha: formatMinutes(times.isha),
        },
        {
            fajr: '03:43',
            sunrise: '05:06',
            dhuhr: '11:39',
            asr: '15:08',
            maghrib: '18:13',
            isha: '19:30',
        },
    );
});

test('Hanafi asr is later than Shafi while other fixed-angle times are unchanged', () => {
    const base = { ...DOHA, method: 'muslim_world_league' };
    const shafi = computePrayerTimes({ ...base, madhab: 'shafi' });
    const hanafi = computePrayerTimes({ ...base, madhab: 'hanafi' });

    assert.equal(formatMinutes(shafi.asr), '15:08');
    assert.equal(formatMinutes(hanafi.asr), '16:17');
    assert.equal(hanafi.fajr, shafi.fajr);
    assert.equal(hanafi.sunrise, shafi.sunrise);
    assert.equal(hanafi.maghrib, shafi.maghrib);
});

test('Cairo - Egyptian method computes expected times', () => {
    const times = computePrayerTimes({
        year: 2026,
        month: 1,
        day: 1,
        latitude: 30.0444,
        longitude: 31.2357,
        utcOffset: 2,
        method: 'egyptian',
        madhab: 'shafi',
    });

    assert.deepEqual(
        {
            fajr: formatMinutes(times.fajr),
            dhuhr: formatMinutes(times.dhuhr),
            isha: formatMinutes(times.isha),
        },
        { fajr: '05:18', dhuhr: '11:58', isha: '18:29' },
    );
});

test('Umm al-Qura switches to a 120-minute isha interval during Ramadan', () => {
    // 2026-01-01 is not in Ramadan (uses the standard 90-minute interval).
    const regular = computePrayerTimes({
        year: 2026,
        month: 1,
        day: 1,
        latitude: 21.4225,
        longitude: 39.8262,
        utcOffset: 3,
        method: 'umm_al_qura',
        madhab: 'shafi',
    });
    // 2026-03-06 falls in Ramadan (uses the 120-minute interval).
    const ramadan = computePrayerTimes({
        year: 2026,
        month: 3,
        day: 6,
        latitude: 21.4225,
        longitude: 39.8262,
        utcOffset: 3,
        method: 'umm_al_qura',
        madhab: 'shafi',
    });

    assert.equal(formatMinutes(regular.isha), '19:20');
    assert.equal(formatMinutes(ramadan.isha), '20:27');
    assert.ok(ramadan.isha > regular.isha, 'Ramadan isha should be later');
});

test('formatMinutes handles nulls, wrap-around, and negative offsets', () => {
    assert.equal(formatMinutes(null), null);
    assert.equal(formatMinutes(undefined), null);
    assert.equal(formatMinutes(720), '12:00');
    assert.equal(formatMinutes(67), '01:07');
    // -5 minutes past midnight -> previous day 23:55
    assert.equal(formatMinutes(-5), '23:55');
    // rounds fractional minutes to the nearest whole minute
    assert.equal(formatMinutes(30.4), '00:30');
    assert.equal(formatMinutes(30.6), '00:31');
});
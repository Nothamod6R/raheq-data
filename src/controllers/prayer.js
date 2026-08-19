import {
    computePrayerTimes,
    formatMinutes,
    SUPPORTED_METHODS,
    SUPPORTED_MADHABS
} from '../services/prayer-times.js';

const LATITUDE_RANGE = { min: -90, max: 90 };
const LONGITUDE_RANGE = { min: -180, max: 180 };
const UTC_OFFSET_RANGE = { min: -12, max: 14 };

const toNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || value.trim() === '') return Number.NaN;
    return Number(value.trim());
};

const inRange = (value, { min, max }) => value >= min && value <= max;

const toBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    const normalized = value.toString().trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    return defaultValue;
};

const isValidDate = (dateString) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return day >= 1 && day <= daysInMonth;
};

export const getLocalDate = (utcOffset, nowMs) => {
    const localMs = nowMs + utcOffset * 60 * 60 * 1000;
    const d = new Date(localMs);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

const parseAndValidate = (query) => {
    const latitude = toNumber(query.latitude);
    if (Number.isNaN(latitude) || !inRange(latitude, LATITUDE_RANGE)) {
        return { error: 'Invalid latitude' };
    }

    const longitude = toNumber(query.longitude);
    if (Number.isNaN(longitude) || !inRange(longitude, LONGITUDE_RANGE)) {
        return { error: 'Invalid longitude' };
    }

    const utcOffset = toNumber(query.utcOffset);
    if (Number.isNaN(utcOffset) || !inRange(utcOffset, UTC_OFFSET_RANGE)) {
        return { error: 'Invalid utcOffset' };
    }

    const method = (query.method ?? '').toString().trim().toLowerCase();
    if (!SUPPORTED_METHODS.includes(method)) {
        return { error: 'Invalid method' };
    }

    const madhab = (query.madhab ?? '').toString().trim().toLowerCase();
    if (!SUPPORTED_MADHABS.includes(madhab)) {
        return { error: 'Invalid madhab' };
    }

    let date = (query.date ?? '').toString().trim();
    if (!date) {
        date = getLocalDate(utcOffset, Date.now());
    }
    if (!isValidDate(date)) {
        return { error: 'Invalid date' };
    }

    const hours12 = toBoolean(query.hours_12, false);

    return { latitude, longitude, utcOffset, method, madhab, date, hours12 };
};

export const getPrayerTimes = async (request, reply) => {
    const parsed = parseAndValidate(request.query);
    if (parsed.error) {
        return reply.status(400).send({ error: parsed.error });
    }

    const [year, month, day] = parsed.date.split('-').map(Number);
    const times = computePrayerTimes({
        year,
        month,
        day,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        utcOffset: parsed.utcOffset,
        method: parsed.method,
        madhab: parsed.madhab
    });

    return reply.send({
        date: parsed.date,
        location: {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            utcOffset: parsed.utcOffset
        },
        calculation: {
            method: parsed.method,
            madhab: parsed.madhab
        },
        times: {
            fajr: formatMinutes(times.fajr, parsed.hours12),
            sunrise: formatMinutes(times.sunrise, parsed.hours12),
            dhuhr: formatMinutes(times.dhuhr, parsed.hours12),
            asr: formatMinutes(times.asr, parsed.hours12),
            maghrib: formatMinutes(times.maghrib, parsed.hours12),
            isha: formatMinutes(times.isha, parsed.hours12)
        }
    });
};
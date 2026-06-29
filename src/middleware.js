import 'dotenv/config';
const tafseerTypeTextAllowed = new Set([
    'ar_muyassar',
    'en_sahih',
    'baghawy',
    'katheer',
    'qortoby',
    'sa3dy',
    'tabary',
    'waseet',
    'tanweer',
    'tafheem',
    'bn_bengali',
    'bs_korkut',
    'de_bubenheim',
    'es_navio',
    'fr_hamidullah',
    'ha_gumi',
    'id_indonesian',
    'indonesian',
    'it_piccardo',
    'ku_asan',
    'ml_abdulhameed',
    'ms_basmeih',
    'nl_siregar',
    'pr_tagi',
    'pt_elhayek',
    'ru_kuliev',
    'russian',
    'so_abduh',
    'sq_nahi',
    'sv_bernstrom',
    'sw_barwani',
    'ta_tamil',
    'th_thai',
    'tr_diyanet',
    'ur_jalandhry',
    'uz_sodik',
    'zh_jian'
]);

const MAX_KEYWORD_LENGTH = Number(process.env.MAX_KEYWORD_LENGTH ?? 100);
const MIN_KEYWORD_LENGTH = Number(process.env.MIN_KEYWORD_LENGTH ?? 2);

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000); 
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 30); 

const MAX_QUERY_URL_LENGTH = Number(process.env.MAX_QUERY_URL_LENGTH ?? 2048);
const MAX_CATEGORY_LENGTH = Number(process.env.MAX_CATEGORY_LENGTH ?? 60);

const rateLimitMap = new Map();

const fail = (reply, code, message) => {
    return reply.status(code).send({
        error: code === 400 ? 'Bad Request' : 'Too Many Requests',
        message
    });
};

const isPlainString = (v) => typeof v === 'string' || v instanceof String;

const toTrimmedString = (v) => {
    if (!isPlainString(v)) return '';
    return v.toString().trim();
};

const parsePositiveIntInRange = (value, { min, max }) => {
    if (value === undefined || value === null) return undefined;
    const num = typeof value === 'number' ? value : parseInt(value.toString().trim(), 10);
    if (!Number.isInteger(num) || Number.isNaN(num)) return null;
    if (num < min || num > max) return null;
    return num;
};

export const validateSearchParams = async (request, reply) => {
    const rawUrl = request.raw?.url || '';
    if (rawUrl.length > MAX_QUERY_URL_LENGTH) {
        return fail(reply, 400, 'Request query is too large.');
    }

    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const routeKey = request.routerPath || request.raw?.url || request.url;
    const limiterKey = `${ip}:${routeKey}`;


    const now = Date.now();
    const existing = rateLimitMap.get(limiterKey);
    if (!existing || existing.resetAt <= now) {
        rateLimitMap.set(limiterKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
        if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
            return reply.status(429).send({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Try again later.'
            });
        }
        existing.count += 1;
    }

    const { keyword, category, level, surah, ayah, number } = request.query || {};

    if (keyword !== undefined) {
        if (!isPlainString(keyword)) {
            return fail(reply, 400, 'Invalid keyword type.');
        }
        const trimmed = keyword.trim();
        if (trimmed.length > MAX_KEYWORD_LENGTH) {
            return fail(reply, 400, `Keyword is too long. Max length is ${MAX_KEYWORD_LENGTH}.`);
        }
        if (trimmed.length !== 0 && trimmed.length < MIN_KEYWORD_LENGTH) {
            return fail(reply, 400, `The search word must be at least ${MIN_KEYWORD_LENGTH} characters long.`);
        }
    }

    if (surah !== undefined) {
        const val = parsePositiveIntInRange(surah, { min: 1, max: 114 });
        if (val === null) return fail(reply, 400, 'Invalid surah parameter.');
    }

    if (ayah !== undefined) {
        const val = parsePositiveIntInRange(ayah, { min: 1, max: 286 });
        if (val === null) return fail(reply, 400, 'Invalid ayah parameter.');
    }

    if (level !== undefined) {
        const val = parsePositiveIntInRange(level, { min: 1, max: 10 });
        if (val === null) return fail(reply, 400, 'Invalid level parameter.');
    }

    if (number !== undefined) {
        const val = parsePositiveIntInRange(number, { min: 1, max: 114 });
        if (val === null) return fail(reply, 400, 'Invalid number parameter.');
    }

    if (request.params && request.params.typeText) {
        const typeText = toTrimmedString(request.params.typeText);
        if (!typeText) return fail(reply, 400, 'Invalid tafseer type.');
        if (!tafseerTypeTextAllowed.has(typeText)) {
            return fail(reply, 400, 'Invalid tafseer type.');
        }
    }

    if (category !== undefined) {
        if (!isPlainString(category)) return fail(reply, 400, 'Invalid category type.');
        const trimmed = category.trim();
        if (trimmed.length > MAX_CATEGORY_LENGTH) return fail(reply, 400, 'Category is too long.');
    }
};

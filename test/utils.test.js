import test from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';

const store = new Map();
const redis = {
    failNextGet: false,
    get: async (key) => {
        if (redis.failNextGet) {
            redis.failNextGet = false;
            throw new Error('redis down');
        }
        return store.get(key) ?? null;
    },
    set: async (key, value) => {
        store.set(key, value);
        return 'OK';
    },
};
mock.module('../index.js', { namedExports: { redisClient: redis } });

const {
    shuffleArray,
    readJsonFile,
    handleCache,
    removeArabicDiacritics,
} = await import('../src/utils.js');

// ---------------------------------------------------------------------------
// shuffleArray
// ---------------------------------------------------------------------------
test('shuffleArray returns a permutation with the same elements', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffleArray(input);

    assert.equal(output.length, input.length);
    assert.deepEqual([...output].sort((a, b) => a - b), input);
});

test('shuffleArray does not mutate the original array', () => {
    const input = [1, 2, 3];
    const before = [...input];
    shuffleArray(input);
    assert.deepEqual(input, before);
});

test('shuffleArray handles non-array input gracefully', () => {
    assert.deepEqual(shuffleArray(), []);
    assert.deepEqual(shuffleArray(null), []);
    assert.deepEqual(shuffleArray('text'), []);
    assert.deepEqual(shuffleArray([]), []);
});

// ---------------------------------------------------------------------------
// removeArabicDiacritics
// ---------------------------------------------------------------------------
test('removeArabicDiacritics strips Arabic diacritics and normalizes letters', () => {
    assert.equal(removeArabicDiacritics('بِسْمِ اللَّهِ'), 'بسم الله');
    assert.equal(removeArabicDiacritics('إِلى المَسجِد'), 'الي المسجد');
    assert.equal(removeArabicDiacritics('أَنْزَلْنا'), 'انزلنا');
});

test('removeArabicDiacritics returns an empty string for falsy input', () => {
    assert.equal(removeArabicDiacritics(''), '');
    assert.equal(removeArabicDiacritics(null), '');
    assert.equal(removeArabicDiacritics(undefined), '');
});

// ---------------------------------------------------------------------------
// readJsonFile
// ---------------------------------------------------------------------------
test('readJsonFile parses an existing JSON file', async () => {
    const data = await readJsonFile(
        '/home/mohammed/projects/raheq-data/database/quran/metadata/surahs.json',
    );
    assert.ok(Array.isArray(data));
    assert.equal(data[0].number, 1);
});

test('readJsonFile throws a descriptive error for a missing file', async () => {
    await assert.rejects(
        () => readJsonFile('/home/mohammed/projects/raheq-data/database/does-not-exist.json'),
        (err) => err.message.includes('ERROR While reading file'),
    );
});

// ---------------------------------------------------------------------------
// handleCache
// ---------------------------------------------------------------------------
test('handleCache uses the cached value when present', async () => {
    store.clear();
    store.set('mykey', JSON.stringify({ cached: true }));

    let fetched = false;
    const result = await handleCache('mykey', async () => {
        fetched = true;
        return { fetched: true };
    });

    assert.deepEqual(result, { cached: true });
    assert.equal(fetched, false, 'fetch function must not run on a cache hit');
});

test('handleCache fetches, stores, and returns fresh data on a miss', async () => {
    store.clear();
    const result = await handleCache('mykey', async () => ({ fresh: 1 }));

    assert.deepEqual(result, { fresh: 1 });
    assert.equal(store.get('mykey'), '{"fresh":1}');
});

test('handleCache falls back to fetching when the cache read throws', async () => {
    redis.failNextGet = true;
    const result = await handleCache('mykey', async () => ({ fallback: 'value' }));
    assert.deepEqual(result, { fallback: 'value' });
});
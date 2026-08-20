import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { registerRedisMock } from './helpers.js';

registerRedisMock();

const {
    getTafseerMetadata,
    getSingleTafseerMetadata,
    getQuranTafseer,
    getQuranNormalText,
    getQuranWithGlyphsText,
    getJuzMetadata,
    getPageDataMetadata,
    getQuartersMetadata,
    getSajdahMetadata,
    getSurahsMetadata,
} = await import('../src/controllers/quran.js');

let app;

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/quran/tafsser/metadata', getTafseerMetadata);
    app.get('/api/quran/tafsser/:typeText/metadata', getSingleTafseerMetadata);
    app.get('/api/quran/tafsser/:typeText', getQuranTafseer);
    app.get('/api/quran/text/normal', getQuranNormalText);
    app.get('/api/quran/text/glyphs', getQuranWithGlyphsText);
    app.get('/api/quran/metadata/juz', getJuzMetadata);
    app.get('/api/quran/metadata/page', getPageDataMetadata);
    app.get('/api/quran/metadata/quarters', getQuartersMetadata);
    app.get('/api/quran/metadata/sajdah', getSajdahMetadata);
    app.get('/api/quran/metadata/surahs', getSurahsMetadata);
    await app.ready();
});

test.after(async () => {
    await app.close();
});
test('GET /api/quran/tafsser/metadata lists all tafseer types', async () => {
    const res = await app.inject('/api/quran/tafsser/metadata');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.some((t) => t.typeText === 'ar_muyassar'));
    assert.ok(body.some((t) => t.typeText === 'en_sahih'));
});

test('GET single tafseer metadata returns a known type', async () => {
    const res = await app.inject('/api/quran/tafsser/ar_muyassar/metadata');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.typeText, 'ar_muyassar');
    assert.ok(body.typeTextInRelatedLanguage);
});

test('GET single tafseer metadata returns 404 for an unknown type', async () => {
    const res = await app.inject('/api/quran/tafsser/does_not_exist/metadata');
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.json(), {
        error: 'Not Found',
        message: "ERROR: Can't found the tafsser.",
    });
});

test('GET quran tafseer returns references with filtered surah', async () => {
    const res = await app.inject('/api/quran/tafsser/ar_muyassar?surah=1');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.metadata.typeText, 'ar_muyassar');
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.data.every((item) => Number(item.sura) === 1));
});

test('GET quran tafser returns 404 for an unknown type', async () => {
    const res = await app.inject('/api/quran/tafsser/does_not_exist');
    assert.equal(res.statusCode, 404);
});

test('GET quran normal text returns all verses for surah 1 with similar attached', async () => {
    const res = await app.inject('/api/quran/text/normal?surah=1');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.equal(body.length, 7);
    assert.ok(body.every((v) => v.surah_number === 1 && v.content));
    assert.ok('similar' in body[0], 'normal text verses should include the similar field');
});
test('GET quran normal text filters by ayah and keyword', async () => {
    const ayah = await app.inject('/api/quran/text/normal?surah=1&ayah=2');
    assert.equal(ayah.statusCode, 200);
    const ayahBody = ayah.json();
    assert.equal(ayahBody.length, 1);
    assert.equal(ayahBody[0].verse_number, 2);
    assert.equal(ayahBody[0].surah_number, 1);

    const keyword = await app.inject('/api/quran/text/normal?keyword=الحمد');
    assert.equal(keyword.statusCode, 200);
    const keywordBody = keyword.json();
    assert.ok(keywordBody.length > 0);
    for (const v of keywordBody) {
        const cleaned = v.content.replace(/[\u064B-\u0652\u06D6-\u06ED\u0610-\u061A\u0653-\u065F\u0670]/g, '').toLowerCase();
        assert.equal(cleaned.includes('الحمد'), true, `verse ${v.verse_number} should contain the keyword`);
    }
});
test('GET juz metadata filters juz that include a surah', async () => {
    const all = await app.inject('/api/quran/metadata/juz');
    assert.equal(all.statusCode, 200);
    assert.ok(all.json().length >= 1);

    const filtered = await app.inject('/api/quran/metadata/juz?surah=1');
    assert.equal(filtered.statusCode, 200);
    assert.ok(filtered.json().every((j) => j.surahs.includes(1)));
});

test('GET page metadata filters by surah and ayah range', async () => {
    const res = await app.inject('/api/quran/metadata/page?surah=1');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(body.length > 0);
    assert.ok(body.every((p) => Number(p.surah) === 1));

    // surah 1 spans ayahs 1..7, so ayah 3 must be inside every returned page
    const byAyah = await app.inject('/api/quran/metadata/page?ayah=3');
    assert.equal(byAyah.statusCode, 200);
    assert.ok(
        byAyah
            .json()
            .every((p) => 3 >= parseInt(p.start, 10) && 3 <= parseInt(p.end, 10)),
    );
});

test('GET quarters metadata filters by surah', async () => {
    const res = await app.inject('/api/quran/metadata/quarters?surah=2');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(body.length > 0);
    assert.ok(body.every((q) => Number(q.surah) === 2));
});

test('GET sajdah metadata contains the known prostration verse', async () => {
    const res = await app.inject('/api/quran/metadata/sajdah');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(
        body.some((s) => Number(s.surah) === 7 && Number(s.ayah) === 206),
        'expected the well-known prostration verse (7:206)',
    );
});

test('GET surahs metadata returns 114 surahs and filters by number', async () => {
    const all = await app.inject('/api/quran/metadata/surahs');
    assert.equal(all.statusCode, 200);
    assert.equal(all.json().length, 114);

    const one = await app.inject('/api/quran/metadata/surahs?number=1');
    assert.equal(one.statusCode, 200);
    const body = one.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].number, 1);
    assert.equal(body[0].englishName, 'Al-Faatiha');
});

test('GET quran glyphs text returns glyph data when available', async () => {
    const res = await app.inject('/api/quran/text/glyphs?surah=1&ayah=1');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.equal(body.length, 1);
    assert.ok('qcfData' in body[0], 'glyph response should include qcfData');
    assert.ok('similar' in body[0]);
});
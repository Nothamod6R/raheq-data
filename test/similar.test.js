import test from 'node:test';
import assert from 'node:assert/strict';
import { createsimilarService } from '../src/services/similar.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const readFile = () =>
    readFileSync(
        path.join(process.cwd(), 'database', 'quran', 'text', 'similar.json'),
        'utf-8',
    );

test('creates a service with injected data and skips malformed entries', () => {
    const svc = createsimilarService(() =>
        JSON.stringify({
            group: [
                { src: { ayah: '2:2' }, similar: [{ ayah: '8:2' }, { ayah: '27:2' }, { ayah: '31:3' }] },
                { src: { ayah: '2:4' }, similar: [{ ayah: '31:4' }] },
                // entries without a valid src.ayah are ignored
                { src: {} },
                null,
            ],
        }),
    );

    assert.deepEqual(svc.get(2, 2), ['8:2', '27:2', '31:3']);
    assert.deepEqual(svc.get(2, 4), ['31:4']);
});

test('get returns an empty array for a verse with no similar ayahs', () => {
    const svc = createsimilarService(() => '{}');
    assert.deepEqual(svc.get(114, 1), []);
});

test('withVerse attaches the similar list to a full verse', () => {
    const svc = createsimilarService(() =>
        JSON.stringify({
            group: [{ src: { ayah: '2:2' }, similar: [{ ayah: '8:2' }] }],
        }),
    );

    const verse = { surah_number: 2, verse_number: 2, content: 'x' };
    const enriched = svc.withVerse(verse);
    assert.equal(enriched.surah_number, 2);
    assert.equal(enriched.verse_number, 2);
    assert.deepEqual(enriched.similar, ['8:2']);
});

test('withVerse leaves verses without a position unchanged', () => {
    const svc = createsimilarService(() => '{}');
    const verse = { content: 'metadata only' };
    assert.equal(svc.withVerse(verse), verse);
});

test('loads real similar data from disk using the default reader', () => {
    const svc = createsimilarService(readFile);
    const list = svc.get(2, 2);
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0, 'surah 2 ayah 2 should have known similar ayahs');
    assert.ok(list.includes('27:2'), 'expected 27:2 among similar ayahs');
});
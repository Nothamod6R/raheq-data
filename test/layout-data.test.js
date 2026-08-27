import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_NORM = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'normalized');
const LAYOUT_SRC = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'source');
const QURAN_JSON = path.join(__dirname, '..', 'database', 'quran', 'text', 'quran.json');
const PINNED_DB_SHA256 = '91484fb685fa4b62d2eef65207eb3bb4b7e9207459a6e79ffddbd84c85d6fbe9';

function loadPages(dir) {
    return readdirSync(dir)
        .filter((n) => /^page-\d{3}\.json$/.test(n))
        .sort()
        .map((n) => JSON.parse(readFileSync(path.join(dir, n), 'utf-8')));
}

test('layout source database is present and matches the pinned QUL V2 SHA-256', () => {
    const db = path.join(LAYOUT_SRC, 'quran-layout-v2.db');
    assert.ok(existsSync(db), 'source quran-layout-v2.db should exist');
    const hash = createHash('sha256').update(readFileSync(db)).digest('hex');
    assert.equal(hash, PINNED_DB_SHA256, 'source DB SHA-256 must match the pinned QUL V2 asset');
});

test('layout dataset: exactly 604 pages, continuous, valid JSON, filenames match', () => {
    const expected = Array.from({ length: 604 }, (_, i) => i + 1);
    const pages = loadPages(LAYOUT_NORM);
    assert.equal(pages.length, 604, 'normalized should have 604 pages');
    assert.deepEqual(pages.map((p) => p.page).sort((a, b) => a - b), expected, 'continuous 1..604');
    // filename / page coherence
    for (const p of pages) {
        const num = String(p.page).padStart(3, '0');
        const f = readdirSync(LAYOUT_NORM).find((x) => x === `page-${num}.json`);
        assert.ok(f, `file page-${num}.json should exist`);
    }
});

test('layout dataset: line counts and ordering match the 15-line V2 Mushaf', () => {
    const pages = loadPages(LAYOUT_NORM);
    for (const p of pages) {
        assert.equal(p.linesPerPage, 15);
        const lineNums = p.lines.map((l) => l.line);
        for (let i = 1; i < lineNums.length; i += 1) {
            assert.ok(lineNums[i] > lineNums[i - 1], `page ${p.page} lines increasing`);
        }
        assert.ok(p.lines.every((l) => l.line >= 1 && l.line <= 15), `page ${p.page} lines in 1..15`);
        assert.ok(p.lines.every((l) => ['text', 'surah-header', 'basmala'].includes(l.type)), `page ${p.page} types`);
    }
    // exactly pages 1 and 2 have 8 lines (headers/basmala); all others 15
    const counts = {};
    for (const p of pages) counts[p.lines.length] = (counts[p.lines.length] || 0) + 1;
    for (const p of pages) {
        if (p.page === 1 || p.page === 2) assert.equal(p.lines.length, 8, `page ${p.page} 8 lines`);
        else assert.equal(p.lines.length, 15, `page ${p.page} 15 lines`);
    }
});

test('layout dataset: words ordered within lines and locations unique', () => {
    const reps = ['001', '002', '003', '010', '042', '254', '604'];
    for (const r of reps) {
        const page = JSON.parse(readFileSync(path.join(LAYOUT_NORM, `page-${r}.json`), 'utf-8'));
        const seen = new Set();
        for (const line of page.lines) {
            if (line.type !== 'text') continue;
            let prevPos = 0;
            let prevLoc = null;
            for (const w of line.words) {
                assert.equal(w.position, prevPos + 1, `page-${r} line ${line.line} position sequence`);
                prevPos = w.position;
                assert.ok(!seen.has(w.location), `duplicate ${w.location} on page-${r}`);
                seen.add(w.location);
                const a = w.location.split(':').map(Number);
                assert.equal(a.length, 3);
                assert.equal(w.surah, a[0]);
                assert.equal(w.verse, a[1]);
                assert.equal(w.word, a[2]);
                if (prevLoc) {
                    const a0 = prevLoc.split(':').map(Number);
                    const bad =
                        a[0] < a0[0] ||
                        (a[0] === a0[0] && (a[1] < a0[1] || (a[1] === a0[1] && a[2] < a0[2])));
                    assert.ok(!bad, `words increasing on page-${r}`);
                }
                prevLoc = w.location;
                assert.match(w.location, /^\d+:\d+:\d+$/);
            }
        }
    }
});

test('layout dataset: every referenced surah/verse exists in the existing Quran data', () => {
    const quran = JSON.parse(readFileSync(QURAN_JSON, 'utf-8'));
    const verses = new Set(quran.map((v) => `${v.surah_number}:${v.verse_number}`));
    let checked = 0;
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) if (line.type === 'text') {
            for (const w of line.words) {
                assert.ok(verses.has(`${w.surah}:${w.verse}`), `unresolved ${w.surah}:${w.verse}`);
                checked += 1;
            }
        }
    }
    assert.ok(checked > 70000, `expected >70k checked words, got ${checked}`);
});

// Verses where QUL QCF layout tokenises one quran.json content word into two
// Mushaf glyph cells (word_index runs one ahead). The glyph sequence still
// matches exactly. Documented in the layout README; not a data error.
const KNOWN_TOKENIZATION_DIFFS = new Set(['2:72', '15:7', '27:20', '36:22', '37:164', '41:47']);

test('layout dataset: word indices are valid for their verse (known layout diffs allowed)', () => {
    const quran = JSON.parse(readFileSync(QURAN_JSON, 'utf-8'));
    const verseWordCount = new Map();
    for (const v of quran) verseWordCount.set(`${v.surah_number}:${v.verse_number}`, v.content.split(' ').length);

    const bad = [];
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) if (line.type === 'text') {
            for (const w of line.words) {
                if (w.kind === 'verse-marker') continue; // marker cell, no content word
                const key = `${w.surah}:${w.verse}`;
                const wc = verseWordCount.get(key);
                if (w.word < 1 || w.word > wc) {
                    if (!KNOWN_TOKENIZATION_DIFFS.has(key)) bad.push(`${p.page}:${w.location} (${wc} words)`);
                }
            }
        }
    }
    assert.deepEqual(bad, [], `invalid word indices:\n${bad.join('\n')}`);
});

test('layout dataset: QCF V2 glyph sequences match quran.json qcfData exactly', () => {
    const quran = JSON.parse(readFileSync(QURAN_JSON, 'utf-8'));
    const expectedByVerse = new Map();
    for (const v of quran) {
        expectedByVerse.set(`${v.surah_number}:${v.verse_number}`, (v.qcfData || '').split(' ').join(''));
    }
    const actualByVerse = new Map();
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) if (line.type === 'text') {
            for (const w of line.words) {
                const key = `${w.surah}:${w.verse}`;
                const seg = (w.glyph || '').replace(/ /g, '') + (w.marker || '').replace(/ /g, '');
                actualByVerse.set(key, (actualByVerse.get(key) || '') + seg);
            }
        }
    }
    const mismatches = [];
    for (const [key, expected] of expectedByVerse) {
        if ((actualByVerse.get(key) || '') !== expected) mismatches.push(key);
    }
    assert.deepEqual(mismatches, [], 'glyph-sequence mismatches vs quran.json');
});

test('layout dataset: geometry is null and valid (no fabricated coordinates)', () => {
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) if (line.type === 'text') {
            for (const w of line.words) {
                assert.equal(w.geometry, null, `${p.page}:${w.location} geometry must be null (QUL layout DB has no geometry)`);
            }
        }
    }
});

test('layout dataset: page 3 detailed structural validation', () => {
    const p = JSON.parse(readFileSync(path.join(LAYOUT_NORM, 'page-003.json'), 'utf-8'));
    assert.equal(p.page, 3);
    assert.equal(p.lines.length, 15);
    assert.ok(p.lines.every((l) => l.type === 'text'));
    const l1 = p.lines[0];
    assert.equal(l1.line, 1);
    assert.equal(l1.words[0].location, '2:6:1');
    assert.equal(l1.words[l1.words.length - 1].location, '2:6:9');
    // 2:6 words split across line 1 (1-9) and line 2 (10-11); verse 2:6 ends on 2:6:11 with a marker
    const l2 = p.lines[1];
    assert.equal(l2.words[0].location, '2:6:10');
    const lastWord = l2.words.find((w) => w.location === '2:6:11');
    assert.ok(lastWord, '2:6:11 should be present');
    assert.equal(lastWord.endOfVerse, true, '2:6:11 ends the verse');
    assert.ok(lastWord.marker, '2:6:11 should carry the QCF V2 ayah-end marker');
});

test('layout dataset: page 604 detailed structural validation', () => {
    const p = JSON.parse(readFileSync(path.join(LAYOUT_NORM, 'page-604.json'), 'utf-8'));
    assert.equal(p.page, 604);
    assert.equal(p.lines.length, 15);
    assert.ok(p.lines.some((l) => l.type === 'surah-header'), 'page 604 should have surah headers');
    // final surahs 112, 113, 114 present
    const headers = p.lines.filter((l) => l.type === 'surah-header').map((l) => l.surah);
    assert.ok(headers.includes(112) && headers.includes(113) && headers.includes(114));
    // last word of the Quran is 114:6 and ends the verse
    const lastLine = p.lines[p.lines.length - 1];
    const lastWord = lastLine.words[lastLine.words.length - 1];
    assert.equal(lastWord.location, '114:6:3', 'last word should be 114:6:3');
    assert.equal(lastWord.endOfVerse, true);
});

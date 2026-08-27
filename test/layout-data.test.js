import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_NORM = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'normalized');
const LAYOUT_SRC = path.join(__dirname, '..', 'database', 'quran', 'text', 'layout', 'source');
const QURAN_JSON = path.join(__dirname, '..', 'database', 'quran', 'text', 'quran.json');

function loadPages(dir) {
    return readdirSync(dir)
        .filter((n) => /^page-\d{3}\.json$/.test(n))
        .sort()
        .map((n) => JSON.parse(readFileSync(path.join(dir, n), 'utf-8')));
}

test('layout dataset: exactly 604 pages, continuous, valid JSON', () => {
    const expected = Array.from({ length: 604 }, (_, i) => i + 1);
    for (const dir of [LAYOUT_SRC, LAYOUT_NORM]) {
        const pages = loadPages(dir);
        assert.equal(pages.length, 604, `${dir} should have 604 pages`);
        assert.deepEqual(pages.map((p) => p.page).sort((a, b) => a - b), expected, `${dir} continuous 1..604`);
    }
});

test('layout dataset: representative pages have ordered lines and words', () => {
    const reps = ['001', '002', '003', '042', '254', '604'];
    for (const r of reps) {
        const page = JSON.parse(readFileSync(path.join(LAYOUT_NORM, `page-${r}.json`), 'utf-8'));
        assert.ok(page.lines.length >= 1, `page-${r} lines`);
        const lineNums = page.lines.map((l) => l.line);
        for (let i = 1; i < lineNums.length; i += 1) assert.ok(lineNums[i] > lineNums[i - 1], `page-${r} line order`);
        const seen = new Set();
        for (const line of page.lines) {
            if (line.type !== 'text') continue;
            let prev = null;
            for (const w of line.words) {
                assert.ok(!seen.has(w.location), `duplicate ${w.location} on page-${r}`);
                seen.add(w.location);
                const a = w.location.split(':').map(Number);
                assert.equal(a.length, 3);
                assert.equal(w.surah, a[0]);
                assert.equal(w.verse, a[1]);
                assert.equal(w.word, a[2]);
                if (prev) {
                    const bad =
                        a[0] < prev[0] ||
                        (a[0] === prev[0] && (a[1] < prev[1] || (a[1] === prev[1] && a[2] < prev[2])));
                    assert.ok(!bad, `words increasing on page-${r}`);
                }
                prev = a;
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

test('layout dataset: word-level integrity – word count, index, and text per verse', () => {
    const quran = JSON.parse(readFileSync(QURAN_JSON, 'utf-8'));
    const verseMap = new Map();
    for (const v of quran) verseMap.set(`${v.surah_number}:${v.verse_number}`, v);

    function stripAll(s) {
        return (s || '')
            .replace(/[\u064B-\u065F]/g, '')
            .replace(/[\u06D6-\u06ED]/g, '')
            .replace(/[\u0610-\u061A]/g, '')
            .replace(/[\u0640]/g, '')
            .replace(/[\u0670]/g, '')
            .replace(/[\u06E5-\u06E6]/g, '')
            .replace(/[\u06EA-\u06F9]/g, '')
            .replace(/[\u06DF-\u06E4]/g, '')
            .replace(/[\u06E7-\u06E8]/g, '')
            .replace(/[\u0660-\u0669]/g, '')
            .replace(/[\u0621]/g, '')
            .replace(/[\u0622]/g, 'ا')
            .replace(/[\u0623]/g, 'ا')
            .replace(/[\u0625]/g, 'ا')
            .replace(/[\u0671]/g, 'ا')
            .replace(/[\u0624]/g, 'و')
            .replace(/[\u0626]/g, 'ي')
            .replace(/[ة]/g, 'ه')
            .replace(/[ى]/g, 'ي')
            .replace(/[\u200F\u200E]/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    const layoutByVerse = new Map();
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) {
            if (line.type !== 'text') continue;
            for (const w of line.words) {
                const key = `${w.surah}:${w.verse}`;
                if (!layoutByVerse.has(key)) layoutByVerse.set(key, []);
                layoutByVerse.get(key).push(w);
            }
        }
    }

    const knownWordCountMismatches = new Set([
        '2:72',   // layout tokenises differently from quran.json content
        '2:181',  // layout omits trailing verse-number word (also QPC2 known quirk)
        '8:6',    // layout omits trailing verse-number word (also QPC2 known quirk)
        '13:37',  // layout omits trailing verse-number word (also QPC2 known quirk)
        '15:7',   // layout tokenises differently from quran.json content
        '27:20',  // layout tokenises differently from quran.json content
        '36:22',  // layout tokenises differently from quran.json content
        '37:130', // layout tokenises differently from quran.json content
        '37:164', // layout tokenises differently from quran.json content
        '41:47',  // layout tokenises differently from quran.json content
    ]);

    const knownTextMismatches = new Set([
        '11:13',  // alef vs alef-maqsura in افۡتَرَىٰهُ
        '78:1',   // quran.json truncates يَتَسَآءَلُوَ (missing final nunation)
    ]);

    const mismatches = [];
    for (const [key, verse] of verseMap) {
        const words = layoutByVerse.get(key) || [];
        const expectedWords = verse.content.split(/\s+/);

        if (words.length === 0) {
            mismatches.push(`${key}: verse missing from layout (expected ${expectedWords.length} words)`);
            continue;
        }

        if (words.length !== expectedWords.length) {
            const isKnown = knownWordCountMismatches.has(key);
            mismatches.push(
                `${key}: word count mismatch – layout has ${words.length}, quran.json has ${expectedWords.length}${isKnown ? ' [KNOWN]' : ''}`,
            );
            continue;
        }

        for (let i = 0; i < words.length; i += 1) {
            const w = words[i];
            const expectedIndex = i + 1;

            if (w.word !== expectedIndex) {
                mismatches.push(`${key}: word[${i}] index ${w.word} does not match expected ${expectedIndex}`);
            }
            if (w.surah !== verse.surah_number || w.verse !== verse.verse_number) {
                mismatches.push(`${key}: word[${i}] location ${w.surah}:${w.verse} does not match verse key`);
            }

            const layoutNorm = stripAll(w.text);
            const expectedNorm = stripAll(expectedWords[i]);
            if (layoutNorm !== expectedNorm) {
                const isKnown = knownTextMismatches.has(key);
                mismatches.push(
                    `${key}: word[${i}] text mismatch – layout "${w.text}" != quran "${expectedWords[i]}"${isKnown ? ' [KNOWN]' : ''}`,
                );
            }
        }
    }

    const unexpected = mismatches.filter((m) => !m.includes('[KNOWN]'));
    assert.deepEqual(
        unexpected,
        [],
        `unexpected word-level mismatches:\n${unexpected.join('\n')}\n\nknown mismatches:\n${mismatches.filter((m) => m.includes('[KNOWN]')).join('\n')}`,
    );
});

test('layout dataset: QPC2 glyph continuity vs quran.json (documented quirks only)', () => {
    const quran = JSON.parse(readFileSync(QURAN_JSON, 'utf-8'));
    const norms = {};
    for (const v of quran) norms[`${v.surah_number}:${v.verse_number}`] = v.qcfData || '';
    const noSpace = (s = '') => s.split(/\s+/).join('');
    const known = new Set(['2:181', '8:6', '13:37']);

    const byVerse = new Map();
    for (const p of loadPages(LAYOUT_NORM)) {
        for (const line of p.lines) if (line.type === 'text') {
            for (const w of line.words) {
                const key = `${w.surah}:${w.verse}`;
                if (!byVerse.has(key)) byVerse.set(key, []);
                byVerse.get(key).push(w.glyphs.qpc2);
            }
        }
    }
    const unexpected = [];
    for (const [key, gs] of byVerse) {
        if (noSpace(gs.join(' ')) !== noSpace(norms[key])) {
            if (!known.has(key)) unexpected.push(key);
        }
    }
    assert.deepEqual(unexpected, [], 'unexpected glyph mismatches vs quran.json');
});
import fs from 'fs';
import path from 'path';

const similar_FILE_PATH = path.join(
    process.cwd(),
    'database',
    'quran',
    'text',
    'similar.json'
);

const readsimilarFile = () => fs.readFileSync(similar_FILE_PATH, 'utf-8');

export const createsimilarService = (readFile = readsimilarFile) => {
    const similarMap = Object.create(null);

    const rawData = JSON.parse(readFile());

    for (const groupKey of Object.keys(rawData)) {
        const group = rawData[groupKey];
        if (!Array.isArray(group)) continue;

        for (const item of group) {
            if (!item || !item.src || !item.src.ayah) continue;
            const src = item.src.ayah;
            const similar = Array.isArray(item.similar)
                ? item.similar
                    .filter((entry) => entry && entry.ayah)
                    .map((entry) => entry.ayah)
                : [];

            const existing = similarMap[src] || (similarMap[src] = []);
            existing.push(...similar);
        }
    }

    const get = (surah, ayah) => {
        const list = similarMap[`${surah}:${ayah}`];
        return list || [];
    };

    const withVerse = (verse) => {
        if (!verse || verse.surah_number == null || verse.verse_number == null) {
            return verse;
        }
        return {
            ...verse,
            similar: get(verse.surah_number, verse.verse_number)
        };
    };

    return { get, withVerse };
};

export const similarService = createsimilarService();
export const withVerse = (verse) => similarService.withVerse(verse);
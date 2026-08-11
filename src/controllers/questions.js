import path from 'path';
import { readJsonFile, handleCache, shuffleArray } from '../utils.js';

export const getQuestions = async (request, reply) => {
    const { keyword, level } = request.query;
    const cacheKey = `questions:${level || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'questions', 'questions.json');
        let filtered = await readJsonFile(filePath);

        if (level) {
            filtered = filtered.filter(q => q.level === level);
        }

        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            filtered = filtered.filter(q => 
                q.question_name.toLowerCase().includes(lowerKeyword) ||
                q.answers.some(ans => ans.toLowerCase().includes(lowerKeyword))
            );
        }
        return filtered;
    });

    return reply.send(data);
};

export const getRandomQuestions = async (request, reply) => {
    const { diffuclt, count } = request.query;

    const normalizedDiff = (diffuclt || 'random').toString().trim().toLowerCase();
    const requestedCount = count === undefined ? 1 : parseInt(count.toString().trim(), 10);
    const safeCount = Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 1;

    const cacheKey = `questions:random:${normalizedDiff}:${safeCount}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'questions', 'questions.json');
        const allQuestions = await readJsonFile(filePath);

        const allowedLevels = new Set(['easy', 'medium', 'hard']);
        let pool = allQuestions;

        if (allowedLevels.has(normalizedDiff)) {
            pool = allQuestions.filter(q => q.level === normalizedDiff);
        } else {
            // random: pick a random level from available ones and then sample from it
            const levelsPresent = ['easy', 'medium', 'hard'].filter(l => allQuestions.some(q => q.level === l));
            const chosenLevel = levelsPresent[Math.floor(Math.random() * levelsPresent.length)] || 'easy';
            pool = allQuestions.filter(q => q.level === chosenLevel);
        }

        const randomized = shuffleArray(pool);
        return randomized.slice(0, Math.min(safeCount, randomized.length));
    });

    return reply.send(data);
};

export const getQuestionsVersion = async (request, reply) => {
    const cacheKey = `questions:version`;
    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'questions', 'questions.json');

        const version = await readJsonFile(filePath);

        return version[0]?.version ?? 0;
    });

    return reply.send({ version: data });
};

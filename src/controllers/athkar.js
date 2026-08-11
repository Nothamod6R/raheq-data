import path from 'path';
import { readJsonFile, handleCache } from '../utils.js';

export const getAthkar = async (request, reply) => {
    const { keyword, category } = request.query;
    const cacheKey = `athkar:${category || 'all'}:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'athkar.json');
        let result = await readJsonFile(filePath);

        if (category) {
            result = result.filter(item => item.category.includes(category));
        }

        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            result = result.map(item => {
                const filteredArray = item.array.filter(azkar => 
                    azkar.text.toLowerCase().includes(lowerKeyword)
                );
                if (item.category.toLowerCase().includes(lowerKeyword)) {
                    return item;
                } else if (filteredArray.length > 0) {
                    return { ...item, array: filteredArray };
                }
                return null;
            }).filter(item => item !== null);
        }
        return result;
    });

    return reply.send(data);
};

export const getQuranAdaia = async (request, reply) => {
    const { keyword } = request.query;
    const cacheKey = `quran_adaia:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'quran_adaia.json');
        const fileData = await readJsonFile(filePath);
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return fileData.filter(item => 
                item.text.toLowerCase().includes(lowerKeyword) || 
                item.reference.toLowerCase().includes(lowerKeyword)
            );
        }
        return fileData;
    });

    return reply.send(data);
};

export const getSunnahAdaia = async (request, reply) => {
    const { keyword } = request.query;
    const cacheKey = `sunnah_adaia:${keyword || 'all'}`;

    const data = await handleCache(cacheKey, async () => {
        const filePath = path.join(process.cwd(), 'database', 'athker_adaia', 'sna_adaia.json');
        const fileData = await readJsonFile(filePath);
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return fileData.filter(item => 
                item.text.toLowerCase().includes(lowerKeyword) || 
                item.reference.toLowerCase().includes(lowerKeyword)
            );
        }
        return fileData;
    });

    return reply.send(data);
};

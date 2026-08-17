import path from 'path';
import { readJsonFile } from '../utils.js';

async function getPrayer(prayer) {
    const filePath = path.join(
        process.cwd(),
        'database',
        'prayer_metadata.json'
    );

    const data = await readJsonFile(filePath);
    return data[prayer];
}

export const getPrayerMetadata = async (request, reply) => {
    const { prayer } = request.query;
    try {
        const data = await getPrayer(prayer);
        return reply.send({ data });
    } catch (err) {
        console.log(err);
        return reply.status(500).send({
            error: err.message
        });
    }
};
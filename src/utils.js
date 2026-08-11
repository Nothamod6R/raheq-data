import fs from 'fs/promises';
import { redisClient } from '../index.js';

export const shuffleArray = (arr) => {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`ERROR While reading file: ${error.message}`);
  }
};

export const handleCache = async (cacheKey, fetchFunction) => {
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const freshData = await fetchFunction();
    await redisClient.set(cacheKey, JSON.stringify(freshData));
    return freshData;
  } catch {
    return await fetchFunction();
  }
};

export const removeArabicDiacritics = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[\u06D6-\u06ED]/g, '')
    .replace(/[\u0610-\u061A]/g, '')
    .replace(/[\u0653-\u065F]/g, '')
    .replace(/[\u0670]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
};


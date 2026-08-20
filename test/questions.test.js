import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { registerRedisMock } from './helpers.js';

registerRedisMock();

const {
    getQuestions,
    getRandomQuestions,
    getQuestionsVersion,
} = await import('../src/controllers/questions.js');

let app;

test.before(async () => {
    app = Fastify({ logger: false });
    app.get('/api/questions', getQuestions);
    app.get('/api/questions/random', getRandomQuestions);
    app.get('/api/questions/version', getQuestionsVersion);
    await app.ready();
});

test.after(async () => {
    await app.close();
});

test('GET /api/questions returns all questions', async () => {
    const res = await app.inject('/api/questions');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(
        body.every(
            (q) =>
                q.id &&
                q.level &&
                q.question_name &&
                Array.isArray(q.answers) &&
                q.answers.length > 0 &&
                typeof q.correct_answer === 'number',
        ),
    );
});

test('GET /api/questions never leaks the internal version-marker object', async () => {
    const res = await app.inject('/api/questions');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(
        body.every((q) => q.question_name),
        'the version marker ({ version }) must be excluded from the results',
    );
    assert.ok(!body.some((q) => 'version' in q && !('level' in q)));
});

test('GET /api/questions filters by level', async () => {
    const res = await app.inject('/api/questions?level=easy');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((q) => q.level === 'easy'));
});

test('GET /api/questions filters by keyword', async () => {
    const res = await app.inject('/api/questions?keyword=سورة');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    for (const q of body) {
        const inQuestion = q.question_name.toLowerCase().includes('سورة');
        const inAnswers = q.answers.some((a) => a.toLowerCase().includes('سورة'));
        assert.equal(inQuestion || inAnswers, true, `question ${q.id} should relate to سورة`);
    }
});

test('GET /api/questions returns an empty list for an unmatched keyword', async () => {
    const res = await app.inject('/api/questions?keyword=zzzzznomatch');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), []);
});

test('GET /api/questions/version returns the version number', async () => {
    const res = await app.inject('/api/questions/version');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { version: 1 });
});

test('GET /api/questions/random returns one random question by default', async () => {
    const res = await app.inject('/api/questions/random');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.equal(body.length, 1);
    assert.ok(body[0].question_name);
});

test('GET /api/questions/random returns the requested count', async () => {
    const res = await app.inject('/api/questions/random?count=3');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length <= 3);
    assert.ok(body.length > 0);
});

test('GET /api/questions/random filters by difficulty', async () => {
    const res = await app.inject('/api/questions/random?diffuclt=hard');
    assert.equal(res.statusCode, 200);
    const body = res.json();

    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok(body.every((q) => q.level === 'hard'));
});

test('GET /api/questions/random handles an invalid count by falling back to one', async () => {
    const res = await app.inject('/api/questions/random?count=abc');
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().length, 1);
});
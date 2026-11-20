import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { voiceMiddleware } from '../server/voice.js';

test('managed Telugu and Marathi voice routes forward formats and keep the key server-side', async (t) => {
  const calls = [];
  const mockFetch = async (url, request) => {
    calls.push({ url, request });
    return url.endsWith('/speech-to-text') ? Response.json({ transcript: 'నాకు పథకం కావాలి' })
      : Response.json({ audios: [Buffer.from('sample-audio').toString('base64')] });
  };
  const server = createServer(voiceMiddleware('mock-server-key', mockFetch));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const base = 'http://127.0.0.1:' + server.address().port;
  assert.deepEqual(await (await fetch(base + '/config')).json(), { managed: true });
  const reply = await fetch(base + '/recognise?lang=te-IN', { method: 'POST', headers: { 'Content-Type': 'audio/webm' }, body: 'mock recording' });
  assert.deepEqual(await reply.json(), { transcript: 'నాకు పథకం కావాలి' });
  assert.equal(calls[0].request.body.get('language_code'), 'te-IN');
  assert.equal(calls[0].request.body.get('mode'), 'transcribe');
  assert.equal(calls[0].request.headers['api-subscription-key'], 'mock-server-key');
  const tts = await fetch(base + '/speak?lang=mr-IN', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'नमस्कार' }) });
  assert.equal(tts.status, 200);
  assert.equal(tts.headers.get('content-type'), 'audio/mpeg');
  assert.equal(await tts.text(), 'sample-audio');
  assert.equal(JSON.parse(calls[1].request.body).language_code, 'mr-IN');
  const crossOrigin = await fetch(base + '/config', { headers: { Origin: 'https://example.org' } });
  assert.equal(crossOrigin.status, 403);
  const badLang = await fetch(base + '/speak?lang=xx-ZZ', { method: 'POST' });
  assert.equal(badLang.status, 400);
  assert.equal(calls.length, 2);
});

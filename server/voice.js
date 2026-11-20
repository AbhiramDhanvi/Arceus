const supported = new Set(['en-IN', 'hi-IN', 'te-IN', 'mr-IN']);
const audioFormats = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/wav': 'wav' };
const speakers = { 'en-IN': 'ishita', 'hi-IN': 'priya', 'te-IN': 'neha', 'mr-IN': 'ritu' };
const provider = 'https://api.sarvam.ai';

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function read(req, limit) {
  const chunks = [];
  let size = 0;
  if (Number(req.headers['content-length']) > limit) throw new RangeError('Request too large');
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new RangeError('Request too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function voiceMiddleware(apiKey, fetcher = fetch, { publicOrigin, verifyUser } = {}) {
  let inflight = 0;
  let windowEnd = 0;
  let totalTurns = 0;
  const turns = new Map();
  const authRequired = Boolean(verifyUser);
  return async (req, res) => {
    const localRequest = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    const host = req.headers.host ?? '';
    const localHost = /^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i.test(host);
    const origin = req.headers.origin;
    const allowed = publicOrigin ? !origin || origin === publicOrigin
      : localRequest && localHost && (!origin || origin === 'http://' + host || origin === 'https://' + host);
    if (!allowed || req.headers['sec-fetch-site'] === 'cross-site') return send(res, 403, { error: 'Voice requests must come from ARCEUS.' });
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/config') return send(res, 200, { managed: Boolean(apiKey), ...(authRequired ? { authRequired } : {}) });
    if (req.method !== 'POST' || !['/recognise', '/speak'].includes(url.pathname)) return send(res, 404, { error: 'Unknown voice route.' });
    if (!apiKey) return send(res, 503, { error: 'Managed voice is not configured.' });
    const language = url.searchParams.get('lang');
    if (!supported.has(language)) return send(res, 400, { error: 'Unsupported voice language.' });
    if (inflight >= 4) return send(res, 429, { error: 'Voice is busy. Try again shortly.' });
    inflight++;
    try {
      if (verifyUser) {
        const authorization = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_.-]{30,4096})$/i);
        const userId = authorization ? await verifyUser(authorization[1]) : null;
        if (!userId) return send(res, 401, { error: 'Sign in to use managed speech.' });
        const now = Date.now();
        if (now >= windowEnd) {
          windowEnd = now + 300000;
          totalTurns = 0;
          turns.clear();
        }
        const usage = turns.get(userId) ?? 0;
        if (usage >= 24 || totalTurns >= 160) {
          res.setHeader('Retry-After', Math.ceil((windowEnd - now) / 1000));
          return send(res, 429, { error: 'The speech limit was reached. Try again in a few minutes.' });
        }
        turns.set(userId, usage + 1);
        totalTurns++;
      }
      const decoding = url.pathname === '/recognise';
      const type = (req.headers['content-type'] ?? '').split(';')[0];
      let body;
      if (decoding) {
        const extension = audioFormats[type];
        if (!extension) return send(res, 415, { error: 'Unsupported audio format.' });
        const clip = await read(req, 3 * 1024 * 1024);
        if (!clip.length) return send(res, 400, { error: 'Empty recording.' });
        body = new FormData();
        body.set('file', new Blob([clip], { type }), 'voice.' + extension);
        body.set('language_code', language);
        body.set('model', 'saaras:v4');
        body.set('mode', 'transcribe');
      } else {
        if (type !== 'application/json') return send(res, 415, { error: 'Expected JSON.' });
        const parsed = JSON.parse(await read(req, 16 * 1024));
        if (typeof parsed?.text !== 'string' || !parsed.text.trim() || parsed.text.length > 2500) return send(res, 400, { error: 'Invalid text length.' });
        body = JSON.stringify({ text: parsed.text, language_code: language, model: 'bulbul:v3', speaker: speakers[language], output_audio_codec: 'mp3' });
      }
      const response = await fetcher(provider + (decoding ? '/speech-to-text' : '/text-to-speech'), {
        method: 'POST',
        headers: { 'api-subscription-key': apiKey, ...(decoding ? {} : { 'Content-Type': 'application/json' }) },
        body,
        signal: AbortSignal.timeout(16000),
      });
      if (!response.ok) return send(res, 502, { error: 'The speech provider is unavailable.' });
      const payload = await response.json();
      if (decoding && typeof payload.transcript === 'string') return send(res, 200, { transcript: payload.transcript.slice(0, 500) });
      if (!decoding && typeof payload.audios?.[0] === 'string') return send(res, 200, Buffer.from(payload.audios[0], 'base64'), 'audio/mpeg');
      return send(res, 502, { error: 'Unexpected speech provider response.' });
    } catch (error) {
      const status = error instanceof RangeError ? 413 : error instanceof SyntaxError ? 400 : 502;
      if (!res.destroyed) send(res, status, { error: 'The voice request could not be completed.' });
    } finally {
      inflight--;
    }
  };
}

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voiceMiddleware } from './voice.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.ARCEUS_PUBLIC_URL;
const providerKey = process.env.SARVAM_API_KEY;

async function verifyUser(token) {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const response = await fetch(new URL('/auth/v1/user', supabaseUrl), {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const user = await response.json();
    return !user.is_anonymous && user.email_confirmed_at && typeof user.id === 'string' ? user.id : null;
  } catch {
    return null;
  }
}

const voice = publicUrl
  ? voiceMiddleware(providerKey, fetch, { publicOrigin: new URL(publicUrl).origin, verifyUser })
  : voiceMiddleware(providerKey);

const readFile = async (req, res, filename, immutability) => {
  const file = await stat(filename).catch(() => null);
  if (!file?.isFile()) return false;
  res.writeHead(200, {
    'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
    'Content-Length': file.size,
    'Cache-Control': immutability ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(filename).on('error', () => res.destroy()).pipe(res);
  return true;
};

const server = createServer({ requestTimeout: 35000, headersTimeout: 10000 }, async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=()');
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (pathname.startsWith('/api/voice/')) {
    req.url = req.url.slice('/api/voice'.length);
    await voice(req, res);
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(req.method === 'HEAD' ? '' : '{"ok":true}');
    return;
  }
  if (pathname.split('/').some((part) => part.startsWith('.')) || pathname.includes('\\') || pathname.includes('\0')) {
    res.writeHead(404).end();
    return;
  }
  const file = resolve(root, '.' + (['/', '/auth/callback'].includes(pathname) ? '/index.html' : pathname));
  const child = relative(root, file);
  if (!child || child === '..' || child.startsWith('..' + sep)) {
    res.writeHead(404).end();
    return;
  }
  if (!await readFile(req, res, file, pathname.startsWith('/assets/'))) res.writeHead(404).end();
});

const port = Number(process.env.PORT || 10000);
server.listen(port, process.env.RENDER ? '0.0.0.0' : '127.0.0.1', () => console.log('ARCEUS listening on port ' + port));
process.on('SIGTERM', () => server.close());

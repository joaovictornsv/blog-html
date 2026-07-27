#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 8000;
const ROOT = path.resolve(__dirname, '../..');
const TXT_DIR = path.join(ROOT, 'txt');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function resolveDraftPath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.startsWith('txt/')) {
    return null;
  }

  const normalized = path.posix.normalize(relativePath.replace(/\\/g, '/'));
  if (normalized.startsWith('../') || normalized.includes('/../') || !normalized.startsWith('txt/')) {
    return null;
  }

  const absolute = path.resolve(ROOT, normalized);
  if (!absolute.startsWith(TXT_DIR + path.sep) && absolute !== TXT_DIR) {
    return null;
  }

  return absolute;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleSave(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const target = resolveDraftPath(payload.path);
  if (!target) {
    sendJson(res, 400, { error: 'Only paths under txt/ are allowed' });
    return;
  }

  if (typeof payload.content !== 'string') {
    sendJson(res, 400, { error: 'content must be a string' });
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, payload.content, 'utf8');
  sendJson(res, 200, { ok: true, path: payload.path });
}

function serveStatic(req, res, pathname) {
  let safePath = pathname === '/' ? '/index.html' : pathname;
  if (safePath.endsWith('/')) {
    safePath += 'index.html';
  }

  let filePath = path.resolve(ROOT, '.' + safePath);

  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (indexErr, indexStats) => {
        if (indexErr || !indexStats.isFile()) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        sendFile(res, filePath);
      });
      return;
    }

    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    sendFile(res, filePath);
  });
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/draft/save') {
    await handleSave(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  serveStatic(req, res, decodeURIComponent(url.pathname));
});

server.listen(PORT, () => {
  console.log(`Draft review server running at http://localhost:${PORT}/`);
  console.log(`Tracker: http://localhost:${PORT}/tools/draft-review/`);
});

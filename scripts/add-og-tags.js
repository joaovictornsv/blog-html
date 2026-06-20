const fs = require('fs');
const path = require('path');
const {
  BLOG_BASE,
  DEVLOG_BASE,
  getDescriptionForFile,
  upsertOgTag,
  upsertTwitterTag,
} = require('./seo-utils');

const ROOT = path.join(__dirname, '..');

const DEFAULT_OG_IMAGES = {
  blog: `${BLOG_BASE}/og-image.png`,
  devlog: `${DEVLOG_BASE}/og-image.png`,
};

function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function getOgType(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html' || rel === 'devlog.html' || rel === 'my-book-recommendations.html') {
    return 'website';
  }
  if (rel.startsWith('posts/') || rel.startsWith('devlog/')) {
    return 'article';
  }
  return 'website';
}

function getSiteKey(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const isDevlog = rel === 'devlog.html' || rel.startsWith('devlog/') || rel === 'e404-devlog.html';
  return isDevlog ? 'devlog' : 'blog';
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1].trim() : '';
}

function extractCanonical(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)">/);
  return match ? match[1] : '';
}

const files = collectHtmlFiles(ROOT).filter((f) => !f.endsWith('e404.html') && !f.endsWith('e404-devlog.html'));

for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const title = extractTitle(html);
  const description = getDescriptionForFile(file, html);
  const url = extractCanonical(html);
  const type = getOgType(file);
  const image = DEFAULT_OG_IMAGES[getSiteKey(file)];

  let head = html.match(/<head>[\s\S]*?<\/head>/)[0];
  head = upsertOgTag(head, 'og:title', title);
  head = upsertOgTag(head, 'og:description', description);
  head = upsertOgTag(head, 'og:url', url);
  head = upsertOgTag(head, 'og:type', type);
  head = upsertOgTag(head, 'og:image', image);
  head = upsertTwitterTag(head, 'twitter:card', 'summary');
  head = upsertTwitterTag(head, 'twitter:title', title);
  head = upsertTwitterTag(head, 'twitter:description', description);

  const updated = html.replace(/<head>[\s\S]*?<\/head>/, head);
  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)}`);
}

console.log('\nDone. Note: og:image points to og-image.png — add that asset per site (see docs/seo-issues.md).');

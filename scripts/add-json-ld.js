const fs = require('fs');
const path = require('path');
const {
  BLOG_BASE,
  DEVLOG_BASE,
  upsertJsonLd,
} = require('./seo-utils');

const ROOT = path.join(__dirname, '..');
const AUTHOR = {
  '@type': 'Person',
  name: 'João Victor',
  url: 'https://joaovictornsv.dev',
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

function extractTitle(html) {
  return (html.match(/<title>([^<]+)<\/title>/) || [])[1]?.trim() || '';
}

function extractCanonical(html) {
  return (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1] || '';
}

function extractDescription(html) {
  return (html.match(/<meta name="description" content="([^"]+)">/) || [])[1] || '';
}

function extractDatePublished(html) {
  const match = html.match(/<time[^>]*class="post-date"[^>]*datetime="([^"]+)"/);
  return match ? match[1] : null;
}

function getPageKind(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return 'blog-home';
  if (rel === 'devlog.html') return 'devlog-home';
  if (rel.startsWith('posts/')) return 'blog-post';
  if (rel.startsWith('devlog/')) return 'devlog-post';
  return 'other';
}

function buildJsonLd(filePath, html) {
  const kind = getPageKind(filePath);
  const title = extractTitle(html);
  const url = extractCanonical(html);
  const description = extractDescription(html);

  if (kind === 'blog-home') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "JV's blog",
      url: BLOG_BASE,
      description,
      author: AUTHOR,
      sameAs: [DEVLOG_BASE],
    };
  }

  if (kind === 'devlog-home') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "JV's devlog",
      url: DEVLOG_BASE,
      description,
      author: AUTHOR,
      sameAs: [BLOG_BASE],
    };
  }

  if (kind === 'blog-post' || kind === 'devlog-post') {
    const datePublished = extractDatePublished(html);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      url,
      description,
      author: AUTHOR,
      mainEntityOfPage: url,
      publisher: {
        '@type': 'Person',
        name: AUTHOR.name,
      },
    };
    if (datePublished) jsonLd.datePublished = datePublished;
    return jsonLd;
  }

  return null;
}

const files = collectHtmlFiles(ROOT).filter((f) => {
  const kind = getPageKind(f);
  return kind !== 'other';
});

for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const jsonLd = buildJsonLd(file, html);
  if (!jsonLd) continue;

  const updated = html.replace(
    /<head>([\s\S]*?)<\/head>/,
    (_, head) => `<head>${upsertJsonLd(head, 'json-ld', jsonLd)}\n</head>`
  );

  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)}`);
}

console.log('\nDone.');

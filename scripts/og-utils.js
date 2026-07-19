const fs = require('fs');
const path = require('path');
const { BLOG_BASE } = require('./seo-utils');
const { collectHtmlFiles } = require('./sitemap');

const ROOT = path.join(__dirname, '..');
const OG_IMAGE_RE = /<meta property="og:image" content="([^"]*)">/;

const INDEX_OG_DESCRIPTIONS = {
  'index.html': "Here you'll find my thoughts about life.",
  'devlog/index.html': 'Notes about software development, technical experiments, and lessons from building things.',
};

const SKIP_FILES = new Set([
  path.join(ROOT, 'e404.html'),
  path.join(ROOT, 'links', 'wise-drop-example.html'),
]);

function getOgImageRelPath(htmlFilePath) {
  const rel = path.relative(ROOT, htmlFilePath).replace(/\\/g, '/');
  return `og/${rel.replace(/\.html$/, '.png')}`;
}

function getOgImagePath(htmlFilePath) {
  return path.join(ROOT, getOgImageRelPath(htmlFilePath));
}

function getOgImageUrl(htmlFilePath) {
  return `${BLOG_BASE}/${getOgImageRelPath(htmlFilePath)}`;
}

function extractPageTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1].trim() : 'JV\'s blog';
}

function extractPageDescription(html) {
  const match = html.match(/<meta name="description" content="([^"]*)">/);
  return match ? match[1].trim() : null;
}

function sanitizeOgText(text) {
  if (!text) return text;

  const cleaned = text
    .replace(/Jo[aã]o Victor's/gi, '')
    .replace(/Jo[aã]o Victor/gi, '')
    .replace(/\bby\s+(?=[—–-])/gi, '')
    .replace(/\s+by\s+(?=[,.]|$)/gi, ' ')
    .replace(/\bby\s+(?=with|and|a\b)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/—\s*—/g, '—')
    .replace(/^\s*by\s+/i, '')
    .replace(/\s+by\s*$/i, '')
    .trim();

  return cleaned || text;
}

function sanitizeOgDescription(text) {
  if (!text) return text;

  const cleaned = sanitizeOgText(text)
    .replace(/\s+[—–-]\s+/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned || text;
}

function getOgDisplayTitle(title) {
  return title.replace(/\s+[—–-]\s+JV's blog$/i, '').trim() || title;
}

function getBrand(htmlFilePath) {
  const rel = path.relative(ROOT, htmlFilePath).replace(/\\/g, '/');
  if (rel.startsWith('devlog/')) return "JV's devlog";
  return "JV's blog";
}

function getCtaPlacement(htmlFilePath) {
  const rel = path.relative(ROOT, htmlFilePath).replace(/\\/g, '/');
  if (rel === 'index.html' || rel === 'devlog/index.html' || rel.startsWith('links/')) {
    return 'content';
  }
  return 'header';
}

function getOgImageContent(htmlFilePath, html, title) {
  const brand = getBrand(htmlFilePath);
  const rel = path.relative(ROOT, htmlFilePath).replace(/\\/g, '/');
  const metaDescription = extractPageDescription(html);

  let content;
  if (rel === 'index.html' || rel === 'devlog/index.html') {
    const parts = title.split(/\s+[—–-]\s+/);
    content = {
      brand: null,
      title: parts[0]?.trim() || title,
      description: INDEX_OG_DESCRIPTIONS[rel] || null,
    };
  } else {
    content = {
      brand,
      title: getOgDisplayTitle(title),
      description: metaDescription,
    };
  }

  return {
    brand: content.brand,
    title: sanitizeOgText(content.title),
    description: content.description ? sanitizeOgDescription(content.description) : null,
    ctaPlacement: getCtaPlacement(htmlFilePath),
  };
}

function collectOgPages() {
  const pages = [
    path.join(ROOT, 'index.html'),
    ...collectHtmlFiles(path.join(ROOT, 'posts')),
    ...collectHtmlFiles(path.join(ROOT, 'devlog')),
    ...collectHtmlFiles(path.join(ROOT, 'links')),
  ];

  return [...new Set(pages)]
    .filter((file) => !SKIP_FILES.has(file))
    .sort();
}

function patchOgImageTag(htmlFilePath, ogImageUrl) {
  const html = fs.readFileSync(htmlFilePath, 'utf8');
  const newTag = `<meta property="og:image" content="${ogImageUrl}">`;

  if (OG_IMAGE_RE.test(html)) {
    const updated = html.replace(OG_IMAGE_RE, newTag);
    if (updated !== html) {
      fs.writeFileSync(htmlFilePath, updated);
      return true;
    }
    return false;
  }

  const anchor = html.match(/<meta name="twitter:card"[^>]*>/) ||
    html.match(/<meta name="description"[^>]*>/);
  if (!anchor) return false;

  const updated = html.replace(anchor[0], `${anchor[0]}\n  ${newTag}`);
  fs.writeFileSync(htmlFilePath, updated);
  return true;
}

module.exports = {
  ROOT,
  collectOgPages,
  extractPageDescription,
  extractPageTitle,
  getOgDisplayTitle,
  getOgImageContent,
  getOgImagePath,
  getOgImageUrl,
  patchOgImageTag,
  sanitizeOgDescription,
  sanitizeOgText,
};

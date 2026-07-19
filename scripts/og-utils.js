const fs = require('fs');
const path = require('path');
const { BLOG_BASE } = require('./seo-utils');
const { collectHtmlFiles } = require('./sitemap');

const ROOT = path.join(__dirname, '..');
const OG_IMAGE_RE = /<meta property="og:image" content="([^"]*)">/;

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

function getOgDisplayTitle(title) {
  return title.replace(/\s+[—–-]\s+JV's blog$/i, '').trim() || title;
}

function getIndexOgImageContent(title) {
  const parts = title.split(/\s+[—–-]\s+/);
  return {
    title: parts[0]?.trim() || title,
    subtitle: parts.slice(1).join(' — ').trim() || null,
    showFooter: false,
  };
}

function getOgImageContent(htmlFilePath, title) {
  const rel = path.relative(ROOT, htmlFilePath).replace(/\\/g, '/');

  if (rel === 'index.html' || rel === 'devlog/index.html') {
    return getIndexOgImageContent(title);
  }

  return {
    title: getOgDisplayTitle(title),
    subtitle: null,
    showFooter: true,
  };
}

function collectOgPages() {
  const pages = [
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'my-book-recommendations.html'),
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
  extractPageTitle,
  getOgDisplayTitle,
  getOgImageContent,
  getOgImagePath,
  getOgImageUrl,
  patchOgImageTag,
};

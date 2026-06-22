const path = require('path');

const BLOG_BASE = 'https://blog.joaovictornsv.dev';
const DEVLOG_BASE = `${BLOG_BASE}/devlog`;

const DATE_LINE_RE = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;

function escapeHtmlAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function truncateDescription(text, maxLen = 155) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const truncated = cleaned.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractPostDescription(html) {
  const match = html.match(/<div id="post-body">([\s\S]*?)<\/div>/);
  if (!match) return null;

  const raw = match[1];
  const blocks = raw.split(/\n\n+/).map((b) => stripHtml(b)).filter(Boolean);

  for (const block of blocks) {
    if (DATE_LINE_RE.test(block)) continue;
    if (block.length < 20) continue;
    return truncateDescription(block);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  return titleMatch ? truncateDescription(titleMatch[1]) : null;
}

function getCanonicalUrl(filePath) {
  const rel = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');

  if (rel === 'index.html') return `${BLOG_BASE}/`;
  if (rel === 'devlog/index.html') return `${DEVLOG_BASE}/`;
  return `${BLOG_BASE}/${rel}`;
}

module.exports = {
  BLOG_BASE,
  DEVLOG_BASE,
  escapeHtmlAttr,
  extractPostDescription,
  getCanonicalUrl,
};

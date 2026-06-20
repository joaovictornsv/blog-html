const fs = require('fs');
const path = require('path');

const BLOG_BASE = 'https://blog.joaovictornsv.dev';
const DEVLOG_BASE = 'https://devlog.joaovictornsv.dev';

const STATIC_DESCRIPTIONS = {
  'index.html': "Personal blog by João Victor with posts about technology, productivity, and life.",
  'devlog.html': "Software development notes, technical experiments, and lessons from building things by João Victor.",
  'my-book-recommendations.html': "Book recommendations by João Victor — technical, personal development, and more.",
  'e404.html': "Page not found on JV's blog.",
  'e404-devlog.html': "Page not found on JV's devlog.",
};

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

function getDescriptionForFile(filePath, html) {
  const basename = path.basename(filePath);
  if (STATIC_DESCRIPTIONS[basename]) return STATIC_DESCRIPTIONS[basename];

  if (filePath.includes('/posts/') || filePath.includes('/devlog/')) {
    return extractPostDescription(html);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  return titleMatch ? truncateDescription(titleMatch[1]) : null;
}

function getCanonicalUrl(filePath) {
  const rel = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const isDevlog = rel === 'devlog.html' || rel.startsWith('devlog/') || rel === 'e404-devlog.html';
  const base = isDevlog ? DEVLOG_BASE : BLOG_BASE;

  if (rel === 'index.html') return `${BLOG_BASE}/`;
  if (rel === 'devlog.html') return `${DEVLOG_BASE}/`;
  return `${base}/${rel}`;
}

function upsertMetaTag(head, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtmlAttr(content)}">`;
  const re = new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'i');
  if (re.test(head)) return head.replace(re, tag);
  return head.replace(/<title>[^<]*<\/title>/, (m) => `${m}\n  ${tag}`);
}

function upsertLinkTag(head, rel, href) {
  const tag = `<link rel="${rel}" href="${href}">`;
  const re = new RegExp(`<link\\s+rel="${rel}"[^>]*>`, 'i');
  if (re.test(head)) return head.replace(re, tag);
  return head.replace(/<title>[^<]*<\/title>/, (m) => `${m}\n  ${tag}`);
}

function upsertOgTag(head, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtmlAttr(content)}">`;
  const re = new RegExp(`<meta\\s+property="${property}"[^>]*>`, 'i');
  if (re.test(head)) return head.replace(re, tag);
  return head;
}

function upsertJsonLd(head, id, jsonLd) {
  const script = `<script type="application/ld+json" id="${id}">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  const re = new RegExp(`<script[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/script>`, 'i');
  if (re.test(head)) return head.replace(re, script);
  return head + `\n  ${script}`;
}

module.exports = {
  BLOG_BASE,
  DEVLOG_BASE,
  STATIC_DESCRIPTIONS,
  escapeHtmlAttr,
  truncateDescription,
  stripHtml,
  extractPostDescription,
  getDescriptionForFile,
  getCanonicalUrl,
  upsertMetaTag,
  upsertLinkTag,
  upsertOgTag,
  upsertJsonLd,
};

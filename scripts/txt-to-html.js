const fs = require('fs');
const path = require('path');
const { extractPostDescription, escapeHtmlAttr, BLOG_BASE } = require('./seo-utils');
const { formatPostBody } = require('./post-body');

const ROOT = path.join(__dirname, '..');
const TXT_DIR = path.join(ROOT, 'txt');
const DRAFT_DIR = path.join(ROOT, 'html');

function parsePost(text, filename) {
  const lines = text.split('\n');
  const title = lines[0] || 'Untitled';
  const content = lines.slice(1).join('\n').trim();

  return {
    title,
    content,
    slug: filename.replace('.txt', ''),
  };
}

function generateDraftHtml(post) {
  const draftHtml = `<div id="post-body">${post.content}</div>`;
  const description = extractPostDescription(draftHtml) || post.title;
  const bodyHtml = formatPostBody(post.content, { convertHeadings: true });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <meta name="description" content="${escapeHtmlAttr(description)}">
  <link rel="canonical" href="${BLOG_BASE}/posts/${post.slug}.html">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <main>
    <a href="../index.html" class="back">&lt; back</a>

    <article id="post-content">
      <h1 id="post-title">${post.title}</h1>
      <div id="post-body">${bodyHtml}</div>
    </article>
  </main>
</body>
</html>
`;
}

function buildSingle(filename) {
  if (!filename) {
    console.error('Usage: node scripts/txt-to-html.js <filename.txt>');
    console.error('Example: node scripts/txt-to-html.js my-new-post.txt');
    process.exit(1);
  }

  if (!filename.endsWith('.txt')) {
    filename = `${filename}.txt`;
  }

  const filePath = path.join(TXT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(DRAFT_DIR)) {
    fs.mkdirSync(DRAFT_DIR, { recursive: true });
  }

  const text = fs.readFileSync(filePath, 'utf-8');
  const post = parsePost(text, filename);
  const html = generateDraftHtml(post);
  const outputPath = path.join(DRAFT_DIR, `${post.slug}.html`);
  fs.writeFileSync(outputPath, html);

  console.log(`✓ Draft: html/${post.slug}.html`);
  console.log(`  Title: ${post.title}`);
  console.log('\nNext steps:');
  console.log(`  1. Copy body markup from html/${post.slug}.html`);
  console.log(`  2. Create posts/${post.slug}.html using an existing post as the <head> template`);
  console.log(`  3. Add <li><a href="posts/${post.slug}.html">${post.title}</a></li> to index.html`);
  console.log('  4. Run: node scripts/update-index-listings.js');
}

const filename = process.argv[2];
buildSingle(filename);

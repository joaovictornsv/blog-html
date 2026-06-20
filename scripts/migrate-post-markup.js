const fs = require('fs');
const path = require('path');
const { formatPostBody } = require('./post-body');

const ROOT = path.join(__dirname, '..');
const convertHeadings = process.argv.includes('--headings');

function collectPostFiles() {
  const posts = fs.readdirSync(path.join(ROOT, 'posts'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, 'posts', f));
  const devlog = fs.readdirSync(path.join(ROOT, 'devlog'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, 'devlog', f));
  return [...posts, ...devlog];
}

for (const file of collectPostFiles()) {
  const html = fs.readFileSync(file, 'utf-8');
  const match = html.match(/<div id="post-body">([\s\S]*?)<\/div>/);
  if (!match) {
    console.warn(`⚠ No post-body in ${path.relative(ROOT, file)}`);
    continue;
  }

  const formatted = formatPostBody(match[1], { convertHeadings });
  const updated = html.replace(
    /<div id="post-body">[\s\S]*?<\/div>/,
    `<div id="post-body">\n${formatted}\n</div>`
  );

  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)}`);
}

console.log(`\nDone (${convertHeadings ? 'with' : 'without'} heading conversion).`);

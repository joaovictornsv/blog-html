const fs = require('fs');
const path = require('path');
const { getCanonicalUrl, upsertLinkTag } = require('./seo-utils');

const ROOT = path.join(__dirname, '..');

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

const files = collectHtmlFiles(ROOT);

for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const canonical = getCanonicalUrl(file);

  if (html.includes('rel="canonical"')) {
    console.log(`○ Skipped (already has canonical): ${path.relative(ROOT, file)}`);
    continue;
  }

  const updated = html.replace(
    /(<head>[\s\S]*?)(<\/head>)/,
    (_, head, close) => `${upsertLinkTag(head, 'canonical', canonical)}${close}`
  );

  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)} → ${canonical}`);
}

console.log(`\nDone.`);

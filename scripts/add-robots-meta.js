const fs = require('fs');
const path = require('path');
const { upsertMetaTag } = require('./seo-utils');

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

const robotsByFile = {
  'e404.html': 'noindex, follow',
  'e404-devlog.html': 'noindex, follow',
};

const files = collectHtmlFiles(ROOT);

for (const file of files) {
  const basename = path.basename(file);
  const directive = robotsByFile[basename] || 'index, follow';
  const html = fs.readFileSync(file, 'utf-8');

  const updated = html.replace(
    /<head>([\s\S]*?)<\/head>/,
    (_, head) => `<head>${upsertMetaTag(head, 'robots', directive)}\n</head>`
  );

  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)} → ${directive}`);
}

console.log('\nDone.');

const fs = require('fs');
const path = require('path');
const { getDescriptionForFile, upsertMetaTag } = require('./seo-utils');

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
  const description = getDescriptionForFile(file, html);
  if (!description) {
    console.warn(`⚠ No description for ${path.relative(ROOT, file)}`);
    continue;
  }

  if (html.includes('name="description"')) {
    console.log(`○ Skipped (already has description): ${path.relative(ROOT, file)}`);
    continue;
  }

  const updated = html.replace(
    /(<head>[\s\S]*?)(<\/head>)/,
    (_, head, close) => `${upsertMetaTag(head, 'description', description)}${close}`
  );

  fs.writeFileSync(file, updated);
  console.log(`✓ ${path.relative(ROOT, file)}`);
}

console.log(`\nDone. Updated ${files.length} files checked.`);

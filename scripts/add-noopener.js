const fs = require('fs');
const path = require('path');

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

let count = 0;

for (const file of collectHtmlFiles(ROOT)) {
  let html = fs.readFileSync(file, 'utf-8');
  const updated = html.replace(
    /<a\s+([^>]*?)target="_blank"([^>]*)>/gi,
    (match, before, after) => {
      const attrs = `${before}${after}`;
      if (/rel="[^"]*noopener/i.test(attrs)) return match;
      if (/rel="/i.test(attrs)) {
        return match.replace(/rel="([^"]*)"/i, 'rel="$1 noopener noreferrer"');
      }
      return `<a ${before}target="_blank" rel="noopener noreferrer"${after}>`;
    }
  );

  if (updated !== html) {
    fs.writeFileSync(file, updated);
    count++;
    console.log(`✓ ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nDone. Updated ${count} files.`);

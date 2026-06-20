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

function resolveInternalHref(fromFile, href) {
  if (href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('#')) return null;
  const fromDir = path.dirname(fromFile);
  const target = path.normalize(path.join(fromDir, href.split('?')[0].split('#')[0]));
  return target;
}

const htmlFiles = collectHtmlFiles(ROOT);
const broken = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const hrefs = [...content.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    const target = resolveInternalHref(file, href);
    if (!target) continue;
    if (!fs.existsSync(target)) {
      broken.push({ file: path.relative(ROOT, file), href, resolved: path.relative(ROOT, target) });
    }
  }
}

if (broken.length === 0) {
  console.log('No broken internal links found.');
} else {
  console.log(`Found ${broken.length} broken internal link(s):\n`);
  for (const b of broken) {
    console.log(`  ${b.file}`);
    console.log(`    href="${b.href}" → ${b.resolved} (missing)\n`);
  }
  process.exit(1);
}

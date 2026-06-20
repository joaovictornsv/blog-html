const fs = require('fs');
const path = require('path');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

const files = ['css/style.css', 'css/devlog.css'];

for (const file of files) {
  const fullPath = path.join(__dirname, '..', file);
  const source = fs.readFileSync(fullPath, 'utf-8');
  const minified = minifyCss(source);
  fs.writeFileSync(fullPath, minified);
  console.log(`✓ ${file}: ${source.length} → ${minified.length} bytes`);
}

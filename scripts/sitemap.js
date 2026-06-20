const fs = require('fs');
const path = require('path');

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

function generateSitemap({ siteUrl, pages, outputFile }) {
  const urls = pages
    .map((page) => {
      const loc = page.startsWith('http') ? page : `${siteUrl.replace(/\/$/, '')}${page.startsWith('/') ? page : `/${page}`}`;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, xml);
  console.log(`✓ Generated sitemap with ${pages.length} URLs: ${outputFile}`);
}

function generateRobotsTxt({ siteUrl, outputFile }) {
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`;
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, content);
  console.log(`✓ Generated robots.txt: ${outputFile}`);
}

module.exports = { collectHtmlFiles, generateSitemap, generateRobotsTxt };

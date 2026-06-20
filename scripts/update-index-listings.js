const fs = require('fs');
const path = require('path');
const { escapeHtmlAttr } = require('./seo-utils');

const ROOT = path.join(__dirname, '..');

function extractPostMeta(html) {
  const title = (html.match(/<h1 id="post-title">([^<]+)<\/h1>/) || [])[1]?.trim() || '';
  const description = (html.match(/<meta name="description" content="([^"]+)">/) || [])[1] || '';
  const timeMatch = html.match(/<time[^>]*class="post-date"[^>]*datetime="([^"]+)"[^>]*>([^<]+)<\/time>/);
  return {
    title,
    description,
    dateIso: timeMatch ? timeMatch[1] : null,
    dateDisplay: timeMatch ? timeMatch[2] : null,
  };
}

function buildListItem(href, label, meta) {
  const title = meta.title || label;
  const dateHtml = meta.dateIso
    ? `\n    <time datetime="${meta.dateIso}">${meta.dateDisplay}</time>`
    : '';
  const excerptHtml = meta.description
    ? `\n    <p class="post-excerpt">${meta.description}</p>`
    : '';

  return `    <li>
      <article class="post-listing">
        <a href="${href}">${title}</a>${dateHtml}${excerptHtml}
      </article>
    </li>`;
}

function updateIndexFile(indexPath, listClass) {
  const html = fs.readFileSync(indexPath, 'utf-8');
  const listMatch = html.match(new RegExp(`(<ul class="${listClass}">)([\\s\\S]*?)(</ul>)`));
  if (!listMatch) throw new Error(`List not found in ${indexPath}`);

  const items = [...listMatch[2].matchAll(/<li>\s*<a href="([^"]+)">([^<]*)<\/a>\s*<\/li>/g)];
  const newItems = items.map(([, href, label]) => {
    const postPath = path.join(path.dirname(indexPath), href);
    const postHtml = fs.existsSync(postPath) ? fs.readFileSync(postPath, 'utf-8') : '';
    const meta = postHtml ? extractPostMeta(postHtml) : { title: label.trim() };
    return buildListItem(href, label.trim(), meta);
  });

  const updated = html.replace(
    listMatch[0],
    `${listMatch[1]}\n${newItems.join('\n')}\n      ${listMatch[3]}`
  );

  fs.writeFileSync(indexPath, updated);
  console.log(`✓ Updated ${path.relative(ROOT, indexPath)} (${newItems.length} entries)`);
}

updateIndexFile(path.join(ROOT, 'index.html'), 'list');
updateIndexFile(path.join(ROOT, 'devlog.html'), 'list');

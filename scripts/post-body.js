const DATE_LINE_RE = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;

const CODE_LINE_RE = /^(const |let |var |function |if\s*\(|else|return |import |export |class |for\s*\(|while\s*\(|}\s*$|{\s*$|\w+\s*=\s*\([^)]*\)\s*=>)/;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseDisplayDate(text) {
  if (!DATE_LINE_RE.test(text.trim())) return null;
  const date = new Date(text.trim());
  if (isNaN(date.getTime())) return null;
  return {
    display: text.trim(),
    iso: date.toISOString().slice(0, 10),
  };
}

function convertStrongHeadings(html) {
  return html.replace(/<strong([^>]*)>([\s\S]*?)<\/strong>/g, (match, attrs, text) => {
    const isSubheading = /font-style:\s*italic/i.test(attrs);
    const tag = isSubheading ? 'h3' : 'h2';
    return `<${tag}>${text.trim()}</${tag}>`;
  });
}

function isDashListBlock(block) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && lines.every((line) => line.startsWith('- '));
}

function isNumberedListBlock(block) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));
}

function isCodeBlock(block) {
  if (/<[a-z]/i.test(block)) return false;
  const lines = block.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return false;
  const codeLike = lines.filter((line) => CODE_LINE_RE.test(line.trim()));
  return codeLike.length >= 2 || (lines.length >= 3 && codeLike.length >= 1);
}

function formatDashList(block) {
  const items = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => `  <li>${l.slice(2).trim()}</li>`);
  return `<ul>\n${items.join('\n')}\n</ul>`;
}

function formatNumberedList(block) {
  const items = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d+\.\s+/.test(l))
    .map((l) => `  <li>${l.replace(/^\d+\.\s+/, '')}</li>`);
  return `<ol>\n${items.join('\n')}\n</ol>`;
}

function formatBlockquote(block) {
  const text = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('> '))
    .map((l) => l.slice(2))
    .join(' ');
  return `<blockquote><p>${text}</p></blockquote>`;
}

function wrapParagraph(block) {
  const trimmed = block.trim();
  if (!trimmed) return '';
  if (/^<(p|h[1-6]|ul|ol|pre|blockquote|time)\b/i.test(trimmed)) return trimmed;
  if (/^<strong[\s\S]*<\/strong>$/i.test(trimmed)) return trimmed;
  if (/<[a-z][^>]*>/i.test(trimmed)) return `<p>${trimmed}</p>`;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

function splitBlocks(content) {
  const preserved = [];
  let working = content.replace(/<pre>[\s\S]*?<\/pre>/gi, (match) => {
    const key = `__PRE_BLOCK_${preserved.length}__`;
    preserved.push(match);
    return key;
  });

  const blocks = working.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block) => {
    for (let i = 0; i < preserved.length; i++) {
      block = block.replace(`__PRE_BLOCK_${i}__`, preserved[i]);
    }
    return block;
  });
}

function mergeConsecutiveLists(parts) {
  const merged = [];
  let i = 0;

  while (i < parts.length) {
    const singleUl = parts[i].match(/^<ul>\s*<li>([\s\S]*?)<\/li>\s*<\/ul>$/);
    const singleOl = parts[i].match(/^<ol>\s*<li>([\s\S]*?)<\/li>\s*<\/ol>$/);

    if (singleUl) {
      const items = [];
      while (i < parts.length) {
        const match = parts[i].match(/^<ul>\s*<li>([\s\S]*?)<\/li>\s*<\/ul>$/);
        if (!match) break;
        items.push(`  <li>${match[1]}</li>`);
        i++;
      }
      merged.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    if (singleOl) {
      const items = [];
      while (i < parts.length) {
        const match = parts[i].match(/^<ol>\s*<li>([\s\S]*?)<\/li>\s*<\/ol>$/);
        if (!match) break;
        items.push(`  <li>${match[1]}</li>`);
        i++;
      }
      merged.push(`<ol>\n${items.join('\n')}\n</ol>`);
      continue;
    }

    merged.push(parts[i]);
    i++;
  }

  return merged;
}

function formatPostBody(rawContent, { convertHeadings = false } = {}) {
  let content = rawContent.trim();
  if (convertHeadings) {
    content = convertStrongHeadings(content);
  }

  const blocks = splitBlocks(content);
  const parts = [];

  for (const block of blocks) {
    if (/^<pre>/i.test(block)) {
      parts.push(block);
      continue;
    }

    if (/^<h[23]>/i.test(block)) {
      parts.push(block);
      continue;
    }

    const plainText = block.replace(/<[^>]+>/g, '').trim();
    const date = parseDisplayDate(plainText);
    if (date && plainText === date.display) {
      parts.push(`<time class="post-date" datetime="${date.iso}">${date.display}</time>`);
      continue;
    }

    if (isDashListBlock(block)) {
      parts.push(formatDashList(block));
      continue;
    }

    if (isNumberedListBlock(block)) {
      parts.push(formatNumberedList(block));
      continue;
    }

    if (block.split('\n').every((l) => !l.trim() || l.trim().startsWith('> '))) {
      parts.push(formatBlockquote(block));
      continue;
    }

    if (isCodeBlock(block)) {
      parts.push(`<pre><code>${escapeHtml(block)}</code></pre>`);
      continue;
    }

    parts.push(wrapParagraph(block));
  }

  return mergeConsecutiveLists(parts.filter(Boolean)).join('\n\n');
}

module.exports = {
  DATE_LINE_RE,
  formatPostBody,
  convertStrongHeadings,
  parseDisplayDate,
};

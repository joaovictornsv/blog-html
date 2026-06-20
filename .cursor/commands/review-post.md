---
description: Review a blog or devlog post for SEO, markup gaps, and content formatting issues
---

# Review Post

Review the post I point to (file path, or the post we are working on). Fix clear issues in the HTML; report anything that needs my input.

Focus on **post-level** checks below.

## SEO & `<head>`

- [ ] `meta description` exists and is a **complete short phrase** — no trailing `…`
- [ ] Same description in `og:description`, `twitter:description`, and JSON-LD
- [ ] `link rel="canonical"` points to the correct subdomain URL (`blog` → `posts/`, `devlog` → `devlog/`)
- [ ] `meta robots` is `index, follow` on public posts
- [ ] Open Graph + Twitter tags present; JSON-LD `BlogPosting` has `headline`, `description`, `url`, `datePublished`
- [ ] Index listing excerpt (`index.html` or `devlog.html`) matches the post description — run `node scripts/update-index-listings.js` if stale

## Body markup

- [ ] Publish date is `<time class="post-date" datetime="YYYY-MM-DD">`, not plain text
- [ ] Paragraphs use `<p>`, section titles use `<h2>`/`<h3>` (not `<strong>`)
- [ ] Lists use `<ul>`/`<ol>`/`<li>` — flag any `- item` or `1. item` lines still inside `<p>` tags
- [ ] Horizontal rules are `<hr>`, not `---`
- [ ] Internal links resolve (relative paths within the same folder) — run `node scripts/check-links.js` if unsure
- [ ] `target="_blank"` links include `rel="noopener noreferrer"`

## Code & technical content

Common gaps from past posts — check the full body:

- [ ] Multi-line code, terminal output, config blocks → should be `<pre><code>`, not loose prose or split into many tiny blocks
- [ ] **Devlog only:** inline commands, file names, env vars, API names → `<span class="code-text">…</span>`
- [ ] Code snippets that belong together are in **one** `<pre><code>` block, not fragmented

## Output

1. **Summary** — pass / issues found (1 short paragraph)
2. **Issues table** — Issue | Location | Fix applied or suggested
3. Apply fixes directly when straightforward; list anything left for me to decide

If I only named a draft or `.txt` file, say what you cannot verify without the published HTML.

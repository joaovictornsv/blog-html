# Post HTML Checklist

Canonical markup and SEO standards for blog posts (`posts/`) and devlog entries (`devlog/`). Use when **creating** or **auditing** a post HTML file.

---

## SEO & `<head>`

- [ ] `meta description` exists and is a **complete short phrase** — no trailing `…`
- [ ] Same description in `og:description`, `twitter:description`, JSON-LD, and index excerpt
- [ ] `link rel="canonical"` points to the correct URL:
  - Blog: `https://blog.joaovictornsv.dev/posts/<slug>.html`
  - Devlog: `https://blog.joaovictornsv.dev/devlog/<slug>.html`
- [ ] `meta robots` is `index, follow` on public posts
- [ ] Open Graph + Twitter tags present
- [ ] `og:image` follows the URL convention:
  - Blog: `https://blog.joaovictornsv.dev/og/posts/<slug>.png`
  - Devlog: `https://blog.joaovictornsv.dev/og/devlog/<slug>.png`
  - Run `node scripts/generate-og-images.js` to generate the PNG (also runs in CI on deploy)
- [ ] JSON-LD `BlogPosting` has `headline`, `description`, `url`, `datePublished` (from `<time datetime>`)
- [ ] Devlog posts: stylesheet is `../css/style.css`

---

## Body markup

Inside `#post-body`:

- [ ] Publish date is `<time class="post-date" datetime="YYYY-MM-DD">`, not plain text
- [ ] Paragraphs use `<p>`, section titles use `<h2>`/`<h3>` (not `<strong>`)
- [ ] Lists use `<ul>`/`<ol>`/`<li>` — flag any `- item` or `1. item` lines still inside `<p>` tags
- [ ] Horizontal rules are `<hr>`, not `---`
- [ ] Markdown links `[text](url)` → `<a href="url">text</a>`
- [ ] Internal links use relative paths within the same folder (e.g. `other-post.html`)
- [ ] `target="_blank"` links include `rel="noopener noreferrer"`

When converting from `.txt`, `scripts/post-body.js` (`formatPostBody`) handles most body markup — verify output manually.

---

## Code & technical content

- [ ] Multi-line code, terminal output, config blocks → `<pre><code>`, not loose prose or split into many tiny blocks
- [ ] Code snippets that belong together are in **one** `<pre><code>` block, not fragmented
- [ ] **Devlog only:** inline commands, file names, env vars, API names → `<span class="code-text">…</span>`

---

## Index listing

After creating or updating a post:

- [ ] Entry added at the **top** of `<ul class="list">` in `index.html` (blog) or `devlog/index.html` (devlog)
- [ ] Bare link is fine initially: `<li><a href="posts/<slug>.html"><title></a></li>`
- [ ] Run `node scripts/update-index-listings.js` to rebuild entries with `<time>` and `<p class="post-excerpt">`
- [ ] Index excerpt matches the post meta description

---

## Verification scripts

- `node scripts/update-index-listings.js` — sync index excerpts and dates
- `node scripts/check-links.js` — verify internal links resolve
- `npm ci && node scripts/generate-og-images.js` — generate per-page OG images and sync `og:image` meta tags

---
description: Convert a new post from .txt to .html and add it to the posts list
---

A new blog post has been created in the `txt/` folder. Publish it with correct markup and SEO.

## 1. Generate HTML

Run the build script:

```
node scripts/txt-to-html.js <filename>.txt
```

Where `<filename>` is just the filename (e.g. `my-post.txt`), not the full path.

The script outputs a draft under `html/`. **Do not publish that file as-is.** Use it for title + body content, then create the final file at `posts/<slug>.html` using an existing post (e.g. `posts/organize-your-finances-like-a-company.html`) as the template for `<head>` and page shell.

`<slug>` = filename without `.txt`. `<title>` = first line of the `.txt` file.

## 2. Body markup

Inside `#post-body`, apply semantic HTML:

- First content line if it's a date → `<time class="post-date" datetime="YYYY-MM-DD">Month D, YYYY</time>`
- `### Section title` → `<h2>` (use `<h3>` for subsections)
- Each paragraph → `<p>…</p>`
- `- item` blocks → `<ul><li>…</li></ul>` (never keep `- ` lines inside `<p>`)
- `1. item` blocks → `<ol><li>…</li></ol>`
- `---` on its own line → `<hr>`
- Markdown links `[text](url)` → `<a href="url">text</a>`
- Multi-line code → `<pre><code>…</code></pre>`

`scripts/post-body.js` handles most of this when content is passed through `formatPostBody` — verify the output manually.

## 3. SEO `<head>`

Copy structure from any current `posts/*.html` file. Required on every post:

- `meta name="description"` — **complete short phrase**, no `…` truncation; prefer the post opening
- `link rel="canonical"` → `https://blog.joaovictornsv.dev/posts/<slug>.html`
- `meta robots`, Open Graph, Twitter Card tags
- JSON-LD `BlogPosting` with `headline`, `description`, `url`, `datePublished` (from `<time datetime>`)

**Same description text** everywhere: meta, OG, Twitter, JSON-LD, and index excerpt.

## 4. Index listing

Add a bare entry at the **top** of `<ul class="list">` in `index.html`:

```html
<li><a href="posts/<slug>.html"><title></a></li>
```

Then run:

```
node scripts/update-index-listings.js
```

This rebuilds each list item with `<article>`, `<time>`, and `<p class="post-excerpt">` from the post file.

## 5. Final checks

- [ ] Date is `<time datetime="…">`, not plain text
- [ ] Lists are real `<ul>`/`<ol>`, not hyphens in paragraphs
- [ ] Internal links use relative paths within `posts/` (e.g. `other-post.html`)
- [ ] External links: `target="_blank" rel="noopener noreferrer"` when opening a new tab
- [ ] Optionally: `node scripts/check-links.js`

Done!

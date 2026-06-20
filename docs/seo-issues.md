# SEO Audit — Main Issues

Audit targets: [blog.joaovictornsv.dev](https://blog.joaovictornsv.dev) and [devlog.joaovictornsv.dev](https://devlog.joaovictornsv.dev)

Date documented: 2026-06-20 (updated with independent code review)

## Summary

Both sites are missing several foundational SEO elements across their HTML pages. Pages currently include only `charset`, `viewport`, and `<title>` tags — no meta description, canonical URL, Open Graph tags, or structured data. Infrastructure-level items (sitemap, www redirect) also need attention.

Beyond `<head>` metadata, post markup is largely non-semantic: body copy lives in a single `#post-body` div (with `white-space: pre-wrap`) instead of `<p>` elements, section titles use `<strong>` instead of heading tags, and publish dates are plain text rather than `<time datetime="...">`. These patterns are baked into `scripts/txt-to-html.js` and the post-creation commands in `.cursor/commands/`.

---

## High priority

### 1. Missing meta description ✅ Fixed (2026-06-20)

**Finding:** No `<meta name="description">` tag was found on the page.

**Impact:** Search engines and social previews have no short summary to display. This also triggers the "Keywords in Title & Description" warning, since there is no description to align with the page title.

**Affected files:** All HTML pages (`index.html`, `posts/*.html`, `devlog.html`, `devlog/*.html`, etc.).

**Suggested fix:** Add a unique meta description (roughly 150–160 characters) to each page's `<head>`.

---

### 2. Missing canonical URL ✅ Fixed (2026-06-20)

**Finding:** No `<link rel="canonical">` tag found (`null` in the audit).

**Impact:** Search engines may treat duplicate or alternate URLs (with/without trailing slashes, `index.html` variants, etc.) as separate pages, diluting ranking signals.

**Suggested fix:** Add a canonical link pointing to the preferred URL for each page, e.g.:

```html
<link rel="canonical" href="https://blog.joaovictornsv.dev/posts/example.html">
```

---

### 3. No sitemap ✅ Fixed (2026-06-20)

**Finding:** No XML sitemap was detected.

**Impact:** Crawlers may discover pages more slowly, especially newer posts. RSS feeds exist (`/rss/feed.xml`, `/rss/devlog-feed.xml`) but are not a substitute for a sitemap.

**Suggested fix:**

- Generate a `sitemap.xml` listing all public pages.
- Reference it in `robots.txt` with `Sitemap: https://blog.joaovictornsv.dev/sitemap.xml`.

---

### 4. WWW canonicalization ⚠️ Requires human action

**Status:** Cannot be fixed in this repo. Configure a 301 redirect at Quave Cloud or Cloudflare so `www.blog.joaovictornsv.dev` and `www.devlog.joaovictornsv.dev` redirect to the non-www hosts (or vice versa — pick one canonical host).

**Finding:** The `www` and non-`www` versions of the URL are not redirected to a single canonical host.

**Impact:** Duplicate content across `blog.joaovictornsv.dev` and `www.blog.joaovictornsv.dev` (if both resolve).

**Suggested fix:** Configure a 301 redirect at the hosting/DNS layer (Quave Cloud or CDN) so all traffic goes to one preferred domain.

---

### 5. Broken links ✅ Fixed (2026-06-20)

**Finding:** The page has one or more broken links.

**Impact:** Hurts user experience and crawl quality.

**Confirmed example:** `posts/writing-the-skill-that-will-boost-your-career.html` links to `/html/how-not-to-make-mistakes-twice.html` (404). The correct path is `how-not-to-make-mistakes-twice.html` (same `posts/` directory).

**Suggested fix:** Run a full link check across `index.html`, all posts, and static pages. Fix or remove dead `href` targets.

---

### 6. Post body lacks semantic paragraph markup ✅ Fixed (2026-06-20)

**Finding:** Every post (blog and devlog) wraps all body copy in a single `<div id="post-body">`. Paragraph breaks rely on raw newlines plus `white-space: pre-wrap` in `css/style.css`, not on `<p>` elements. The stylesheet even defines `#post-body p { margin-bottom: ... }`, but no post HTML uses `<p>` tags inside the body.

**Impact:** Search engines and assistive tech get one undifferentiated text block instead of discrete paragraphs. Snippet extraction, passage ranking, and accessibility all suffer. RSS generation (`scripts/rss.js`) also strips tags and treats the blob as flat text.

**Affected files:** All `posts/*.html`, all `devlog/*.html`, `scripts/txt-to-html.js`, `.cursor/commands/new-post.md`, `.cursor/commands/new-devlog-post.md`.

**Suggested fix:** Split body copy into `<p>...</p>` per paragraph at authoring or build time. Keep `<pre><code>` for code blocks. Update the build script and post templates so new posts get correct markup by default.

---

### 7. Section headings use `<strong>` instead of heading elements ✅ Fixed (2026-06-20)

**Finding:** Posts that need sub-headings use `<strong>Section title</strong>` inside `#post-body` (workflow in `.cursor/commands/new-post.md` explicitly maps `###` lines to `<strong>`). No post uses `<h2>`–`<h6>` for in-article sections; the only heading tags site-wide are page-level `<h1>` on posts and `<h2>` on index/list pages.

**Impact:** Flat heading hierarchy (`h1` → nothing until the next page). Crawlers cannot infer document outline; screen-reader users lose quick navigation by heading level.

**Suggested fix:** Map section titles to `<h2>` / `<h3>` (nested as appropriate) instead of `<strong>`. Ensure only one `<h1>` per page (already the case).

---

## Medium priority

### 8. Missing Open Graph meta tags ✅ Fixed (2026-06-20)

**Note:** `og:image` tags point to `/og-image.png` on each subdomain. **Human action required:** create and deploy `og-image.png` (recommended 1200×630) to both sites.

**Finding:** Some Open Graph tags are missing.

**Impact:** Shared links on social platforms may show a generic or incomplete preview (no `og:title`, `og:description`, `og:image`, `og:url`, etc.).

**Suggested fix:** Add at minimum:

```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta property="og:type" content="article">
<meta property="og:image" content="...">
```

Consider adding Twitter Card tags (`twitter:card`, `twitter:title`, etc.) as well.

---

### 9. No Schema.org structured data ✅ Fixed (2026-06-20)

**Finding:** No JSON-LD or microdata found on the page.

**Impact:** Missed opportunity for rich results (e.g. `Blog`, `BlogPosting`, `WebSite` with `SearchAction`).

**Suggested fix:** Add JSON-LD scripts — e.g. `WebSite` on the homepage and `BlogPosting` on individual posts with `headline`, `datePublished`, `author`, and `url`.

---

### 10. No explicit index directive ✅ Fixed (2026-06-20)

**Finding:** The page does not contain an explicit `index` meta tag or header.

**Impact:** Low in practice if the page is indexable by default, but adding `<meta name="robots" content="index, follow">` makes intent clear to crawlers.

**Suggested fix:** Add the robots meta tag to public pages. Use `noindex` only on pages that should stay out of search (e.g. 404 pages if desired).

---

### 11. Publish dates are not machine-readable ✅ Fixed (2026-06-20)

**Finding:** Dates appear as the first line of plain text inside `#post-body` (e.g. `April 3, 2026`). There are no `<time datetime="2026-04-03">` elements anywhere in the repo.

**Impact:** Structured data (`datePublished`), browser features, and crawlers must guess or parse free text. RSS relies on `new Date(dateStr)` in `scripts/rss.js`, which is fragile across locales and formats.

**Suggested fix:** Move the date out of the body blob into a `<time class="post-date" datetime="...">` element (visible text can stay human-friendly). Feed the ISO value into JSON-LD and RSS.

---

### 12. In-post lists are plain text, not HTML lists ✅ Fixed (2026-06-20)

**Finding:** Bullet lists inside posts use lines starting with `- ` (e.g. in `posts/organize-your-finances-like-a-company.html`, `posts/how-not-to-make-mistakes-twice.html`) rather than `<ul><li>` markup.

**Impact:** Lists are not exposed as lists to parsers or screen readers; featured-snippet and list-style rich results are harder to earn.

**Suggested fix:** Convert dash-prefixed lines to `<ul>/<li>` during build or at authoring time.

---

### 13. Homepage listings lack dates and excerpts ✅ Fixed (2026-06-20)

**Finding:** `index.html` and `devlog.html` list posts as bare `<a>` links with no `<time>`, description, or `article` wrapper per entry.

**Impact:** The homepage gives crawlers little per-post context (freshness, topic summary). Users scanning the list also get less information than a typical blog index.

**Suggested fix:** Add optional date and one-line excerpt per list item, or wrap each entry in `<article>` with structured fields.

---

### 14. Two subdomains split crawl signals ✅ Partially fixed (2026-06-20)

**Status:** Per-site sitemaps, canonical URLs, and OG defaults are now generated separately for blog and devlog. Cross-linking via `sameAs` is in JSON-LD. Merging onto one domain remains optional and would be a larger change.

**Finding:** Blog and devlog deploy as separate Docker images to separate hosts (`blog.joaovictornsv.dev` vs `devlog.joaovictornsv.dev`). They cross-link but share no unified sitemap, canonical strategy, or `WebSite` graph.

**Impact:** Domain authority and internal PageRank do not consolidate across the two properties. Each site needs its own sitemap, canonical base URL, and OG defaults.

**Suggested fix:** Generate per-site `sitemap.xml` files. Consider `sameAs` / cross-linking in JSON-LD. Only merge onto one domain if you want a single SEO property (larger change).

---

### 15. No internal cross-linking between posts ⚠️ Requires human action

**Status:** Editorial task. Add contextual links to related posts when writing or editing content. The broken cross-link from item 5 is fixed; broader internal linking is ongoing content work.

**Finding:** Blog posts almost never link to other posts on the same site (one broken cross-link exists; see item 5). Devlog entries mostly link outward to GitHub/docs.

**Impact:** Missed internal linking weakens topical clustering and distributes less authority to older posts.

**Suggested fix:** Add contextual links to related posts when editing or publishing new content.

---

### 16. 404 pages are indexable ✅ Fixed (2026-06-20)

**Finding:** `e404.html` and `e404-devlog.html` have no `<meta name="robots" content="noindex">`.

**Impact:** Soft-404 or mistyped URLs could appear in search results.

**Suggested fix:** Add `noindex, follow` to both 404 templates.

---

## Low priority / performance

### 17. CSS not minified ✅ Fixed (2026-06-20)

**Finding:** `https://blog.joaovictornsv.dev/css/style.css` does not appear to be minified.

**Impact:** Slightly larger transfer size; minor effect on page speed scores.

**Suggested fix:** Minify `css/style.css` (and `css/devlog.css` on the devlog site) at build time, or serve a `.min.css` variant in production.

---

### 18. No favicon

**Finding:** No `favicon.ico`, `link rel="icon"`, or `apple-touch-icon` in any HTML page. Live request to `https://blog.joaovictornsv.dev/favicon.ico` returns 404.

**Impact:** Browser tabs, bookmarks, and some search/social surfaces show a generic icon. Minor trust/branding signal.

**Suggested fix:** Add a favicon asset and `<link rel="icon" href="...">` (and optionally `apple-touch-icon`) to shared head markup on both sites.

---

### 19. External links open in new tab without `rel="noopener noreferrer"`

**Finding:** Devlog workflow requires `target="_blank"` on links; no post uses `rel="noopener noreferrer"` (20+ `target="_blank"` occurrences across devlog posts).

**Impact:** Security (`window.opener`) issue; minor best-practice gap for crawlers documenting outbound links.

**Suggested fix:** Add `rel="noopener noreferrer"` wherever `target="_blank"` is used.

---

### 20. `.html` extensions in public URLs

**Finding:** All permalinks include `.html` (e.g. `/posts/my-degoogle-journey.html`).

**Impact:** Slightly less clean than extensionless URLs; not a blocker if canonicals are consistent.

**Suggested fix:** Optional — configure the static server or CDN to serve extensionless paths and canonicalize to the preferred form.

---

### 21. Generic homepage titles

**Finding:** Root pages use short titles (`JV's blog`, `JV's devlog`) with no tagline or author context.

**Impact:** Weak differentiation in SERP titles compared to more descriptive alternatives (e.g. "JV's blog — thoughts on technology and life").

**Suggested fix:** Expand `<title>` and future meta descriptions on index pages to include topic and author name.

---

## Informational (no action required)

### Theme visibility

**Finding:** The site theme/platform is not publicly identifiable.

**Note:** This is common for custom static sites and is not an SEO blocker.

---

## Already passing

| Check | Status |
|-------|--------|
| **robots.txt** | Present (Cloudflare default; no custom `Sitemap:` directive) |
| **Content freshness** | Last updated 2026-06-18 (via `Last-Modified` header) |
| **`lang="en"`** | Set on all pages |
| **RSS feeds** | Present on both sites |
| **HTTPS / HSTS** | Enabled via Cloudflare |
| **Semantic shell** | `<main>`, `<article>`, `<header>` used on key pages |
| **Single image alt text** | `devlog/github-activity-gif.html` includes `alt` |

---

## Suggested implementation order

1. Meta descriptions + canonical URLs on all pages
2. Semantic post markup (`<p>`, `<h2>`/`<h3>`, `<time>`, `<ul>`) — fix templates/build script first so new posts stay clean
3. XML sitemap(s) + `robots.txt` sitemap reference (one per subdomain)
4. WWW → non-WWW (or vice versa) redirect
5. Open Graph and Schema.org markup (include `datePublished`, `author`)
6. Fix broken links (start with `writing-the-skill-that-will-boost-your-career.html`)
7. Homepage list dates/excerpts; `noindex` on 404 pages; favicon
8. CSS minification in the deploy pipeline

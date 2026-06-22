---
description: Create a new devlog post from initial content with proper HTML structure and JV's voice
---

# New Devlog Post

You're receiving initial considerations for a new devlog entry. Follow this workflow:

## 1. Review & Refine Content

**Consult TECH-WRITER.md** for voice, tone, and style guidelines. Then:

- Ask clarifying questions if needed (what happened, tech involved, outcome, surprises)
- Draft the post following JV's voice: conversational, honest, short (2-6 paragraphs), one idea per post
- Get feedback: Does the tone feel right? Anything missing? Sections to expand or cut?
- Remember: No em dashes (—). Use commas, periods, or parentheses instead.

### Title Guidelines

Devlog titles should be **specific and detailed**, not generic. Avoid one-word titles. Instead:
- Focus on the outcome or transformation (e.g., "From One Plan to Three")
- Describe the technique or approach (e.g., "Top-Level Clarity First: Why I'm Pre-Planning Before Planning")
- Show what changed or what you learned (e.g., "How Pre-Planning Changes My Workflow")
- Make it clear what the post is about at a glance

Good: "Top-Level Clarity First: Why I'm Pre-Planning Before Planning"
Avoid: "Pre-Planning"

### Title Alternatives (required)

**Always** include title alternatives when you present the draft (before or right after creating the HTML file). Do not wait for the user to ask.

- Offer **5–8 options**, plus your recommended default (the one used in the post unless the user picks another).
- Group alternatives by angle when helpful (e.g. workflow shift, outcome, technique, tie-in to a linked post).
- Follow the title guidelines above: specific and detailed, not one-word generic titles.
- Keep the slug stable (`devlog/[slug].html`); only change `<title>`, `<h1>`, and the `devlog/index.html` list label if the user picks a different title.

## 2. HTML Structure

Copy the `<head>` from an existing devlog post (e.g. `devlog/event-loop-basics-this-time-you-understand.html`) and update all values for the new post. Every post needs:

- `meta description`, `canonical`, `robots`, Open Graph, Twitter Card tags
- JSON-LD `BlogPosting` with matching `headline`, `description`, `url`, `datePublished`
- Both stylesheets: `../css/style.css` and `../css/devlog.css`
- Canonical base: `https://blog.joaovictornsv.dev/devlog/[slug].html`

**Meta description:** Write a **complete short phrase** (roughly one sentence). Prefer the opening hook of the post. **Never** end with `…` or auto-truncate. Use the **same text** in `meta description`, `og:description`, `twitter:description`, JSON-LD, and the index excerpt.

Body structure inside `#post-body`:

```html
<time class="post-date" datetime="2026-06-20">June 20, 2026</time>

<p>First paragraph…</p>

<h2>Section title</h2>
<p>…</p>

<ul>
  <li>List item</li>
</ul>
```

**Markup rules (required):**
- One `<time class="post-date" datetime="YYYY-MM-DD">` at the top — not plain text dates
- Paragraphs in `<p>`, sections in `<h2>` / `<h3>` — never `<strong>` for headings
- Lists in `<ul>` / `<ol>` / `<li>` — never `- item` lines inside a `<p>`
- Section breaks: `<hr>` — not `---` on its own line
- External links: `<a href="…" target="_blank" rel="noopener noreferrer">`
- Internal post links: relative paths in the same folder (e.g. `other-post.html`, not `/html/…`)

**Code formatting:**
- Multi-line snippets, terminal output, JSON/HCL blocks → `<pre><code>…</code></pre>`
- Inline commands, file names, env vars, function names → `<span class="code-text">…</span>`
- Do not leave code-like text as bare prose when it should be highlighted

Save to `devlog/[slug].html`.

## 3. Publish

- [ ] Full SEO `<head>` (description, canonical, OG, Twitter, JSON-LD) — all descriptions match
- [ ] Semantic body markup (`time`, `p`, `h2`/`h3`, `ul`/`ol`, `pre`/`code`, `code-text`)
- [ ] No hyphen-in-paragraph lists, no `---` dividers, no truncated descriptions
- [ ] Add entry at top of `devlog/index.html` list (bare `<li><a>…</a></li>` is fine)
- [ ] Run `node scripts/update-index-listings.js` to rebuild list entries with date + excerpt
- [ ] Optionally run `node scripts/check-links.js` on the new post

Done!

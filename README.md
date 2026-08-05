# blog-html

Static files for the main blog and devlog, deployed as a single site.

## Local Preview

Run the static server from the repository root:

```sh
python3 -m http.server 8000
```

Then open:
- **Main blog**: http://localhost:8000/
- **Devlog**: http://localhost:8000/devlog/
- **Draft review tracker**: http://localhost:8000/tools/draft-review/

## Draft review tracker

Reflective draft reviews are written as JSON by the `review-draft-report` command (see `docs/text-review-guide.md` and `docs/review-report-schema.md`). Each report has a short summary plus six feedback cards (title, clarity, logic, voice, emotional), each with a qualitative stage line and multi-paragraph prose.

Reports live in `review-reports/{slug}.json` (gitignored). One draft slug = one report. Feedback is read-only; you read, reflect, and edit the draft if suggestions resonate.

Start the tracker server (serves the site and supports saving drafts):

```sh
npm run draft-review
```

Then open http://localhost:8000/tools/draft-review/ to list reports, read feedback cards, and edit the draft in the side panel. Use **Save** or `Ctrl+S` to write changes back to `txt/`.

**Re-review:** Run `review-draft-report` again on the same draft to rewrite all feedback in place and bump the review round. Delete the JSON file to start a new report from scratch. v2 reports are obsolete; regenerate with v3 (`schemaVersion: 3`).

To preview OG images locally, generate them first:

```sh
npm ci
node scripts/generate-og-images.js
```

Then open e.g. http://localhost:8000/og/posts/we-are-batteries.png

## Converting Text Posts to HTML

The `scripts/txt-to-html.js` script turns a plain-text draft into a **draft** HTML file with semantic body markup. The final post still needs a full SEO `<head>`. See `.cursor/commands/new-post.md` for the full publish workflow.

### Usage

```sh
node scripts/txt-to-html.js <filename.txt>
```

### Example

```sh
node scripts/txt-to-html.js my-new-post.txt
```

This will:
1. Read `txt/my-new-post.txt` (first line = title, rest = body)
2. Run body content through `post-body.js` (`<p>`, `<h2>`, lists, etc.)
3. Write a draft to `html/my-new-post.html`
4. Print next steps: copy markup into `posts/my-new-post.html`, update `index.html`, run `update-index-listings.js`

## RSS

Generate the main blog RSS feed:

```sh
node scripts/generate-rss.js
```

Generate the devlog RSS feed:

```sh
node scripts/generate-devlog-rss.js
```

## OG Images

Generate per-page Open Graph images from each HTML file's `<title>`:

```sh
npm ci
node scripts/generate-og-images.js
```

This writes PNGs under `og/` and updates `og:image` meta tags to match. CI runs the same script on deploy.

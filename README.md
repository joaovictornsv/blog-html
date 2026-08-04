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

## Draft review tracker (v2)

Substantive draft reviews are written as JSON by the `review-draft-report` command (see `docs/text-review-guide.md` and `docs/review-report-schema.md`). Reports use **schema v2**: a short summary plus a flat list of suggestions (`quote`, `issue`, `concrete example`).

Reports live in `review-reports/{slug}.json` (gitignored). One draft slug = one report. Progress (done / discarded) is stored in the browser via `localStorage`. AI status (`open` / `addressed`) lives in the JSON.

**v1 reports are obsolete.** Delete old `review-reports/*.json` and re-run the command to generate v2.

Start the tracker server (serves the site and supports saving drafts):

```sh
npm run draft-review
```

Then open http://localhost:8000/tools/draft-review/ to list reports, work through open items, and edit the draft in the side panel. Use **Save** or `Ctrl+S` to write changes back to `txt/`.

**Re-review:** Run `review-draft-report` again on the same draft for an incremental update. The AI re-evaluates each item, sets `aiStatus` and `aiNote`, and may add a few new items. Soft targets: 3-8 items on first review, 0-3 new per update; zero items is fine when the draft is already clear and well organized. Your done/discarded progress in `localStorage` is preserved. Use **Show addressed** to see items the AI already considers fixed. Delete the JSON and ask **from scratch** only when you want a full reset.

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

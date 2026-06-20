# blog-html

Static files for the main blog and devlog apps.

## Local Preview

Run the static server from the repository root:

```sh
python3 -m http.server 8000
```

Then open:
- **Main blog**: http://localhost:8000/
- **Devlog**: http://localhost:8000/devlog.html

## Converting Text Posts to HTML

The `scripts/txt-to-html.js` script turns a plain-text draft into a **draft** HTML file with semantic body markup. The final post still needs a full SEO `<head>` — see `.cursor/commands/new-post.md` for the full publish workflow.

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

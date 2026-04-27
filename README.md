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

The `scripts/txt-to-html.js` script converts plain text files into structured HTML pages.

### Usage

```sh
node scripts/txt-to-html.js <filename.txt>
```

### Example

```sh
node scripts/txt-to-html.js my-new-post.txt
```

This will:
1. Read `scripts/txt/my-new-post.txt`
2. Parse the first line as the post title
3. Use remaining lines as the post content
4. Generate `html/my-new-post.html` with a structured HTML page
5. Output a snippet to add to `index.html`

## RSS

Generate the main blog RSS feed:

```sh
node generate-rss.js
```

Generate the devlog RSS feed:

```sh
node generate-devlog-rss.js
```

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

Set `og:image` to `https://blog.joaovictornsv.dev/og/posts/<slug>.png`. After publishing, run `node scripts/generate-og-images.js` to generate the PNG (CI also runs this on deploy).

## 2. Apply standards

Follow `docs/post-html-checklist.md` for `<head>`, body markup, and index listing.

## 3. Final checks

Work through every item in `docs/post-html-checklist.md`. Fix issues directly; flag anything that needs my input.

Done!

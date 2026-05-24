---
description: Convert a new post from .txt to .html and add it to the posts list
---

A new blog post has been created in the `txt/` folder. Please help me publish it:

1. Run the build script to convert the .txt file to HTML:
   ```
   node scripts/txt-to-html.js <filename>.txt
   ```
   Where `<filename>` is just the filename (e.g., `my-post.txt`), not the full path.

   If the script paths are outdated, create `posts/<slug>.html` manually using the same structure as other posts in `posts/`.

2. Convert any markdown-style links in the generated HTML file from `[text](url)` to `<a href="url">text</a>`.

3. Add a new `<li>` entry at the **top** of the posts list in `index.html` (inside the `<ul class="list">` element).

The `<li>` format should be:
```html
<li><a href="posts/<slug>.html"><title></a></li>
```

4. Convert the first line of the .txt file to an `<h1 id="post-title">` element in the HTML.

5. Convert `### Section title` lines in the .txt file to `<strong>Section title</strong>` in the HTML (section headings inside `#post-body`).

Where `<slug>` is the filename without `.txt` extension, and `<title>` is the first line of the .txt file.

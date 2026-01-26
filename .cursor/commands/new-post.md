---
description: Convert a new post from .txt to .html and add it to the posts list
---

A new blog post has been created in the `txt/` folder. Please help me publish it:

1. Run the build script to convert the .txt file to HTML:
   ```
   node txt-to-html.js <filename>.txt
   ```
   Where `<filename>` is just the filename (e.g., `my-post.txt`), not the full path.

2. Convert any markdown-style links in the generated HTML file from `[text](url)` to `<a href="url">text</a>`.

3. Add a new `<li>` entry at the **top** of the posts list in `index.html` (inside the `<ul id="post-list">` element).

The `<li>` format should be:
```html
<li><a href="html/<slug>.html"><title></a></li>
```

Where `<slug>` is the filename without `.txt` extension, and `<title>` is the first line of the .txt file.

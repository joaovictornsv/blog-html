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

## 2. HTML Structure

Wrap the final content in this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Post Title]</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/devlog.css">
</head>
<body>
  <main>
    <a href="../index.html" class="back">&lt; back</a>
    
    <article id="post-content">
      <h1 id="post-title">[Post Title]</h1>
      <div id="post-body">[Date - e.g., "April 27, 2026"]

[Post content here]

Links: <a href="[url]" target="_blank">[text]</a></div>
    </article>
  </main>
</body>
</html>
```

**Key points:**
- Include both stylesheets: `../css/style.css` AND `../css/devlog.css`
- Date at top of post body
- All links use `target="_blank"`
- Save to `devlog/[slug].html`

## 3. Publish

- [ ] HTML structure correct
- [ ] All links have `target="_blank"`
- [ ] Date at top of post body
- [ ] Create file: `devlog/[slug].html`
- [ ] Add to `devlog.html` list (top of `<ul class="list">`):
  ```html
  <li><a href="devlog/[slug].html">[Title]</a></li>
  ```

Done!

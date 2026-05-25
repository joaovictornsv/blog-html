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
- Keep the slug stable (`devlog/[slug].html`); only change `<title>`, `<h1>`, and the `devlog.html` list label if the user picks a different title.

Example format in your reply:

**Recommended:** [title used in the post]

**Other options:**
- [alternative 1]
- [alternative 2]
- …

If the user chooses a different title, update the post and `devlog.html` accordingly.

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

[Post content here with links integrated naturally in the text using <a href="[url]" target="_blank">[text]</a>]</div>
    </article>
  </main>
</body>
</html>
```

**Key points:**
- Include both stylesheets: `../css/style.css` AND `../css/devlog.css`
- Date at top of post body
- All links use `target="_blank"`
- Integrate links naturally within the text, not as a separate "Links:" section at the bottom
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

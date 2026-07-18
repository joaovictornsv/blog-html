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

## 2. HTML structure

Copy the `<head>` from an existing devlog post (e.g. `devlog/event-loop-basics-this-time-you-understand.html`) and update all values for the new post.

Follow `docs/post-html-checklist.md` for `<head>`, body markup, code formatting, and index listing. Save to `devlog/[slug].html`.

## 3. Final checks

Work through every item in `docs/post-html-checklist.md`. Fix issues directly; flag anything that needs my input.

Done!

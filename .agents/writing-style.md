# Writing style rules

Follow these rules for all user-facing text in this repository (HTML, drafts, docs, commit messages for content changes).

## No em dashes

Do **not** use the em dash character (Unicode U+2014). The author does not use em dashes in this blog.

**Instead use:**

| Instead of em dash | Use |
|--------------------|-----|
| Clause break | comma, period, or parentheses |
| Title suffix (`Topic [em dash] JV's blog`) | comma: `Topic, JV's blog` |
| Label before explanation | colon: `Sequence: Does the order...` |
| List item detail | colon after the label |

**Examples:**

- Bad (em dash between clauses): `The best part of AI is not speed [em dash] it is the hour you get back.`
- Good: `The best part of AI is not speed. It is the hour you get back.`

- Bad (em dash in title): `Elsewhere [em dash] JV's blog`
- Good: `Elsewhere, JV's blog`

**Exception:** `scripts/og-utils.js` may reference U+2014 in regex when normalizing legacy titles. Do not add new em dashes elsewhere.

When editing existing text that contains an em dash, replace it as part of the change.

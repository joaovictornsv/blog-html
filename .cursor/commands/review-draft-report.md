---
description: Reflective review report for a draft (logic, clarity, structure), no grammar, no inline edits
---

Review the text I provide using the guide at `docs/text-review-guide.md`.

**Deliver:** Write a **JSON report only** to `review-reports/{slug}.json` following `docs/review-report-schema.md`. Update `review-reports/index.json`. Do **not** output the full report in chat (short confirmation + path + round only). Do **not** rewrite the entire piece unless I explicitly ask.

**Slug:** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`). One draft = one report file.

## Mode selection

| Condition | Mode |
|-----------|------|
| `review-reports/{slug}.json` exists and I did **not** ask for a new report | **Update**: rewrite feedback in place per schema |
| No report, or I explicitly asked for a new report | **Create**: full report |

**Revised draft check:** If a report already exists, assume the draft may have changed since the last review. Always run **Update** mode unless I asked for a new report. Re-read the **current** draft file (not an older paste) before writing feedback.

### Create mode

- Set `schemaVersion: 3`
- Full report per guide §5: `summary` + six `feedbacks` (title, clarity, logic, voice, emotional)
- Each feedback: `stage` (indicator prefix + phrase), `good`, and `needsAttention` (empty when nothing major)
- `reviewRound: 1`
- Set `createdAt` and `lastReviewedAt` to now

### Update mode (re-review)

When the report already exists (`reviewRound >= 1`), rewrite all feedback from the current draft.

1. Read existing `review-reports/{slug}.json` and the **current** draft (full file)
2. Rewrite `summary` in place
3. Rewrite every feedback's `stage`, `good`, and `needsAttention` in place (same six ids and labels)
4. Bump `reviewRound`; set `lastReviewedAt` to now
5. Keep `createdAt`, `id`, and `schemaVersion` unchanged

**Scope:** Logic and substance only. Do **not** cover grammar, spelling, typos, or routine phrasing fixes. Those belong in `revise-draft-inline`.

**Content (see guide §5):**

- Summary: 2-3 sentences only
- Six feedback cards with `good` / `needsAttention` blocks; skip nitpicks
- Title section: clarity/strength suggestions only; preserve voice and ideas
- Stage line starts with `Strong:`, `Good enough:`, or `Needs attention:`
- **No numeric scores**, no checkable items, no status fields

**Remember:**

- Personal hobby blog for friends; reflective feedback, not a fix list
- I write to inspire, advise, teach, and provoke; preserve my voice
- Write the **full report in English** (draft may be any language; keep quotes in draft language)
- Do not add em dashes (Unicode U+2014), aside hyphens (-), or semicolons (;) unless they already exist in the draft

**If I only pasted a selection:** Note limitations in `summary` and review what you have.

**After writing:**

- **Create:** path, slug, `reviewRound: 1`
- **Update:** path, new `reviewRound`
- Remind me to run `npm run draft-review` and open http://localhost:8000/tools/draft-review/

---
name: review-draft-report
description: >-
  Generate a substantive v2 review report (logic, clarity, organization) as JSON
  for the draft-review tracker. Use when the user asks for a draft review report,
  substantive review, review-draft-report, or incremental re-review of a txt draft.
---

# Review draft report (v2)

Generate a **JSON review report** for the draft-review tracker. Substance only: no grammar, spelling, or inline edits.

## Read first

1. `docs/text-review-guide.md` (v2 content rules)
2. `docs/review-report-schema.md` (v2 JSON shape)
3. `.cursor/commands/review-draft-report.md` (create vs update mode)

## Deliver

Write to `review-reports/{slug}.json` with `schemaVersion: 2`. Update `review-reports/index.json`. Reply with path and counts only, not the full report.

**Slug:** basename of draft without extension (`txt/my-post.txt` → `my-post`).

## Mode

| Condition | Mode |
|-----------|------|
| Report exists and user did not say from scratch | **Update** |
| No report or user asked from scratch | **Create** |

Always re-read the **current** draft file before judging items in update mode.

## Key rules

- Lighter process, same substance: still flag clarity, logic, and organization problems
- Every item needs `quote`, `issue`, and **concrete** `example` (sample rewrite)
- Soft targets: 3-8 items on create, 0-3 new on update; zero items OK when draft is solid
- AI status: `open` or `addressed` only; use `aiNote` on updates
- Stable ids: `item-1`, `item-2`, … never renumber
- Warn in confirmation if create mode produced more than 10 items
- Grammar and style → `revise-draft-inline`, not this workflow

## After writing

Remind user: `npm run draft-review` → http://localhost:8000/tools/draft-review/

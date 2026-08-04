---
name: review-draft-report
description: >-
  Generate a substantive review report (logic, clarity, organization) as JSON
  for the draft-review tracker. Use when the user asks for a draft review report,
  substantive review, review-draft-report, or incremental re-review of a txt draft.
---

# Review draft report

Generate a **JSON review report** for the draft-review tracker. Substance only: no grammar, spelling, or inline edits.

## Read first

1. `docs/text-review-guide.md` (content rules)
2. `docs/review-report-schema.md` (JSON shape)
3. `.cursor/commands/review-draft-report.md` (create vs update mode)

## Deliver

Write to `review-reports/{slug}.json` with `schemaVersion: 2`. Update `review-reports/index.json`. Reply with path and counts only, not the full report.

**Slug:** basename of draft without extension (`txt/my-post.txt` → `my-post`).

## Mode

| Condition | Mode |
|-----------|------|
| Report exists and user did not ask for a new report | **Update** |
| No report or user asked for a new report | **Create** |

Always re-read the **current** draft file before judging items in update mode.

## Key rules

- Short rounds, substantive feedback: flag clarity, logic, and organization problems when they exist
- Every item needs `quote`, `issue`, and **concrete** `example` (sample rewrite)
- Soft targets: 3-8 items on create, 0-3 new on update; zero items OK when the draft is solid
- AI status: `open` or `addressed` only; use `aiNote` on updates
- Stable ids: `item-1`, `item-2`, … never renumber
- Warn in confirmation if create mode produced more than 10 items
- Grammar and style → `revise-draft-inline`, not this workflow

## After writing

Remind user: `npm run draft-review` → http://localhost:8000/tools/draft-review/

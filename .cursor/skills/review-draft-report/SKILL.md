---
name: review-draft-report
description: >-
  Generate a reflective review report (logic, clarity, organization) as JSON
  for the draft-review tracker. Use when the user asks for a draft review report,
  substantive review, review-draft-report, or re-review of a txt draft.
---

# Review draft report

Generate a **JSON review report** for the draft-review tracker. Substance only: no grammar, spelling, or inline edits.

## Read first

1. `docs/text-review-guide.md` (content rules)
2. `docs/review-report-schema.md` (JSON shape)
3. `.cursor/commands/review-draft-report.md` (create vs update mode)

## Deliver

Write to `review-reports/{slug}.json` with `schemaVersion: 3`. Update `review-reports/index.json`. Reply with path and round number only, not the full report.

**Slug:** basename of draft without extension (`txt/my-post.txt` → `my-post`).

## Mode

| Condition | Mode |
|-----------|------|
| Report exists and user did not ask for a new report | **Update** |
| No report or user asked for a new report | **Create** |

Always re-read the **current** draft file before writing feedback in update mode.

## Key rules

- Reflective prose feedback, not a task list
- Five fixed feedback sections: title, clarity, logic, voice, emotional
- Each section: `stage` (prefix + phrase), `good`, `needsAttention` (empty string if nothing major)
- Stage prefix: `Strong:`, `Good enough:`, or `Needs attention:` (pick what fits)
- Skip nitpicks and optional polish in `needsAttention`
- Grammar and style → `revise-draft-inline`, not this workflow

## After writing

Remind user: `npm run draft-review` → http://localhost:8000/tools/draft-review/

---
description: Substantive review report for a draft (logic, clarity, structure), no grammar, no inline edits
---

Review the text I provide using the guide at `docs/text-review-guide.md`.

**Deliver:** Write a **JSON report only** to `review-reports/{slug}.json` following `docs/review-report-schema.md`. Update `review-reports/index.json`. Do **not** output the full report in chat (short confirmation + path + counts only). Do **not** rewrite the entire piece unless I explicitly ask.

**Slug:** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`). One draft = one report file.

## Mode selection

| Condition | Mode |
|-----------|------|
| `review-reports/{slug}.json` exists and I did **not** ask for a new report | **Update**: incremental merge per schema |
| No report, or I explicitly asked for a new report | **Create**: full report |

**Revised draft check:** If a report already exists, assume the draft may have changed since the last review. Always run **Update** mode unless I asked for a new report. Re-read the **current** draft file (not an older paste) before judging any item.

### Create mode

- Set `schemaVersion: 2`
- Full report per guide §5: `summary` + flat `items` array
- `reviewRound: 1`, `aiStatus: "open"` on every item
- Set `createdAt` and `lastReviewedAt` to now
- Soft target: 3-8 items; **zero items is valid** when the draft is clear, coherent, and well organized
- Flag real clarity, logic, or organization problems when they exist
- Warn in confirmation if you produced more than 10 items

### Update mode (re-review revised drafts)

When the report already exists (`reviewRound >= 1`), refresh every existing item against the current draft.

1. Read existing `review-reports/{slug}.json` and the **current** draft (full file)
2. **Never delete or renumber** existing item ids
3. **Re-evaluate every existing item** against the draft today:

| Outcome | When | Action |
|---------|------|--------|
| `addressed` | Draft fixed the issue, or passage removed | Set `aiStatus: "addressed"`; set `aiNote` (e.g. "You clarified this in ¶3" or "Paragraph removed") |
| `open` | Issue still stands | Keep `aiStatus: "open"`; **edit** `quote`, `issue`, `example` if draft changed; set `aiNote` explaining why still open |

4. Append **new** items only for genuinely new issues; set `addedInRound` to the new round (soft target: 0-3 new)
5. Replace `summary` in place
6. Bump `reviewRound`; set `lastReviewedAt` to now; set `lastAiReviewedAt` on touched items
7. Do **not** touch browser `localStorage` user progress

**Scope:** Logic and substance only. Do **not** cover grammar, spelling, typos, or routine phrasing fixes. Those belong in `revise-draft-inline`.

**Content (see guide §5):**

- Summary: 2-3 sentences only
- Items: flat list with `quote`, `issue`, `example` (concrete rewrite required)
- Optional `theme`: `clarity`, `logic`, `fairness`, `flow`
- AI status: `open` or `addressed` only

**Remember:**

- Personal hobby blog for friends; short rounds, substantive feedback
- Every item needs a **concrete example** fix, not generic advice
- I write to inspire, advise, teach, and provoke; preserve my voice
- Write the **full report in English** (draft may be any language; keep quotes in draft language)
- **No numeric scores**
- Do not add em dashes (Unicode U+2014), aside hyphens (-), or semicolons (;) unless they already exist in the draft
- Stable item ids: `item-1`, `item-2`, …

**If I only pasted a selection:** Note limitations in `summary` and review what you have.

**After writing:**

- **Create:** path, slug, item count, `reviewRound: 1`; warn if item count > 10
- **Update:** path, new `reviewRound`, counts: addressed this round, still open, new items
- Remind me to run `npm run draft-review` and open http://localhost:8000/tools/draft-review/

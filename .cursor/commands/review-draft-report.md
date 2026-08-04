---
description: Substantive review report for a draft (logic, clarity, structure), no grammar, no inline edits
---

Review the text I provide using the guide at `docs/text-review-guide.md`.

**Deliver:** Write a **JSON report only** to `review-reports/{slug}.json` following `docs/review-report-schema.md`. Update `review-reports/index.json`. Do **not** output the full report in chat (short confirmation + path + counts only). Do **not** rewrite the entire piece unless I explicitly ask.

**Slug:** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`). One draft = one report file.

## Mode selection

| Condition | Mode |
|-----------|------|
| `review-reports/{slug}.json` exists and I did **not** say "from scratch" or "regenerate" | **Update**: incremental merge per schema |
| No report, or I explicitly asked from scratch / regenerate | **Create**: full report from scratch |

**Revised draft check:** If `reviewRound >= 1` or an existing report is present, assume the draft may have changed since the last review. Always run **Update** mode unless I asked for from scratch. Re-read the **current** draft file (not an older paste) before judging any item.

### Create mode

- Full report per guide §5
- `reviewRound: 1`, `aiStatus: "open"` on every checkable item
- Set `createdAt` and `lastReviewedAt` to now

### Update mode (re-review revised drafts)

When the report already exists (`reviewRound >= 1`), your main job is to **refresh every existing item** against the current draft so nothing stays stale.

1. Read existing `review-reports/{slug}.json` and the **current** draft (full file)
2. **Never delete or renumber** existing item ids
3. **Re-evaluate every existing item** against the draft today. For each item, choose one outcome:

| Outcome | When | Action |
|---------|------|--------|
| `addressed` | The draft fixed the substantive issue | Set `aiStatus: "addressed"`; update quotes if the fixed passage moved |
| `open` | The issue still stands (same or sharper) | Keep or set `aiStatus: "open"`; **edit item text** if the draft changed but the finding still applies (new quote, reframed `why` / `issue` / `suggestedFix`, updated org/emotion `content`) |
| `outdated` | The passage is gone, rewritten beyond recognition, or the finding no longer applies, and there is no useful successor | Set `aiStatus: "outdated"`; refresh text to note what changed (e.g. quote removed, section cut) |
| `superseded` | The old finding is obsolete but a **new** item captures the issue better | Set old item to `superseded`; append successor with `supersedes` pointing at the old id |

4. **Edit items in place** when the user revised nearby text: update `original`, `why`, `issue`, `suggestedFix`, `whatIWrote`, `whoMightDisagree`, `howToImprove`, and org/emotion `content` so each item still describes the draft accurately. Do not leave quotes or claims that no longer match the file.
5. Append **new** items only for genuinely new issues; set `addedInRound` to the new round
6. Prefer `outdated` over leaving a wrong `open` item. Prefer editing in place over adding duplicates when the same concern still applies.
7. Replace `executiveSummary`, `tips`, and org/emotion `content` in place (org/emotion items follow the same status rules as other checkable items)
8. Bump `reviewRound`, set `previousReviewedAt` from old `lastReviewedAt`, set `lastReviewedAt` to now; set `lastAiReviewedAt` on items you touched
9. Do **not** touch browser `localStorage` user progress

**Scope:** Logic and substance only. Do **not** cover grammar, spelling, typos, or routine phrasing fixes. Those belong in `revise-draft-inline`.

**Content (see guide §5 for detail):**
- Executive summary: one paragraph + assumptions only.
- Unclear phrasing: items with `original` and `why`; 3–5 tips (not checkable).
- Other perspectives: items with `whatIWrote`, `whoMightDisagree`, `howToImprove`.
- Clarity: items with `issue` and `suggestedFix`.
- Organization and logic: up to four subsection items (`org-sequence`, `org-back-and-forth`, `org-logic-gaps`, `org-structure`).
- Emotional impact: up to four subsection items (`emo-flat`, `emo-main-message`, `emo-drop-off`, `emo-closing`).
- No tone table, no strengths section, no revision checklist.

**Remember:**
- I write to inspire, advise, teach, and provoke, accessible to any reader.
- I share opinions from experience; I do not claim to own the truth.
- Boost my potential; preserve my voice and signature.
- Write the **full report in English** (draft may be any language; keep quotes in the draft's language).
- **No numeric scores** (no 1–10 ratings).
- For **long-form** drafts only; always use the complete report structure.
- Do not add em dashes (Unicode U+2014), aside hyphens (-), or semicolons (;) unless they already exist in the draft.
- Use stable item ids per `docs/review-report-schema.md`.
- Tag `severity` (`critical`, `recommended`, `optional`) on checkable items when helpful.

**If I only pasted a selection:** Note limitations in `executiveSummary.assumptions` and review what you have.

**After writing:**

- **Create:** path, slug, checkable item count, `reviewRound: 1`
- **Update:** path, new `reviewRound`, counts of items marked `addressed`, `outdated`, `superseded`, still `open`, edited in place, and new items
- **From scratch:** warn that old item ids may not match UI progress; suggest Clear progress if needed
- Remind me to run `npm run draft-review` and open http://localhost:8000/tools/draft-review/

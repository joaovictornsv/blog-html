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

### Create mode

- Full report per guide §5
- `reviewRound: 1`, `aiStatus: "open"` on every checkable item
- Set `createdAt` and `lastReviewedAt` to now

### Update mode

1. Read existing `review-reports/{slug}.json` and the current draft
2. **Never delete or renumber** existing item ids
3. For each existing item: re-evaluate; set `aiStatus` (`open`, `addressed`, or `superseded`); refresh text if quotes moved
4. Append new items with next sequential ids; set `addedInRound` to the new round
5. Use `supersedes` when replacing a stale finding with a sharper one
6. Replace `executiveSummary`, `tips`, and org/emotion `content` in place
7. Bump `reviewRound`, set `previousReviewedAt` from old `lastReviewedAt`, set `lastReviewedAt` to now
8. Do **not** touch browser `localStorage` user progress

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
- **Update:** path, new `reviewRound`, count of items AI marked `addressed`, count of new items
- **From scratch:** warn that old item ids may not match UI progress; suggest Clear progress if needed
- Remind me to run `npm run draft-review` and open http://localhost:8000/tools/draft-review/

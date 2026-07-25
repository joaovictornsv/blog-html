---
description: Substantive review report for a draft (logic, clarity, structure)—no grammar, no inline edits
---

Review the text I provide using the guide at `docs/text-review-guide.md`.

**Deliver:** Write a **JSON report only** to `review-reports/{slug}.json` following `docs/review-report-schema.md`. Update `review-reports/index.json`. Do **not** output the full report in chat (short confirmation + path + item counts only). Do **not** rewrite the entire piece unless I explicitly ask.

**Slug:** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`). One draft = one report file.

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
- I write to inspire, advise, teach, and provoke—accessible to any reader.
- I share opinions from experience; I do not claim to own the truth.
- Boost my potential; preserve my voice and signature.
- Write the **full report in English** (draft may be any language; keep quotes in the draft's language).
- **No numeric scores** (no 1–10 ratings).
- For **long-form** drafts only; always use the complete report structure.
- Do not add em dashes (—), aside hyphens (-), or semicolons (;) unless they already exist in the draft.
- Use stable item ids per `docs/review-report-schema.md`.
- Tag `severity` (`critical`, `recommended`, `optional`) on checkable items when helpful.

**If I only pasted a selection:** Note limitations in `executiveSummary.assumptions` and review what you have.

**After writing:** Tell me the file path, draft slug, and how many checkable items were created. Remind me to open `http://localhost:8000/tools/draft-review/` (with `python3 -m http.server 8000` running) to track progress.

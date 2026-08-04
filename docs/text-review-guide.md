# Text Review Guide (v2)

Instructions for AI-assisted review of my writing. Use this document when I ask for a **review report** (analysis and suggestions), not when I ask for direct revision in the file.

**Related workflow:** `.cursor/commands/review-draft-report.md` uses this guide for a substantive report and writes **JSON** to `review-reports/{slug}.json` per `docs/review-report-schema.md` (v2). Track progress in `tools/draft-review/`. `.cursor/commands/revise-draft-inline.md` handles grammar and style in a new `-revised` file.

---

## 1. Purpose

Help me improve texts that **inspire, advise, teach, and provoke reflection**, without replacing my voice or turning my opinions into universal truths.

The report should **boost my potential**, not rewrite me. I keep final decisions and my personal signature.

**Lighter process, same substance:** fewer items and a simpler tracker, but still actively check clarity, coherence, and organization. Do not skip real problems to keep the list short.

**Split of concerns:**

| Workflow | Focus |
|----------|--------|
| **Review report** (this guide) | Logic, structure, clarity of ideas, fairness of claims |
| **Revise inline** (`revise-draft-inline`) | Grammar, spelling, typos, phrasing, style polish |

---

## 2. Writer profile (what I aim for)

When reviewing, measure the text against these intentions:

| Intention | What it means |
|-----------|----------------|
| **Help people** | Useful, humane, oriented toward the reader's growth, not performance or ego. |
| **Accessible** | Readable by anyone, regardless of technical or academic background. |
| **Creative & argued** | Original angle, clear reasoning, respect for logic. |
| **Concrete** | Examples and analogies that clarify abstract ideas. |
| **Reflective** | Analysis and ideas about life, habits, mindset, choices, not only facts. |
| **Humble authority** | Opinions grounded in my experience; I am **not** claiming to own the truth. |

**Preserve unless I ask otherwise:**

- Core ideas, arguments, and conclusions
- My tone and personality
- My level of assertiveness (only flag when it works *against* clarity or empathy)

**Do not:**

- Insert new claims, statistics, or stories I did not write
- "Fix" my worldview to match yours
- Flatten my style into generic blog voice

---

## 3. Audience and scope

This is a **personal hobby blog**. A few friends read these posts, not thousands of strangers.

- Avoid nitpicks, polish, taste, and hypothetical broad-audience concerns
- Still hold drafts to my standards: **clear, coherent, well organized**
- A round with **no findings** means the draft already meets those standards, not that the review was shallow
- Flag substantive issues: confusing passages, logic gaps, weak sequence, ideas that don't land, claims that read as universal truth

---

## 4. Reviewer role

You are an **editor and thoughtful reader**, not a co-author.

- **Suggest**, don't impose. Use language like "consider," "you might," "one option is."
- **Explain why** each suggestion matters (clarity, logic, structure, fairness).
- **Prioritize** what helps the reader most; skip minor style preferences.
- **Write the entire report in English**, even when the draft is in another language. Quote the draft in its original language; explain suggestions in English.
- **Do not** flag grammar, spelling, or typos. Point those out only in `revise-draft-inline`.
- **Respect punctuation preferences:** do not add em dashes (Unicode U+2014), hyphens as asides (-), or semicolons (;) unless they already appear in the draft or I explicitly allow it in this session.

---

## 5. Report structure (v2)

Deliver JSON per `docs/review-report-schema.md`. Be specific: quote short phrases and reference paragraph numbers when helpful.

### 5.1 Summary (required)

Two or three sentences: overall impression and whether clarity, flow, or logic need work. No assumptions list, no action-item list.

### 5.2 Items (flat list)

Each item is one substantive issue with a **concrete example** fix.

**Soft targets (guidance, not hard caps):**

- Create: aim for **3-8 items**; a messy draft with real problems may need more; a clean draft may need **zero**
- Update: aim for **0-3 new items**; only add when genuinely new issues appear

**Every item must include:**

| Field | Content |
|-------|---------|
| `quote` | Short quote from the draft |
| `issue` | One sentence: what a friend might miss or misread |
| `example` | Concrete sample rewrite or specific edit (never generic advice like "be clearer") |

Optional `theme` for light UI grouping: `clarity`, `logic`, `fairness`, `flow`.

**What to scan for (each becomes an item only when there is a real problem):**

| Theme | Scan for |
|-------|----------|
| **Clarity** (`clarity`) | Confusing wording, unclear referents, jargon, packed sentences |
| **Logic** (`logic`) | Unsupported leaps, missing premises, examples that don't support the claim |
| **Organization** (`flow`) | Weak sequence, repetition without payoff, buried main message, drop-off points, weak closing |
| **Fairness** (`fairness`) | Claims that sound like universal truth when I mean personal experience (one item per strong case, not per-claim lists) |

**How this differs from v1:** same dimensions, fewer items. One clear `flow` item with a concrete fix beats four prose subsections. Multiple `flow` or `logic` items are fine when the draft has several distinct problems. Do not collapse real issues into silence to hit a low count.

**Still flag real clarity, logic, or organization problems even when that adds items.**

---

## 6. What the report is not

- Not a full rewrite of the article (unless I explicitly ask)
- Not grammar, spelling, or typo fixes (use `revise-draft-inline`)
- Not moral judgment on my beliefs
- Not SEO or marketing optimization (unless I ask)
- Not fact-checking external claims unless I ask. Flag "verify if factual" instead
- Not strengths sections, revision checklists, tips lists, or numeric scores

---

## 7. How I use the report

1. Run `npm run draft-review` and open `http://localhost:8000/tools/draft-review/`.
2. Read the **summary** for orientation.
3. Work through open items; mark each **done** or **discarded** as you go.
4. Apply substantive changes to the draft in the side editor (Save or `Ctrl+S`).
5. Re-run **`review-draft-report`** on the same draft for an **incremental update** (AI sets `aiStatus` and `aiNote` on each item; your progress in `localStorage` is preserved).
6. Run **`revise-draft-inline`** for grammar and style in a separate `-revised` file.
7. Ignore suggestions that do not fit. Keep lines that feel like **my signature**.
8. To reset the report entirely, delete `review-reports/{slug}.json` and ask for a review **from scratch**. Use **Clear my progress** in the UI to reset local tracking.

---

## 8. Fixed preferences

| Preference | Value |
|------------|--------|
| **Schema** | v2 (`schemaVersion: 2`) |
| **Report language** | Always English |
| **Draft language** | Any (quotes stay in the draft's language) |
| **Typical use** | Long-form texts (blog posts, essays) |
| **Audience** | Friends and casual readers, not mass media |
| **Provocation level** | Medium: challenge ideas, respect people |
| **Scores** | Never use numeric ratings |
| **Grammar and typos** | Never in the report, only in `revise-draft-inline` |
| **Focus** | Substantive improvements only |

Optional per session: constraints ("don't touch the opening"), provocation level if this piece is an exception.

---

## 9. Prompt template (copy when requesting a review)

```text
Review my text using docs/text-review-guide.md (v2).
Write JSON to review-reports/{slug}.json per docs/review-report-schema.md.
Do not rewrite the whole piece in the response. Confirm path only.

[Paste text or path]
[Optional: constraints]
```

---

## 10. Incremental re-review

When a report already exists (`reviewRound >= 1`), `review-draft-report` runs in **update mode** by default. Treat the draft as potentially revised since the last round.

- Re-read the **current** draft file before judging any item
- Re-evaluate **every** existing item:
  - `addressed` when fixed or passage removed (set `aiNote`)
  - `open` when it still stands (refresh quote/issue/example; set `aiNote` on why)
- Edit item text in place when revisions shifted quotes but the concern still applies
- Add new items only for genuinely new issues (stable ids; never renumber old ones)
- Replace `summary` in place
- Bump `reviewRound`; preserve UI progress in `localStorage`

Ask for **from scratch** only when you want a full reset (delete old JSON first).

---

*Last updated: 2026-08-03 (v7: v2 flat items, hobby scope, lighter process same substance)*

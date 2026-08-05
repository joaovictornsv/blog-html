# Text Review Guide

Instructions for AI-assisted review of my writing. Use this document when I ask for a **review report** (analysis and suggestions), not when I ask for direct revision in the file.

**Related workflow:** `.cursor/commands/review-draft-report.md` uses this guide for a substantive report and writes **JSON** to `review-reports/{slug}.json` per `docs/review-report-schema.md`. Read feedback in `tools/draft-review/`. `.cursor/commands/revise-draft-inline.md` handles grammar and style in a new `-revised` file.

---

## 1. Purpose

Help me improve texts that **inspire, advise, teach, and provoke reflection**, without replacing my voice or turning my opinions into universal truths.

The report should **boost my potential**, not rewrite me. I keep final decisions and my personal signature.

Feedback is **reflective**, not a task list. Each section gives prose I can read, consider, and act on if it makes sense. There is no progress to track and no items to mark done.

**Split of concerns:**

| Workflow | Focus |
|----------|--------|
| **Review report** (this guide) | Logic, structure, clarity of ideas, fairness of claims, emotional landing |
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
- Acknowledge what is already working, not only problems
- Flag substantive issues when they exist: confusing passages, logic gaps, weak sequence, ideas that don't land, claims that read as universal truth

---

## 4. Reviewer role

You are an **editor and thoughtful reader**, not a co-author or project manager.

- **Suggest**, don't impose. Use language like "consider," "you might," "one option is."
- **Explain why** each point matters (clarity, logic, structure, fairness, emotional landing).
- **Prioritize** what helps the reader most; skip minor style preferences.
- **Write the entire report in English**, even when the draft is in another language. Quote the draft in its original language; explain suggestions in English.
- **Do not** flag grammar, spelling, or typos. Point those out only in `revise-draft-inline`.
- **Respect punctuation preferences:** do not add em dashes (Unicode U+2014), hyphens as asides (-), or semicolons (;) unless they already appear in the draft or I explicitly allow it in this session.

---

## 5. Report structure

Deliver JSON per `docs/review-report-schema.md`. Be specific: quote short phrases and reference paragraph numbers when helpful.

### 5.1 Summary (required)

Two or three sentences: overall impression and where the draft stands. No assumptions list, no action-item list.

### 5.2 Feedback cards (six sections, required)

Each section is one feedback card with a **stage** line plus **`good`** and **`needsAttention`** prose blocks.

**Fixed sections (always include all six):**

| `id` | Label | What to address |
|------|-------|-----------------|
| `title` | Title & hook | Current title; opening pull. See title rules below. |
| `clarity` | Clarity & phrasing | Confusing wording, unclear referents, jargon, packed sentences |
| `logic` | Logic & organization | Sequence, logic gaps, repetition, structure, closing |
| `voice` | Voice & fairness | Steelman counterpoints, absolutes vs personal experience |
| `emotional` | Emotional impact | Flat moments, drop-off risk, whether the core message lands |

**Stage line (`stage`):**

- Starts with one indicator prefix: **`Strong:`**, **`Good enough:`**, or **`Needs attention:`** (choose what fits this aspect today)
- Followed by one short phrase summarizing where the section stands
- Examples: `Strong: Title and hook do their job.` / `Good enough: Logic holds; one transition could tighten.` / `Needs attention: The middle loses the thread briefly.`

**What's good (`good`):**

- One or two short paragraphs on what is already working
- Lead with strengths; be specific (quote or reference paragraphs when helpful)

**What needs attention (`needsAttention`):**

- One or two short paragraphs on substantive points worth reflecting on
- Skip nitpicks, optional polish, and "you could also" ideas that would not change the reader's experience
- Use an **empty string** when nothing major stands out (common for `Strong:` sections)
- Frame as consideration, not tasks to complete

Separate paragraphs within each field with blank lines (`\n\n` in JSON).

**Title & hook section (special rules):**

- Evaluate the current title first; say when it is fine as-is
- Optional alternatives only when they **clarify or strengthen readability** without changing core ideas or flattening tone
- Do **not** suggest titles that rebrand the argument or suppress my authentic voice
- Hook: does the opening earn the reader's attention for what follows?

**What to scan for across sections:**

| Dimension | Scan for |
|-----------|----------|
| **Clarity** | Confusing wording, unclear referents, jargon, packed sentences |
| **Logic** | Unsupported leaps, missing premises, examples that don't support the claim |
| **Organization** | Weak sequence, repetition without payoff, buried main message, weak closing |
| **Fairness** | Claims that sound like universal truth when I mean personal experience |
| **Emotional impact** | Flat moments, drop-off points, whether the ending lands |

---

## 6. What the report is not

- Not a full rewrite of the article (unless I explicitly ask)
- Not grammar, spelling, or typo fixes (use `revise-draft-inline`)
- Not a task list, checklist, or progress tracker
- Not moral judgment on my beliefs
- Not SEO or marketing optimization (unless I ask)
- Not fact-checking external claims unless I ask. Flag "verify if factual" instead
- Not numeric scores or severity labels

---

## 7. How I use the report

1. Run `npm run draft-review` and open `http://localhost:8000/tools/draft-review/`.
2. Read the **summary** for orientation.
3. Read each feedback card; reflect on what resonates.
4. Apply changes to the draft in the side editor if they make sense (Save or `Ctrl+S`).
5. Re-run **`review-draft-report`** on the same draft for a **re-review** (feedback text is rewritten in place; `reviewRound` increments).
6. Run **`revise-draft-inline`** for grammar and style in a separate `-revised` file.
7. Ignore suggestions that do not fit. Keep lines that feel like **my signature**.
8. To reset the report entirely, delete `review-reports/{slug}.json` and run the command again.

---

## 8. Fixed preferences

| Preference | Value |
|------------|--------|
| **Report language** | Always English |
| **Draft language** | Any (quotes stay in the draft's language) |
| **Typical use** | Long-form texts (blog posts, essays) |
| **Audience** | Friends and casual readers, not mass media |
| **Provocation level** | Medium: challenge ideas, respect people |
| **Scores** | Never use numeric ratings |
| **Grammar and typos** | Never in the report, only in `revise-draft-inline` |
| **Focus** | Substantive reflection only |

Optional per session: constraints ("don't touch the opening"), provocation level if this piece is an exception.

---

## 9. Prompt template (copy when requesting a review)

```text
Review my text using docs/text-review-guide.md.
Write JSON to review-reports/{slug}.json per docs/review-report-schema.md.
Do not rewrite the whole piece in the response. Confirm path only.

[Paste text or path]
[Optional: constraints]
```

---

## 10. Re-review

When a report already exists (`reviewRound >= 1`), `review-draft-report` runs in **update mode** by default. Treat the draft as potentially revised since the last round.

- Re-read the **current** draft file before writing feedback
- Rewrite `summary` and every feedback's `stage` and `body` in place
- Bump `reviewRound`; set `lastReviewedAt` to now

To start over, delete `review-reports/{slug}.json` and run the command again on the draft.

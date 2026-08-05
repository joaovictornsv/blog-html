# Review Report JSON Schema

Structured output for the draft review tracker UI at `tools/draft-review/`.

**Related:** `docs/text-review-guide.md` (content), `.cursor/commands/review-draft-report.md` (command).

**v2 reports are obsolete.** Delete `review-reports/{slug}.json` and re-run `review-draft-report` to generate v3.

---

## File layout

| Path | Purpose |
|------|---------|
| `review-reports/{id}.json` | One report per draft slug |
| `review-reports/index.json` | Manifest: `["slug-a", "slug-b"]` sorted alphabetically |

`review-reports/` is gitignored. One draft = one report file. Reports are read-only feedback; no user progress is stored.

**Slug (`id`):** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`).

---

## Root object

```json
{
  "schemaVersion": 3,
  "id": "we-are-batteries",
  "title": "We Are Batteries",
  "draftPath": "txt/we-are-batteries.txt",
  "createdAt": "2026-07-25T12:00:00.000Z",
  "reviewRound": 1,
  "lastReviewedAt": "2026-07-25T12:00:00.000Z",
  "summary": "Two or three sentences: overall read and where the draft stands.",
  "feedbacks": []
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `schemaVersion` | yes | Must be `3` |
| `id` | yes | Draft slug; matches filename |
| `title` | yes | Human-readable title (from draft or first line) |
| `draftPath` | yes | Path to the reviewed draft |
| `createdAt` | yes | ISO 8601 UTC; set on first review, never changed |
| `reviewRound` | yes | Starts at `1`; increment on each re-review |
| `lastReviewedAt` | yes | ISO 8601 UTC; set on every review |
| `summary` | yes | 2-3 sentences; orientation only |
| `feedbacks` | yes | Array of six feedback cards (see below) |

---

## Feedback sections (fixed set)

Every report includes exactly **six** feedback cards, in this order:

| `id` | `label` | Covers |
|------|---------|--------|
| `title` | Title & hook | Title clarity and strength; opening pull (preserve voice and ideas) |
| `clarity` | Clarity & phrasing | Confusing wording, referents, jargon, packed sentences |
| `logic` | Logic & organization | Sequence, gaps, structure, repetition, closing |
| `voice` | Voice & fairness | Steelman counterpoints, absolutes vs experience |
| `emotional` | Emotional impact | Flat moments, drop-off risk, whether the piece lands |

---

## Feedback object

```json
{
  "id": "clarity",
  "label": "Clarity & phrasing",
  "stage": "Mostly clear; a few referents in ¶3 may lose readers.",
  "body": "First paragraph...\n\nSecond paragraph..."
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | One of the six fixed ids above |
| `label` | yes | Human-readable section title (use labels from table) |
| `stage` | yes | One short free-text phrase: qualitative snapshot of where this aspect stands now, including positives even when improvements exist |
| `body` | yes | Multi-paragraph reflective feedback; separate paragraphs with `\n\n` |

No status fields, no checkable items, no severity, no `aiStatus`.

---

## Create mode (first review)

When `review-reports/{id}.json` does not exist, or the user explicitly requests a **new report**:

1. Write a report per `docs/text-review-guide.md`
2. Set `schemaVersion: 3`, `reviewRound: 1`, `lastReviewedAt` and `createdAt` to now
3. Include all six feedback sections with `stage` and `body`

---

## Update mode (re-review)

When `review-reports/{id}.json` exists (`reviewRound >= 1`) and the user did **not** ask for a new report:

1. Read existing report and **current** draft
2. Rewrite `summary` in place
3. Rewrite every feedback's `stage` and `body` in place (same six ids and labels)
4. Bump `reviewRound` by 1; set `lastReviewedAt` to now
5. Keep `createdAt`, `id`, and `schemaVersion` unchanged

No item merge, no stable item ids, no incremental append logic.

---

## Manifest (`index.json`)

When writing `review-reports/{id}.json`:

1. Read existing `review-reports/index.json` if present (default `[]`)
2. Add `id` if missing
3. Sort alphabetically
4. Write back to `review-reports/index.json`

---

## Agent checklist

**Create mode:**

1. Derive `id` from draft path
2. Set `schemaVersion: 3`
3. Fill `summary` and all six `feedbacks` per guide
4. Write `review-reports/{id}.json`; update `index.json`
5. Reply with path and `reviewRound: 1` only

**Update mode:**

1. Load existing report and current draft
2. Rewrite `summary` and all feedback text per update rules above
3. Reply with path and new `reviewRound` only

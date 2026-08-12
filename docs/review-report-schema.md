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
| `feedbacks` | yes | Array of five feedback cards (see below) |

---

## Feedback sections (fixed set)

Every report includes exactly **five** feedback cards, in this order:

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
  "stage": "Good enough: Mostly clear; one early bridge could help.",
  "good": "The draft reads accessibly. Abstract ideas like \"mental translations\" and \"noise\" get grounded quickly in calendars, boards, spreadsheets, and the money examples.",
  "needsAttention": "In the opening, the jump from the leaderboard joke to \"our routines\" is a small step the reader takes alone. One line naming these as everyday dashboards and lists (not sports) would close that gap."
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | One of the five fixed ids above |
| `label` | yes | Human-readable section title (use labels from table) |
| `stage` | yes | Starts with a short indicator prefix, then one phrase. Use **`Strong:`**, **`Good enough:`**, or **`Needs attention:`** (pick what fits). Rest of line is a qualitative snapshot |
| `good` | yes | What is already working in this aspect; one or two short paragraphs max |
| `needsAttention` | yes | Substantive points worth reflecting on only. Use an empty string when nothing major stands out (UI hides the block). No nitpicks or optional polish |

No status fields, no checkable items, no severity, no `aiStatus`.

---

## Create mode (first review)

When `review-reports/{id}.json` does not exist, or the user explicitly requests a **new report**:

1. Write a report per `docs/text-review-guide.md`
2. Set `schemaVersion: 3`, `reviewRound: 1`, `lastReviewedAt` and `createdAt` to now
3. Include all five feedback sections with `stage`, `good`, and `needsAttention`

---

## Update mode (re-review)

When `review-reports/{id}.json` exists (`reviewRound >= 1`) and the user did **not** ask for a new report:

1. Read existing report and **current** draft
2. Rewrite `summary` in place
3. Rewrite every feedback's `stage`, `good`, and `needsAttention` in place (same five ids and labels)
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
3. Fill `summary` and all five `feedbacks` per guide
4. Write `review-reports/{id}.json`; update `index.json`
5. Reply with path and `reviewRound: 1` only

**Update mode:**

1. Load existing report and current draft
2. Rewrite `summary` and all feedback text per update rules above
3. Reply with path and new `reviewRound` only

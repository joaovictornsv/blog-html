# Review Report JSON Schema (v2)

Structured output for the draft review tracker UI at `tools/draft-review/`.

**Related:** `docs/text-review-guide.md` (content), `.cursor/commands/review-draft-report.md` (command).

**v1 reports are obsolete.** Delete `review-reports/{slug}.json` and re-run `review-draft-report` to generate v2.

---

## File layout

| Path | Purpose |
|------|---------|
| `review-reports/{id}.json` | One report per draft slug |
| `review-reports/index.json` | Manifest: `["slug-a", "slug-b"]` sorted alphabetically |

`review-reports/` is gitignored. One draft = one report file. User progress lives in browser `localStorage`; AI status lives in the JSON.

**Slug (`id`):** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`).

---

## Root object

```json
{
  "schemaVersion": 2,
  "id": "we-are-batteries",
  "title": "We Are Batteries",
  "draftPath": "txt/we-are-batteries.txt",
  "createdAt": "2026-07-25T12:00:00.000Z",
  "reviewRound": 1,
  "lastReviewedAt": "2026-07-25T12:00:00.000Z",
  "summary": "Two or three sentences: overall impression and whether clarity, flow, or logic need work.",
  "items": []
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `schemaVersion` | yes | Must be `2` |
| `id` | yes | Draft slug; matches filename |
| `title` | yes | Human-readable title (from draft or first line) |
| `draftPath` | yes | Path to the reviewed draft |
| `createdAt` | yes | ISO 8601 UTC; set on first review, never changed |
| `reviewRound` | yes | Starts at `1`; increment on each incremental update |
| `lastReviewedAt` | yes | ISO 8601 UTC; set on every review |
| `summary` | yes | 2-3 sentences; not checkable in UI |
| `items` | yes | Flat array of checkable suggestions |

---

## AI status (per item)

| Value | Meaning |
|-------|---------|
| `open` | AI still sees the issue in the current draft |
| `addressed` | AI believes the draft fixed the issue, or the passage was removed (use `aiNote` to explain) |

User status (`done` / `discarded`) stays in `localStorage`, not in JSON.

| Field | Required | Notes |
|-------|----------|-------|
| `aiStatus` | yes | `open` \| `addressed` |
| `aiNote` | no | Short note on update: why addressed, or why still open |
| `addedInRound` | no | Set to current `reviewRound` when the item is new |
| `lastAiReviewedAt` | no | ISO 8601 UTC when re-evaluated in update mode |

---

## Item object

```json
{
  "id": "item-1",
  "quote": "Short quote from draft",
  "issue": "One sentence: what a friend might miss or misread",
  "example": "Concrete fix: sample rewrite or specific edit",
  "theme": "clarity",
  "aiStatus": "open",
  "aiNote": null,
  "addedInRound": 1
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Stable ids: `item-1`, `item-2`, … never renumbered |
| `quote` | yes | Short quote from the draft |
| `issue` | yes | What is wrong or risky |
| `example` | yes | Concrete sample rewrite or specific edit (not generic advice) |
| `theme` | no | `clarity` \| `logic` \| `fairness` \| `flow` (UI grouping only) |
| `aiStatus` | yes | `open` \| `addressed` |
| `aiNote` | no | Required on update when status changes or stays `open` |
| `addedInRound` | no | Round when item was first added |

---

## Create mode (first review)

When `review-reports/{id}.json` does not exist, or the user explicitly requests **from scratch**:

1. Write a report per `docs/text-review-guide.md`
2. Set `schemaVersion: 2`, `reviewRound: 1`, `lastReviewedAt` and `createdAt` to now
3. Set `aiStatus: "open"` on every item (or omit `items` when zero findings)
4. Soft target: 3-8 items; zero items is valid when the draft is already clear and well organized

---

## Update mode (incremental re-review)

When `review-reports/{id}.json` exists (`reviewRound >= 1`) and the user did **not** ask for from scratch:

1. Read existing report and **current** draft
2. **Never delete or renumber** existing item ids
3. **Re-evaluate every existing item** against the draft today:
   - `addressed` if fixed or passage removed (set `aiNote`, e.g. "Paragraph removed" or "You clarified this in ¶3")
   - `open` if still stands: refresh `quote`, `issue`, `example` if needed; set `aiNote` explaining why
4. Append new items only for genuinely new issues (`item-N` next id); set `addedInRound`
5. Replace `summary` in place
6. Bump `reviewRound` by 1; set `lastReviewedAt` to now; set `lastAiReviewedAt` on touched items
7. Keep `createdAt`, `id`, and `schemaVersion` unchanged
8. Do **not** modify user `localStorage` progress

Soft target: 0-3 new items per update round.

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
2. Set `schemaVersion: 2`
3. Fill `summary` and `items` per guide (zero items OK)
4. Set `aiStatus: "open"` on all items
5. Write `review-reports/{id}.json`; update `index.json`
6. Reply with path, item count, `reviewRound: 1`; warn if more than 10 items

**Update mode:**

1. Load existing report and current draft
2. Merge per update rules above
3. Reply with path, new `reviewRound`, counts: addressed this round, still open, new items

---

*Last updated: 2026-08-03 (v2: flat items, open/addressed only)*

# Review Report JSON Schema

Structured output for the draft review tracker UI at `tools/draft-review/`.

**Related:** `docs/text-review-guide.md` (content), `.cursor/commands/review-draft-report.md` (command).

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
  "id": "we-are-batteries",
  "title": "We Are Batteries",
  "draftPath": "txt/we-are-batteries.txt",
  "createdAt": "2026-07-25T12:00:00.000Z",
  "reviewRound": 1,
  "lastReviewedAt": "2026-07-25T12:00:00.000Z",
  "previousReviewedAt": null,
  "executiveSummary": {
    "paragraph": "One paragraph: overall impression and main opportunities.",
    "assumptions": ["Audience: general public.", "Draft language: English."]
  },
  "sections": []
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Draft slug; matches filename |
| `title` | yes | Human-readable title (from draft or first line) |
| `draftPath` | yes | Path to the reviewed draft |
| `createdAt` | yes | ISO 8601 UTC; set on first review, never changed |
| `reviewRound` | yes | Starts at `1`; increment on each incremental update |
| `lastReviewedAt` | yes | ISO 8601 UTC; set on every review |
| `previousReviewedAt` | no | ISO 8601 UTC; prior `lastReviewedAt` before last bump |
| `executiveSummary` | yes | Orientation only; not checkable in UI |
| `sections` | yes | Ordered array; all section types below |

---

## AI status (per checkable item)

| Field | Required | Notes |
|-------|----------|-------|
| `aiStatus` | yes | `open` \| `addressed` \| `superseded` |
| `addedInRound` | no | Set to current `reviewRound` when the item is new |
| `supersedes` | no | Id of a prior item this one replaces |
| `lastAiReviewedAt` | no | ISO 8601 UTC |

- `open`: AI still sees the issue in the current draft
- `addressed`: AI believes the draft fixed it
- `superseded`: kept for history; replaced by a newer item (`supersedes` links them)

User status (`done` / `discarded`) stays in `localStorage`, not in JSON.

---

## Severity

Optional on checkable items: `"critical"` | `"recommended"` | `"optional"`.

---

## Sections (in order)

### `unclear_phrasing`

```json
{
  "type": "unclear_phrasing",
  "items": [
    {
      "id": "up-1",
      "original": "Short quote from draft",
      "why": "What a reader might misunderstand and what the passage needs.",
      "severity": "recommended",
      "aiStatus": "open"
    }
  ],
  "tips": [
    "Actionable habit based on patterns in this draft."
  ]
}
```

- `items`: checkable; stable ids `up-1`, `up-2`, …
- `tips`: 3–5 strings; display only, not checkable; replace entire array on each review

### `other_perspectives`

```json
{
  "type": "other_perspectives",
  "items": [
    {
      "id": "op-1",
      "whatIWrote": "Brief quote",
      "whoMightDisagree": "Steelman counter-view",
      "howToImprove": "How to present the claim more fairly",
      "severity": "recommended",
      "aiStatus": "open"
    }
  ]
}
```

### `clarity`

```json
{
  "type": "clarity",
  "items": [
    {
      "id": "cl-1",
      "issue": "Quote or phrase plus what is unclear",
      "suggestedFix": "Wording or structure fix",
      "severity": "critical",
      "aiStatus": "open"
    }
  ]
}
```

### `organization_and_logic`

```json
{
  "type": "organization_and_logic",
  "items": [
    {
      "id": "org-sequence",
      "label": "Sequence",
      "content": "Prose addressing order of ideas.",
      "aiStatus": "open"
    }
  ]
}
```

- Include only items with non-empty `content`
- Fixed ids: `org-sequence`, `org-back-and-forth`, `org-logic-gaps`, `org-structure`

### `emotional_impact`

```json
{
  "type": "emotional_impact",
  "items": [
    {
      "id": "emo-flat",
      "label": "Flat or weak moments",
      "content": "Where reflection or urgency drops.",
      "aiStatus": "open"
    }
  ]
}
```

- Fixed ids: `emo-flat`, `emo-main-message`, `emo-drop-off`, `emo-closing`

---

## Create mode (first review)

When `review-reports/{id}.json` does not exist, or the user explicitly requests **from scratch**:

1. Write a full report per `docs/text-review-guide.md` §5
2. Set `reviewRound: 1`, `lastReviewedAt` and `createdAt` to now
3. Set `aiStatus: "open"` on every checkable item
4. Omit `previousReviewedAt` and `addedInRound` on first-round items

---

## Update mode (incremental re-review)

When `review-reports/{id}.json` exists and the user did **not** ask for from scratch:

1. Read existing report and current draft
2. **Never delete or renumber** existing item ids
3. For each existing item: re-evaluate against the draft; set `aiStatus`; refresh text fields if quotes moved
4. Append new items with next sequential id per prefix (`cl-11`, `op-6`, …); set `addedInRound` to the new round
5. Mark replaced findings `superseded` when adding a sharper successor (`supersedes` on the new item)
6. Replace `executiveSummary`, `tips`, and org/emotion `content` in place
7. Set `previousReviewedAt` to the old `lastReviewedAt`; bump `reviewRound` by 1; set `lastReviewedAt` to now
8. Keep `createdAt` and `id` unchanged
9. Do **not** modify user `localStorage` progress

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
2. Fill all section types with substantive content per `docs/text-review-guide.md` §5
3. Set `aiStatus: "open"` on all checkable items
4. Write `review-reports/{id}.json`; update `index.json`
5. Reply with path, item counts, `reviewRound: 1`

**Update mode:**

1. Load existing `review-reports/{id}.json` and current draft
2. Merge per update rules above
3. Reply with path, new `reviewRound`, `N` items addressed by AI, `M` new items

---

*Last updated: 2026-07-25*

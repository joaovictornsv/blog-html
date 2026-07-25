# Review Report JSON Schema

Structured output for the draft review tracker UI at `tools/draft-review/`.

**Related:** `docs/text-review-guide.md` (content), `.cursor/commands/review-draft-report.md` (command).

---

## File layout

| Path | Purpose |
|------|---------|
| `review-reports/{id}.json` | One report per draft slug |
| `review-reports/index.json` | Manifest: `["slug-a", "slug-b"]` sorted alphabetically |

`review-reports/` is gitignored. One draft = one report. Regenerating overwrites `{id}.json`; clear progress in the UI.

**Slug (`id`):** basename of the draft file without extension (e.g. `txt/we-are-batteries.txt` → `we-are-batteries`).

---

## Root object

```json
{
  "id": "we-are-batteries",
  "title": "We Are Batteries",
  "draftPath": "txt/we-are-batteries.txt",
  "createdAt": "2026-07-25T12:00:00.000Z",
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
| `createdAt` | yes | ISO 8601 UTC |
| `executiveSummary` | yes | Orientation only; not checkable in UI |
| `sections` | yes | Ordered array; all six section types below |

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
      "severity": "recommended"
    }
  ],
  "tips": [
    "Actionable habit based on patterns in this draft."
  ]
}
```

- `items`: checkable; stable ids `up-1`, `up-2`, …
- `tips`: 3–5 strings; display only, not checkable

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
      "severity": "recommended"
    }
  ]
}
```

- `items`: checkable; stable ids `op-1`, `op-2`, …

### `clarity`

```json
{
  "type": "clarity",
  "items": [
    {
      "id": "cl-1",
      "issue": "Quote or phrase plus what is unclear",
      "suggestedFix": "Wording or structure fix",
      "severity": "critical"
    }
  ]
}
```

- `items`: checkable; stable ids `cl-1`, `cl-2`, …

### `organization_and_logic`

```json
{
  "type": "organization_and_logic",
  "items": [
    {
      "id": "org-sequence",
      "label": "Sequence",
      "content": "Prose addressing order of ideas."
    },
    {
      "id": "org-back-and-forth",
      "label": "Back-and-forth",
      "content": "Prose on repetition, contradiction, or circular returns."
    },
    {
      "id": "org-logic-gaps",
      "label": "Logic gaps",
      "content": "Prose on missing premises or unsupported leaps."
    },
    {
      "id": "org-structure",
      "label": "Structure map",
      "content": "Outline of current flow; optional suggested reorder."
    }
  ]
}
```

- Include only items with non-empty `content`
- Fixed ids: `org-sequence`, `org-back-and-forth`, `org-logic-gaps`, `org-structure`
- Each included item is checkable as a whole

### `emotional_impact`

```json
{
  "type": "emotional_impact",
  "items": [
    {
      "id": "emo-flat",
      "label": "Flat or weak moments",
      "content": "Where reflection or urgency drops."
    },
    {
      "id": "emo-main-message",
      "label": "Main message",
      "content": "Core message in one sentence; whether it lands."
    },
    {
      "id": "emo-drop-off",
      "label": "Drop-off risk",
      "content": "Where readers might stop and why."
    },
    {
      "id": "emo-closing",
      "label": "Closing",
      "content": "Whether the ending lands; one concrete suggestion if not."
    }
  ]
}
```

- Include only items with non-empty `content`
- Fixed ids: `emo-flat`, `emo-main-message`, `emo-drop-off`, `emo-closing`

---

## Manifest (`index.json`)

When writing `review-reports/{id}.json`:

1. Read existing `review-reports/index.json` if present (default `[]`)
2. Add `id` if missing
3. Sort alphabetically
4. Write back to `review-reports/index.json`

---

## Agent checklist

1. Derive `id` from draft path
2. Fill all section types with substantive content per `docs/text-review-guide.md` §5
3. Use stable item ids as specified
4. Write `review-reports/{id}.json`
5. Update `review-reports/index.json`
6. Reply with a short confirmation (path + item counts only; no full report in chat)

---

*Last updated: 2026-07-25*

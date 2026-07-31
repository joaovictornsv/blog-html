---
name: refresh-curriculum-pdf
description: >-
  Refresh the curriculum PDF on the Elsewhere page from the latest file in
  ~/Downloads. Use when the user asks to refresh, update, or sync the
  curriculum, resume, or CV for this blog repo.
---

# Refresh curriculum PDF

Copy the latest curriculum PDF from `~/Downloads` into `links/files/` for the Elsewhere page.

## Run

```bash
bash .cursor/skills/refresh-curriculum-pdf/scripts/refresh-curriculum-pdf.sh
```

Override the source folder with `DOWNLOADS=/path/to/folder` if needed.

## Source files (newest match wins)

| Document | Pattern in `~/Downloads` |
| --- | --- |
| Curriculum | `curriculum-complete*.pdf` |

## Destination files

| File | Repo path |
| --- | --- |
| `joaovictornsv-curriculum.pdf` | `links/files/joaovictornsv-curriculum.pdf` |

## Elsewhere links

`links/index.html` should link to:

- `files/joaovictornsv-curriculum.pdf`: label **Curriculum**

Place the entry after GitHub if it is missing. Do not change descriptions unless the user asks.

## After refresh

1. Confirm the script printed the source → destination mapping.
2. Report which source file was used (basename only).
3. Commit only when the user asks.

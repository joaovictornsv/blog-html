---
name: refresh-pdfs
description: >-
  Refresh curriculum and cover letter PDFs on the Elsewhere page from the latest
  files in ~/Downloads. Use when the user asks to refresh, update, or sync PDFs,
  curriculum, resume, CV, or cover letter for this blog repo.
---

# Refresh PDFs

Copy the latest career PDFs from `~/Downloads` into `links/files/` for the Elsewhere page.

## Run

```bash
bash .cursor/skills/refresh-pdfs/scripts/refresh-pdfs.sh
```

Override the source folder with `DOWNLOADS=/path/to/folder` if needed.

## Source files (newest match wins)

| Document | Pattern in `~/Downloads` |
| --- | --- |
| Curriculum | `curriculum-complete*.pdf` |
| Cover letter | `letter*.pdf` |

## Destination files

| File | Repo path |
| --- | --- |
| `joaovictornsv-curriculum.pdf` | `links/files/joaovictornsv-curriculum.pdf` |
| `joaovictornsv-cover-letter.pdf` | `links/files/joaovictornsv-cover-letter.pdf` |

## Elsewhere links

`links/index.html` should link to:

- `files/joaovictornsv-curriculum.pdf` — label **Curriculum**
- `files/joaovictornsv-cover-letter.pdf` — label **Cover Letter**

Place both entries after GitHub if they are missing. Do not change descriptions unless the user asks.

## After refresh

1. Confirm the script printed both source → destination mappings.
2. Report which source files were used (basename only).
3. Commit only when the user asks.

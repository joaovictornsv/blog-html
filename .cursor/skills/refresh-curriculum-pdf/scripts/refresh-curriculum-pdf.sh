#!/usr/bin/env bash
set -euo pipefail

DOWNLOADS="${DOWNLOADS:-$HOME/Downloads}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
DEST="$REPO_ROOT/links/files"
NAME_SLUG="joaovictornsv"

mkdir -p "$DEST"

newest_match() {
  local pattern="$1"
  ls -t "$DOWNLOADS"/$pattern 2>/dev/null | head -1 || true
}

copy_pdf() {
  local label="$1"
  local source="$2"
  local target="$3"

  if [[ -z "$source" || ! -f "$source" ]]; then
    echo "error: no $label found in $DOWNLOADS" >&2
    exit 1
  fi

  cp "$source" "$target"
  echo "$label: $(basename "$source") -> $(basename "$target")"
}

CURRICULUM_SOURCE="$(newest_match 'curriculum-complete*.pdf')"

copy_pdf "curriculum" "$CURRICULUM_SOURCE" "$DEST/${NAME_SLUG}-curriculum.pdf"

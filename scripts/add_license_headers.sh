#!/usr/bin/env bash
set -euo pipefail

# Adds a short license header to source files. Customize OWNER and YEAR if needed.
OWNER="ReactNative2000"
YEAR="2025"

HEADER="/*\n * Copyright (c) ${YEAR} ${OWNER}\n * Licensed under the MIT License. See LICENSE in the project root.\n */\n\n"

if [ "$#" -gt 0 ]; then
  TARGETS=("$@")
else
  TARGETS=("**/*.js" "**/*.mjs" "**/*.ts" "**/*.py" "**/*.sh" "**/*.md")
fi

echo "Adding license headers to files..."

shopt -s globstar nullglob
for pattern in "${TARGETS[@]}"; do
  for file in $pattern; do
    # Skip these paths
    case "$file" in
      node_modules/*|.git/*|server/lspp.db|uploads/*|exports/*)
        continue
        ;;
    esac
    # Only add header if not present
    if head -n 1 "$file" | grep -q "Copyright (c)"; then
      continue
    fi
    echo "Patching $file"
    tmp=$(mktemp)
    echo -e "$HEADER" > "$tmp"
    cat "$file" >> "$tmp"
    mv "$tmp" "$file"
  done
done

echo "Done. Review changes and commit as desired."

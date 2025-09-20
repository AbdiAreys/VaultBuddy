#!/usr/bin/env bash
# VaultBuddy - POSIX launcher
# Ensures python3 is present, then runs the CLI from the repo root.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but was not found in PATH." >&2
  exit 1
fi

python3 src/main.py



#!/usr/bin/env bash
# VaultBuddy - POSIX launcher with venv + deps install
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but was not found in PATH." >&2
  exit 1
fi

VENV_DIR=".venv"
PYEXE="$VENV_DIR/bin/python"

if [ ! -x "$PYEXE" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
  echo "Upgrading pip..."
  "$PYEXE" -m pip install --upgrade pip --disable-pip-version-check
  echo "Installing VaultBuddy (editable) and dependencies from pyproject.toml..."
  "$PYEXE" -m pip install -e . --disable-pip-version-check --no-input
else
  # Quiet check: attempt to import required packages; install only if missing
  if ! "$PYEXE" - <<'PYCODE'
import sys
try:
    import keyring, typer, pyperclip  # noqa: F401
except Exception:
    sys.exit(1)
sys.exit(0)
PYCODE
  then
    "$PYEXE" -m pip install -e . --disable-pip-version-check --no-input -q >/dev/null 2>&1
  fi
fi

echo "Launching VaultBuddy..."
"$PYEXE" src/main.py



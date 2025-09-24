#!/usr/bin/env bash
# VaultBuddy launcher (POSIX)
# - Supports Python 3.10+
# - Creates .venv if missing
# - Installs runtime deps if needed

set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 (3.10+) is required but was not found in PATH." >&2
  exit 1
fi

VENV_DIR=".venv"
PYEXE="$VENV_DIR/bin/python"

if [ ! -x "$PYEXE" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

# Ensure runtime deps (silent)
if ! "$PYEXE" - <<'PYCODE'
import importlib, sys
req = ['keyring','typer','pyperclip']
missing = [r for r in req if importlib.util.find_spec(r) is None]
sys.exit(1 if missing else 0)
PYCODE
then
  "$PYEXE" -m pip install -q --disable-pip-version-check keyring==24.3.1 pyperclip==1.8.2 typer==0.12.3 >/dev/null 2>&1
fi

echo "Launching VaultBuddy..."
"$PYEXE" src/main.py


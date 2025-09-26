# VaultBuddy

Local-first CLI secrets manager backed by your OS keyring. No plaintext secrets to stdout. Optional clipboard copy with auto-clear.

## Quickstart (Windows)
```powershell
# From project folder
.\run.bat

# Or use the CLI in the venv directly
.\.venv\Scripts\vaultbuddy add "Example"
.\.venv\Scripts\vaultbuddy get "example" --copy --timeout 15
```

## Features
- OS keyring storage (Windows Credential Locker/DPAPI, macOS Keychain, Secret Service/KWallet)
- No stdout for secrets; metadata only
- Quiet by default: add/delete don’t print secret names; use `--verbose` to opt-in
- Clipboard copy with auto-clear and configurable timeout
- Refuses to run on insecure keyring backends unless explicitly overridden

## Install
```bash
pip install .
# or using uv (recommended for locking)
pipx install uv
uv sync --dev
```

## CLI Usage
```bash
vaultbuddy --help
vaultbuddy --verbose add example
vaultbuddy add example                 # prompts, stores; no name echoed by default
vaultbuddy get example --copy --timeout 15  # copies to clipboard, auto-clears in 15s
vaultbuddy list                        # lists secret names from index
vaultbuddy delete example              # deletes; no name echoed by default

# If your platform loads an insecure backend, you must opt-in explicitly
vaultbuddy --allow-insecure-backend list

# Environment override (not recommended)
set VAULTBUDDY_ALLOW_INSECURE=1   # Windows (PowerShell: $env:VAULTBUDDY_ALLOW_INSECURE=1)
export VAULTBUDDY_ALLOW_INSECURE=1
```

## Clipboard Caveats
- Some OS clipboard managers/history may persist secrets beyond your control.
- Auto-clear overwrites the clipboard content after the timeout, but cannot purge OS-wide history.
- Prefer short timeouts and clear history manually where possible.

## Backend Security
- VaultBuddy checks the active keyring backend at startup.
- Secure backends: Windows, macOS, Secret Service, KWallet.
- Insecure/unknown backends (e.g., `keyrings.alt` plaintext, null, fail) are blocked by default.
- Override with `--allow-insecure-backend` or `VAULTBUDDY_ALLOW_INSECURE=1` (NOT RECOMMENDED).

## Development
- Python 3.10–3.13 supported
- Linting: ruff
- Security: bandit, detect-secrets
- Tests: pytest (keyring/clipboard mocked)

Run checks:
```bash
uv run ruff check .
uv run pytest -q
uv run bandit -q -r src
uv run detect-secrets scan --baseline .secrets.baseline
uv run pip-audit
```

## Threat Model (Summary)
- Local-only tool; relies on OS keyring for at-rest protection
- Metadata exposure: secret names listed (by design)
- Clipboard exposure: OS history/managers may persist contents
- In-memory exposure: Python strings cannot be securely zeroized; we minimize lifetime
- Supply chain: use pinned deps and `uv` lock for reproducibility
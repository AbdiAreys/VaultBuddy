# VaultBuddy

Local-first secrets manager with OS-native encryption. Python CLI + Electron desktop app.

## Installation

### Desktop App (Recommended)

**Windows:**
1. Download `VaultBuddy Setup 0.1.0.exe` from [Releases](https://github.com/AbdiAreys/VaultBuddy/releases)
2. Run the installer
3. Launch VaultBuddy from Start Menu

**Requirements:** Windows user password set (for DPAPI encryption)

### CLI (Advanced Users)

**Windows:**
```bash
scripts\run.bat
```

**macOS/Linux:**
```bash
scripts/run.sh
```

**Requirements:** Python 3.10+

---

**Developers:** See [`docs/FRONTEND_SETUP.md`](docs/FRONTEND_SETUP.md) for building from source.

## Features

Cross-platform secrets manager with dual interfaces. CLI offers terminal access with clipboard auto-clear. Desktop app provides modern UI with rate limiting (10 req/min), persistent audit logging, hardened CSP, and zero IPC secret exposure. All secrets encrypted via OS-native backends.

## Usage

**Desktop App:**
- Click the app icon or search "VaultBuddy" in Start Menu
- Use the GUI to add, view, copy, and delete secrets

**CLI:**
```bash
vaultbuddy add mysecret      # Add a secret
vaultbuddy get mysecret --copy  # Copy to clipboard
vaultbuddy list              # List all secrets
vaultbuddy delete mysecret   # Delete a secret
```

## Security

Desktop: Encrypted vault file (safeStorage API). CLI: OS keyring storage. See `SECURITY.md` for architecture details.
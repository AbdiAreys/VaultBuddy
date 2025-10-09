# VaultBuddy

Local-first secrets manager with OS-native encryption. Python CLI + Electron desktop app.

## Setup

**CLI:**
```bash
# Windows: scripts\run.bat
# macOS/Linux: scripts/run.sh
```

**Desktop App:**
```bash
cd frontend && npm install && npm run electron
# Or use: VaultBuddy Setup 0.1.0.exe
```

Requires Python 3.10+ (CLI) or Windows password set (desktop). Desktop uses Electron safeStorage (DPAPI/Keychain/libsecret). CLI uses OS keyring backends.

## Features

Cross-platform secrets manager with dual interfaces. CLI offers terminal access with clipboard auto-clear. Desktop app provides modern UI with rate limiting (10 req/min), persistent audit logging, hardened CSP, and zero IPC secret exposure. All secrets encrypted via OS-native backends.

## Usage

```bash
# CLI
vaultbuddy add mysecret
vaultbuddy get mysecret --copy
vaultbuddy list

# Desktop  
Run VaultBuddy.exe or VaultBuddy.lnk
```

## Security

Desktop: Encrypted vault file (safeStorage API). CLI: OS keyring storage. See `SECURITY.md` for architecture details.
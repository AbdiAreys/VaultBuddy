# VaultBuddy

Local-first secrets manager with OS-native encryption. Python CLI + Electron desktop app. Zero plaintext exposure.

## Setup

**CLI (All Platforms):**
```bash
# Windows
.\run.bat

# macOS/Linux  
./run.sh
```

**Desktop App:**
```bash
cd frontend && npm install && npm run electron-dev
```

Requires Python 3.10+ (CLI) or Node.js 16+ (desktop). Uses Windows Credential Manager, macOS Keychain, or Linux Secret Service.

## Features

Cross-platform secrets manager with dual interfaces sharing the same OS keyring. CLI offers quick terminal access with clipboard auto-clear (30s default). Desktop app provides modern UI with cybersecurity theme. All secrets encrypted via OS-native backends (DPAPI/Keychain/SecretService). Input validation, rate limiting, audit logging, and CSP security headers included. Refuses insecure backends unless explicitly overridden.

## Usage

```bash
# CLI
vaultbuddy add mysecret
vaultbuddy get mysecret --copy --timeout 15
vaultbuddy list
vaultbuddy delete mysecret

# Desktop
npm run electron-dev  # From frontend/
```

## Security

Secrets stored only in OS keyring. No local files or plaintext output. Backend validation on startup. See `SECURITY.md` for details.
# VaultBuddy Security

## Storage
**Desktop App**: Secrets encrypted using Electron's safeStorage API with OS-native encryption (Windows DPAPI, macOS Keychain Services, Linux libsecret). Encrypted vault stored in user data directory with 0600 permissions.

**CLI Tool**: Secrets stored in OS keyring (Windows Credential Manager, macOS Keychain, Linux Secret Service). Backend validation blocks insecure backends. Override with `--allow-insecure-backend` flag (not recommended).

## Architecture
**Defense-in-Depth Security Model**: Secrets never cross IPC boundaries - all operations occur in Electron main process. Context isolation enabled, node integration disabled. Hardened Content Security Policy in production (no unsafe-inline/eval).

## Protection
**Access Control**: Zero plaintext output - clipboard-only retrieval with 30s auto-clear.  
**Input Validation**: All secret names and values validated. Null byte checks prevent truncation attacks.  
**Rate Limiting**: 10 requests/minute with exponential backoff after failures prevents brute force.  
**Audit Trail**: All operations logged to persistent audit.log with timestamps for forensic analysis.  
**Error Handling**: Messages sanitized to prevent path/information leakage.

## Limitations
Strings cannot be securely zeroized in memory. OS clipboard managers may persist history beyond app control. Secret names (metadata) visible in list command. No master password authentication (physical access = full access).

**Report security issues privately to the maintainer.**

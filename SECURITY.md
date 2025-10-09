# VaultBuddy Security

## Storage
Secrets stored exclusively in OS keyring (Windows Credential Manager, macOS Keychain, Linux Secret Service). No local files or databases. Backend validation on startup blocks insecure backends (plaintext, null, fail). Override with `--allow-insecure-backend` flag (not recommended).

## Protection
Zero plaintext output - clipboard-only retrieval with 30s auto-clear. Input validation on all secret names. Rate limiting (100 req/min). Audit logging for all operations. CSP headers prevent XSS. Error messages sanitized to prevent path leakage.

## Limitations
Python/JS strings cannot be securely zeroized in memory. OS clipboard managers may persist history beyond app control. Secret names (metadata) visible in list command. Dependencies pinned - audit with `pip-audit`.

**Report security issues privately to the maintainer.**

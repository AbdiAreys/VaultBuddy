# VaultBuddy

A secure, local-only CLI secrets manager built with Python. Uses Argon2id key derivation and AES-256-GCM encryption.

## Features

- 🔐 **Secure encryption**: Argon2id + AES-256-GCM
- 📝 **CRUD operations**: Add, retrieve, list, and delete secrets
- 🔎 **Input validation**: Password strength and secret name validation
- 💾 **Local storage**: SQLite database (no network)
- 🖥️ **CLI interface**: Simple and fast

## Installation

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   python src/main.py
   ```

### Quick Launch

- Windows: `run.bat`
- macOS/Linux: `./run.sh`

## Usage

1. **Add secret** — Store a new secret
2. **Retrieve secret** — Decrypt and show a secret
3. **List secrets** — Show stored secret names
4. **Delete secret** — Remove a secret by name

### Password Requirements

- At least 8 characters
- Uppercase, lowercase, numbers, and special characters

## Security

- **Key derivation**: Argon2id (64 MB memory cost)
- **Encryption**: AES-256-GCM with random nonces
- **Storage**: SQLite with encrypted values
- **Local-only**: No network transmission

## License

Educational and personal use only.
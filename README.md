# VaultBuddy V1

A secure, local-only CLI secrets manager built with Python. VaultBuddy stores, retrieves, and manages secrets using Argon2id key derivation and AES-256-GCM encryption. It now includes password and name validation, persistent vault salt, delete support, and automatic DB migration.

## Features

- 🔐 **Secure encryption**: Argon2id-derived 256-bit key + AES-256-GCM
- 🧂 **Persistent vault salt**: 32-byte random salt saved in SQLite `metadata`
- 📝 **CRUD operations**: Add, retrieve, list, and delete secrets
- 🔎 **Validation**: Master password strength and secret name validation
- 💾 **Local storage**: SQLite database (no network)
- 🖥️ **CLI interface**: Simple and fast
- 🔑 **Master password**: Single password protects the entire vault

## Security Details

- **Key derivation**: Argon2id with time_cost=2, memory_cost=65536 (64 MB), parallelism=1
- **Vault salt**: 32-byte random salt generated on first run and stored under `metadata.vault_salt`
- **Encryption**: AES-256-GCM with a 12-byte random nonce
- **Storage**: SQLite; `secrets` table stores name, encrypted value, salt, timestamps
- **Password handling**: Master password is never stored; input is masked; best-effort sensitive data clearing

## Requirements

- Python 3.11 or higher
- Required packages: `cryptography`, `argon2-cffi`

## Installation

1. **Clone or download** this repository to your local machine

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python src/main.py
   ```

### Quick Launch

- Windows (double-click): `run.bat`
- macOS/Linux:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```

## Usage

### Starting VaultBuddy

Run from the project root:

```bash
python src/main.py
```

On first run, a random vault salt is created and saved. You will be prompted for the master password (see password requirements below).

### Menu Options

1. **Add secret** — Store a new secret
2. **Retrieve secret** — Decrypt and show a secret
3. **List secrets** — Show stored secret names
4. **Delete secret** — Remove a secret by name
5. **Exit** — Quit the application

### Adding a Secret

1. Select `1`
2. Enter a valid secret name (see rules below)
3. Enter the secret value (input is hidden)
4. The encrypted secret is saved

### Retrieving a Secret

1. Select `2`
2. Enter the secret name
3. The decrypted value is displayed

### Listing Secrets

1. Select `3`
2. You will see all stored names (values are never shown)

### Deleting a Secret

1. Select `4`
2. Enter the secret name to delete

### Password Requirements

- At least 8 characters and fewer than 128 characters
- Must contain uppercase, lowercase, and numbers
- Must contain at least one special character: `!@#$%^&*()_+-=[]{}|;:,.<>?`

### Secret Name Rules

- Cannot be empty; maximum 100 characters
- Must not contain any of: `" ' ; \\ / : * ? < > |`

## File Structure

```
VaultBuddy/
├── src/
│   ├── main.py          # Main application entry point (CLI)
│   ├── crypto.py        # Cryptographic functions and validation
│   └── storage.py       # SQLite database operations & migration
├── requirements.txt     # Python dependencies
├── run.bat              # Windows launcher
├── run.sh               # macOS/Linux launcher
├── README.md            # This file
└── vaultbuddy.db        # SQLite database (created on first run)
```

## Database & Migration

- On startup, the app ensures required tables exist (`metadata`, `secrets`).
- If an existing database is missing the `secrets.salt` column, it is added automatically and you will see a confirmation message in the console.
- Vault-level salt is stored under `metadata.vault_salt`.

## Security Considerations

⚠️ **Important notes**

- Local-only application: secrets are never transmitted over the network
- Master password is never stored; losing it means losing access to all secrets
- The database file (`vaultbuddy.db`) contains encrypted data and should be kept secure

## Development

- `main.py`: CLI and application flow
- `crypto.py`: Key derivation, AES-GCM encryption/decryption, input validation
- `storage.py`: SQLite init/migration, CRUD functions, persistent vault salt

### Dependencies

- `cryptography`: AES-GCM encryption/decryption
- `argon2-cffi`: Argon2id key derivation

## License

This project is for educational and personal use. Understand the security implications before using it for sensitive data.

## Future Enhancements

- Per-secret key derivation that combines vault/master key with per-secret salt
- Secret categories/tags
- Import/export functionality
- Auto-lock after inactivity
- Backup and restore features
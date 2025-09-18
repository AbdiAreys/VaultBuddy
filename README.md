# VaultBuddy V1

A secure, local-only CLI-based secrets manager built with Python. VaultBuddy allows you to store, retrieve, and manage your secrets using strong encryption with Argon2id key derivation and AES-256-GCM encryption.

## Features

- 🔐 **Secure Encryption**: Uses Argon2id for key derivation and AES-256-GCM for encryption
- 💾 **Local Storage**: SQLite database for local-only secret storage
- 🖥️ **CLI Interface**: Simple command-line interface for easy use
- 🔑 **Master Password**: Single master password protects all your secrets
- 📝 **CRUD Operations**: Add, retrieve, and list secrets

## Security Details

- **Key Derivation**: Argon2id with time_cost=2, memory_cost=65536 (64 MB), parallelism=1
- **Encryption**: AES-256-GCM with 12-byte random nonce
- **Storage**: SQLite database with encrypted blob storage
- **Password**: Master password required for all operations

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

## Usage

### Starting VaultBuddy

Run the application from the project root directory:

```bash
python src/main.py
```

You'll be prompted to enter your master password. This password is used to derive the encryption key for all your secrets.

### Menu Options

Once started, you'll see the main menu with these options:

1. **Add secret** - Store a new secret
2. **Retrieve secret** - Get and decrypt a stored secret
3. **List secrets** - View all stored secret names
4. **Exit** - Quit the application

### Adding a Secret

1. Select option `1` from the menu
2. Enter a name for your secret (e.g., "GitHub Password")
3. Enter the secret value (input is hidden for security)
4. The secret will be encrypted and stored

### Retrieving a Secret

1. Select option `2` from the menu
2. Enter the name of the secret you want to retrieve
3. The decrypted secret will be displayed

### Listing Secrets

1. Select option `3` from the menu
2. All stored secret names will be displayed (values are not shown)

## File Structure

```
VaultBuddy/
├── src/
│   ├── main.py          # Main application entry point
│   ├── crypto.py        # Cryptographic functions
│   └── storage.py       # Database operations
├── requirements.txt     # Python dependencies
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── vaultbuddy.db       # SQLite database (created on first run)
```

## Security Considerations

⚠️ **Important Security Notes:**

- This is a local-only application - secrets are never transmitted over the network
- The master password is never stored - it's only used to derive the encryption key
- Currently uses a static salt for demonstration - production versions should use random salts
- Keep your master password secure - losing it means losing access to all secrets
- The database file (`vaultbuddy.db`) contains encrypted data but should still be kept secure

## Development

### Project Structure

- `main.py`: CLI interface and main application logic
- `crypto.py`: Cryptographic operations (key derivation, encryption, decryption)
- `storage.py`: SQLite database operations

### Dependencies

- `cryptography`: For AES-GCM encryption/decryption
- `argon2-cffi`: For Argon2id key derivation

## License

This project is for educational and personal use. Please ensure you understand the security implications before using it for sensitive data.

## Future Enhancements

- Random salt generation per vault
- Secret categories/tags
- Import/export functionality
- Password strength validation
- Auto-lock after inactivity
- Backup and restore features
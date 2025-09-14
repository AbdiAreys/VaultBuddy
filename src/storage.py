"""
This module is responsible for local SQLite storage.

Functions:
- init_db(): Initializes the SQLite database.
- store_secret(name: str, encrypted_value: bytes): Stores a secret in the database.
- get_secret(name: str): Retrieves a secret from the database.
- list_secrets(): Lists all stored secrets.
"""

import sqlite3

DB_FILE = "vaultbuddy.db"

def init_db():
    """Initializes the SQLite database and creates the secrets table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS secrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            value BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print(f"✅ Database initialized: {DB_FILE}")


def store_secret(name: str, encrypted_value: bytes):
    """Stores a secret in the database.
    
    Args:
        name (str): The name of the secret.
        encrypted_value (bytes): The encrypted value of the secret.
    """
    pass


def get_secret(name: str):
    """Retrieves a secret from the database.
    
    Args:
        name (str): The name of the secret to retrieve.
    
    Returns:
        The decrypted secret value.
    """
    pass


def list_secrets():
    """Lists all stored secrets."""
    pass

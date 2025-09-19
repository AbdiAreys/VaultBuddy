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
            salt BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print(f"✅ Database initialized: {DB_FILE}")


def store_secret(name: str, encrypted_value: bytes, salt: bytes):
    """Stores a secret in the database.
    
    Args:
        name (str): The name of the secret.
        encrypted_value (bytes): The encrypted value of the secret.
        salt (bytes): The salt used for key derivation.
    """
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        INSERT INTO secrets (name, value, salt, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET 
            value=excluded.value,
            salt=excluded.salt,
            updated_at=CURRENT_TIMESTAMP
    """, (name, encrypted_value, salt))
    conn.commit()
    conn.close()
    print(f"🔐 Secret stored: {name}")


def get_secret(name: str) -> tuple[bytes, bytes] | None:
    """Retrieves a secret from the database.
    
    Args:
        name (str): The name of the secret to retrieve.
        
    Returns:
        tuple[bytes, bytes]: (encrypted_value, salt) or None if not found.
    """
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT value, salt FROM secrets WHERE name = ?", (name,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return result[0], result[1]
    return None


def list_secrets() -> list[str]:
    """Lists all stored secret names.
    
    Returns:
        list[str]: A list of all secret names in the database.
    """
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT name FROM secrets ORDER BY name")
    results = c.fetchall()
    conn.close()
    
    return [row[0] for row in results]

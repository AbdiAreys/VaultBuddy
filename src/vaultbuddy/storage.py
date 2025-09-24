"""
OS keyring-backed storage for secrets and a minimal index for listing.

Also includes a migration helper from the legacy SQLite database used in
earlier versions of VaultBuddy.
"""

from typing import Optional, List, Set
import os
import sqlite3

try:
    import keyring  # type: ignore
    try:
        from keyring.errors import PasswordDeleteError  # type: ignore
    except Exception:
        class PasswordDeleteError(Exception):
            pass
except Exception as exc:
    raise RuntimeError("The 'keyring' package is required. Install with 'pip install keyring'.") from exc


SERVICE_NAME = "VaultBuddy"
INDEX_USERNAME = "__index__"


def init_db() -> None:
    """Initializes the keyring-backed store by ensuring the index exists."""
    _ensure_index()


def _ensure_index() -> None:
    if keyring.get_password(SERVICE_NAME, INDEX_USERNAME) is None:
        keyring.set_password(SERVICE_NAME, INDEX_USERNAME, "")


def _load_index() -> Set[str]:
    data = keyring.get_password(SERVICE_NAME, INDEX_USERNAME)
    if not data:
        return set()
    names = [n.strip() for n in data.split("\n") if n.strip()]
    return set(names)


def _save_index(names: Set[str]) -> None:
    payload = "\n".join(sorted(names))
    keyring.set_password(SERVICE_NAME, INDEX_USERNAME, payload)


def store_secret(name: str, value: str) -> None:
    """Stores a secret in the OS keyring and updates the index."""
    keyring.set_password(SERVICE_NAME, name, value)
    names = _load_index()
    names.add(name)
    _save_index(names)


def get_secret(name: str) -> Optional[str]:
    """Retrieves a secret from the OS keyring by name."""
    return keyring.get_password(SERVICE_NAME, name)


def list_secrets() -> List[str]:
    """Lists all stored secret names from the index."""
    return sorted(_load_index())


def delete_secret(name: str) -> bool:
    """Deletes a secret by name from the OS keyring and updates the index."""
    try:
        keyring.delete_password(SERVICE_NAME, name)
    except PasswordDeleteError:
        return False
    names = _load_index()
    if name in names:
        names.remove(name)
        _save_index(names)
    return True


# Migration helpers removed to reduce attack surface and dependency on legacy crypto.



"""
OS keyring-backed storage for secrets and a minimal index for listing.

Also includes a migration helper from the legacy SQLite database used in
earlier versions of VaultBuddy.
"""

from typing import Optional, List, Set, Tuple
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


def init_db(allow_insecure_backend: bool = False) -> None:
    """Initializes the keyring-backed store by ensuring the index exists.

    Also enforces that a secure keyring backend is in use unless explicitly
    allowed via flag or environment variable ``VAULTBUDDY_ALLOW_INSECURE``.
    """
    allow_env = os.getenv("VAULTBUDDY_ALLOW_INSECURE", "").strip()
    allow_flag = allow_insecure_backend or allow_env in {"1", "true", "True", "yes", "YES"}
    secure, info, reason = is_secure_backend()
    if not secure and not allow_flag:
        raise RuntimeError(
            (
                "Insecure or unsupported keyring backend detected: "
                f"{info}. Refusing to continue.\nReason: {reason}\n"
                "Set env VAULTBUDDY_ALLOW_INSECURE=1 or pass --allow-insecure-backend "
                "to override (NOT RECOMMENDED)."
            )
        )
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


def resolve_canonical_name(name: str) -> Optional[str]:
    """Resolve the provided name to the canonical stored name (case-insensitive).

    Returns the exact name as stored in the index if a case-insensitive match
    exists; otherwise returns None.
    """
    names = _load_index()
    if not names:
        return None
    if name in names:
        return name
    target = name.casefold()
    for existing in names:
        if existing.casefold() == target:
            return existing
    return None


def _backend_identity() -> Tuple[str, str]:
    """Returns (module_path, class_name) of the active keyring backend."""
    try:
        kr = keyring.get_keyring()
        module_path = getattr(kr.__class__, "__module__", "unknown")
        class_name = getattr(kr.__class__, "__name__", "Unknown")
        return module_path, class_name
    except Exception:
        return "unknown", "Unknown"


def is_secure_backend() -> Tuple[bool, str, str]:
    """Detect whether the current keyring backend is considered secure.

    Returns (is_secure, identity, reason).
    """
    module_path, class_name = _backend_identity()
    identity = f"{module_path}.{class_name}"

    # Allow-list of expected secure backends on major platforms
    secure_prefixes = (
        "keyring.backends.Windows",        # Windows Credential Locker / DPAPI
        "keyring.backends.macOS",          # macOS Keychain
        "keyring.backends.SecretService",  # Linux Secret Service (GNOME Keyring)
        "keyring.backends.kwallet",        # KDE KWallet
    )

    insecure_indicators = (
        "keyrings.alt",             # plaintext/file-based backends from keyrings.alt
        "keyring.backends.fail",    # non-functional/insecure
        "keyring.backends.null",    # no-op
        "plaintext",                # any plaintext hint
        "Plaintext",                # class naming hint
    )

    # Explicitly block known-insecure signals
    lowered = identity.lower()
    if any(indicator in lowered for indicator in insecure_indicators):
        return False, identity, "Backend appears insecure (plaintext/null/fail)."

    # Treat chainer as insecure unless it chains only to secure backends. We cannot
    # introspect safely here, so default to warning.
    if "keyring.backends.chainer" in lowered:
        return False, identity, "Chained backend detected; unable to verify security."

    # If matches known good prefixes, consider secure
    if any(module_path.startswith(pref) for pref in secure_prefixes):
        return True, identity, "Recognized secure OS-native backend."

    # Fallback: unknown backend → warn as insecure
    return False, identity, "Unknown backend; security cannot be assured."


def store_secret(name: str, value: str) -> None:
    """Stores a secret in the OS keyring and updates the index."""
    canonical = resolve_canonical_name(name) or name
    keyring.set_password(SERVICE_NAME, canonical, value)
    names = _load_index()
    names.add(canonical)
    _save_index(names)


def get_secret(name: str) -> Optional[str]:
    """Retrieves a secret from the OS keyring by name."""
    canonical = resolve_canonical_name(name)
    if canonical is None:
        return None
    return keyring.get_password(SERVICE_NAME, canonical)


def list_secrets() -> List[str]:
    """Lists all stored secret names from the index."""
    return sorted(_load_index())


def delete_secret(name: str) -> bool:
    """Deletes a secret by name from the OS keyring and updates the index."""
    canonical = resolve_canonical_name(name)
    if canonical is None:
        return False
    try:
        keyring.delete_password(SERVICE_NAME, canonical)
    except PasswordDeleteError:
        return False
    names = _load_index()
    if canonical in names:
        names.remove(canonical)
        _save_index(names)
    return True


# Migration helpers removed to reduce attack surface and dependency on legacy crypto.



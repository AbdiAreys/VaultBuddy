"""
Launches the interactive VaultBuddy CLI.
"""

from vaultbuddy.cli import interactive
from vaultbuddy.storage import is_secure_backend

if __name__ == "__main__":
    try:
        interactive()
    except RuntimeError as exc:
        secure, ident, reason = is_secure_backend()
        print("\n❌ VaultBuddy failed to start.")
        print(f"Reason: {exc}")
        print(f"Active keyring backend: {ident}")
        if not secure:
            print("\nThis backend is considered insecure or unknown.")
            print("To proceed anyway, set VAULTBUDDY_ALLOW_INSECURE=1 and re-run.")
            print("Alternatively, install/enable your OS's secure keyring backend.")
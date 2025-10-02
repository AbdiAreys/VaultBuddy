"""
Launches the interactive VaultBuddy menu or API server.
"""

import sys
from vaultbuddy.cli import interactive
from vaultbuddy.storage import is_secure_backend

if __name__ == "__main__":
    # Check if API mode is requested
    if len(sys.argv) > 1 and sys.argv[1] == "--api-mode":
        from vaultbuddy.api import run_api_server
        try:
            run_api_server()
        except RuntimeError as exc:
            secure, ident, reason = is_secure_backend()
            error_response = {
                "success": False,
                "error": str(exc),
                "backend": {"identity": ident, "secure": secure, "reason": reason}
            }
            import json
            print(json.dumps(error_response))
            sys.exit(1)
    else:
        # Run interactive mode
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
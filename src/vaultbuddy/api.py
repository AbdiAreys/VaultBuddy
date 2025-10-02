"""
API interface for VaultBuddy that can be used by the Electron frontend.
Provides JSON-based communication for secret management operations.
"""

import json
import sys
import getpass
from typing import Dict, Any, Optional
from .storage import init_db, store_secret, get_secret, list_secrets, delete_secret
from .crypto import validate_secret_name


def json_response(success: bool, data: Any = None, error: str = None) -> str:
    """Create a standardized JSON response."""
    response = {
        "success": success,
        "data": data,
        "error": error
    }
    return json.dumps(response)


def handle_list_secrets() -> str:
    """Handle list secrets API call."""
    try:
        secrets = list_secrets()
        return json_response(True, {"secrets": secrets})
    except Exception as e:
        return json_response(False, error=str(e))


def handle_add_secret(name: str, value: Optional[str] = None) -> str:
    """Handle add secret API call."""
    try:
        # Validate secret name
        is_valid, error_msg = validate_secret_name(name)
        if not is_valid:
            return json_response(False, error=error_msg)
        
        # Check if secret already exists
        existing = get_secret(name)
        if existing is not None:
            return json_response(False, error=f"Secret '{name}' already exists")
        
        # Get value if not provided (for interactive mode)
        if value is None:
            try:
                value = getpass.getpass("Enter secret value: ")
            except (KeyboardInterrupt, EOFError):
                return json_response(False, error="Operation cancelled")
        
        if not value:
            return json_response(False, error="Secret value cannot be empty")
        
        store_secret(name, value)
        return json_response(True, {"message": f"Secret '{name}' stored successfully"})
        
    except Exception as e:
        return json_response(False, error=str(e))


def handle_get_secret(name: str) -> str:
    """Handle get secret API call."""
    try:
        value = get_secret(name)
        if value is None:
            return json_response(False, error=f"Secret '{name}' not found")
        
        # For security, we don't return the actual value in the API
        # The frontend should use copy-to-clipboard functionality
        return json_response(True, {"message": "Secret retrieved successfully", "has_value": True})
        
    except Exception as e:
        return json_response(False, error=str(e))


def handle_copy_secret(name: str) -> str:
    """Handle copy secret to clipboard API call."""
    try:
        value = get_secret(name)
        if value is None:
            return json_response(False, error=f"Secret '{name}' not found")
        
        # Try to copy to clipboard
        try:
            import pyperclip
            pyperclip.copy(value)
            return json_response(True, {"message": "Secret copied to clipboard"})
        except ImportError:
            return json_response(False, error="pyperclip not installed - cannot copy to clipboard")
        except Exception as e:
            return json_response(False, error=f"Failed to copy to clipboard: {str(e)}")
            
    except Exception as e:
        return json_response(False, error=str(e))


def handle_delete_secret(name: str) -> str:
    """Handle delete secret API call."""
    try:
        if delete_secret(name):
            return json_response(True, {"message": f"Secret '{name}' deleted successfully"})
        else:
            return json_response(False, error=f"Secret '{name}' not found")
            
    except Exception as e:
        return json_response(False, error=str(e))


def handle_status() -> str:
    """Handle status/health check API call."""
    try:
        from .storage import is_secure_backend
        secure, identity, reason = is_secure_backend()
        
        return json_response(True, {
            "status": "running",
            "backend": {
                "identity": identity,
                "secure": secure,
                "reason": reason
            }
        })
    except Exception as e:
        return json_response(False, error=str(e))


def run_api_server():
    """Run the API server that listens for commands from stdin."""
    try:
        # Initialize the database
        init_db()
        
        # Send ready signal
        print(json_response(True, {"message": "VaultBuddy API ready"}))
        sys.stdout.flush()
        
        # Listen for commands
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                line = line.strip()
                if not line:
                    continue
                
                try:
                    command = json.loads(line)
                except json.JSONDecodeError:
                    print(json_response(False, error="Invalid JSON command"))
                    sys.stdout.flush()
                    continue
                
                action = command.get("action")
                params = command.get("params", {})
                
                if action == "list":
                    response = handle_list_secrets()
                elif action == "add":
                    name = params.get("name")
                    value = params.get("value")
                    if not name:
                        response = json_response(False, error="Missing 'name' parameter")
                    else:
                        response = handle_add_secret(name, value)
                elif action == "get":
                    name = params.get("name")
                    if not name:
                        response = json_response(False, error="Missing 'name' parameter")
                    else:
                        response = handle_get_secret(name)
                elif action == "copy":
                    name = params.get("name")
                    if not name:
                        response = json_response(False, error="Missing 'name' parameter")
                    else:
                        response = handle_copy_secret(name)
                elif action == "delete":
                    name = params.get("name")
                    if not name:
                        response = json_response(False, error="Missing 'name' parameter")
                    else:
                        response = handle_delete_secret(name)
                elif action == "status":
                    response = handle_status()
                else:
                    response = json_response(False, error=f"Unknown action: {action}")
                
                print(response)
                sys.stdout.flush()
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(json_response(False, error=f"Unexpected error: {str(e)}"))
                sys.stdout.flush()
                
    except Exception as e:
        print(json_response(False, error=f"Failed to start API server: {str(e)}"))
        sys.exit(1)


if __name__ == "__main__":
    run_api_server()

"""
Input validation helpers for VaultBuddy.
"""

from typing import Tuple


def validate_secret_name(name: str) -> Tuple[bool, str]:
    if not name or not name.strip():
        return False, "Secret name cannot be empty"
    if len(name) > 100:
        return False, "Secret name must be less than 100 characters"
    if any(c in name for c in ['\n', '\r', '\t']):
        return False, "Secret name cannot contain whitespace control characters"
    if any(c in name for c in ['"', "'", ";", "\\", "/", ":", "*", "?", "<", ">", "|"]):
        return False, "Secret name contains invalid characters"
    return True, ""



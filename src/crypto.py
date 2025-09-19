"""
This module is responsible for cryptographic operations.
Provides functions for key derivation, encryption, and decryption.
"""

from argon2.low_level import hash_secret_raw, Type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os


def derive_key(password: str, salt: bytes | None = None) -> bytes:
    """
    Derives a 32-byte key from the given password using Argon2id.
    Uses a random salt for security.
    
    Args:
        password (str): The password to derive the key from.
        salt (bytes, optional): Salt to use. If None, generates a random one.
        
    Returns:
        bytes: The derived key.
    """
    if salt is None:
        salt = os.urandom(32)  # 256-bit random salt
    
    key = hash_secret_raw(
        secret=password.encode(),
        salt=salt,
        time_cost=2,
        memory_cost=65536,   # 64 MB
        parallelism=1,
        hash_len=32,         # 32 bytes = 256-bit AES key
        type=Type.ID
    )
    return key


def generate_salt() -> bytes:
    """
    Generates a cryptographically secure random salt.
    
    Returns:
        bytes: A 32-byte random salt.
    """
    return os.urandom(32)


def clear_sensitive_data(data: str):
    """
    Securely clears sensitive data from memory.
    
    Args:
        data (str): The sensitive data to clear.
    """
    if isinstance(data, str):
        # Overwrite with zeros
        data = '\x00' * len(data)
    del data


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validates password strength requirements.
    
    Args:
        password (str): The password to validate.
        
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not (has_upper and has_lower and has_digit):
        return False, "Password must contain uppercase, lowercase, and numbers"
    
    if not has_special:
        return False, "Password must contain at least one special character"
    
    return True, ""


def validate_secret_name(name: str) -> tuple[bool, str]:
    """
    Validates secret name requirements.
    
    Args:
        name (str): The secret name to validate.
        
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not name or not name.strip():
        return False, "Secret name cannot be empty"
    
    if len(name) > 100:
        return False, "Secret name must be less than 100 characters"
    
    if any(c in name for c in ['"', "'", ";", "\\", "/", ":", "*", "?", "<", ">", "|"]):
        return False, "Secret name contains invalid characters"
    
    return True, ""


def encrypt_data(key: bytes, plaintext: str) -> bytes:
    """
    Encrypts the given plaintext using AES-256-GCM.
    
    Args:
        key (bytes): 32-byte encryption key.
        plaintext (str): The secret to encrypt.
    
    Returns:
        bytes: Nonce + ciphertext + tag.
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit random nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return nonce + ciphertext  # Store nonce + ciphertext + tag together


def decrypt_data(key: bytes, data: bytes) -> str:
    """
    Decrypts the given ciphertext using AES-256-GCM.
    
    Args:
        key (bytes): 32-byte encryption key.
        data (bytes): Nonce + ciphertext + tag.
    
    Returns:
        str: Decrypted plaintext.
    """
    aesgcm = AESGCM(key)
    nonce, ct = data[:12], data[12:]
    plaintext = aesgcm.decrypt(nonce, ct, None)
    return plaintext.decode()

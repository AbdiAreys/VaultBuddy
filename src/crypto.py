"""
This module is responsible for cryptographic operations.
Provides functions for key derivation, encryption, and decryption.
"""

from argon2.low_level import hash_secret_raw, Type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os


def derive_key(password: str) -> bytes:
    """
    Derives a 32-byte key from the given password using Argon2id.
    Uses a static salt for demonstration purposes (replace with random salt in production).
    
    Args:
        password (str): The password to derive the key from.
        
    Returns:
        bytes: The derived key.
    """
    static_salt = b"VaultBuddyStaticSalt123"  # ⚠️ Static for MVP. Replace with random salt in production.
    key = hash_secret_raw(
        secret=password.encode(),
        salt=static_salt,
        time_cost=2,
        memory_cost=65536,   # 64 MB
        parallelism=1,
        hash_len=32,         # 32 bytes = 256-bit AES key
        type=Type.ID
    )
    return key


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

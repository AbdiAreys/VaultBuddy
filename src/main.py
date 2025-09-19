import getpass
from crypto import (
    derive_key, encrypt_data, decrypt_data, generate_salt, 
    clear_sensitive_data, validate_password_strength, validate_secret_name
)
from storage import init_db, store_secret, get_secret, list_secrets, get_vault_salt, set_vault_salt, delete_secret

def main():
    """
    Main entry point of the VaultBuddy application.
    - Asks for a master password.
    - Derives a key using crypto.py.
    - Displays a placeholder CLI menu.
    """

    init_db()
    
    # Ask for master password with validation
    while True:
        master_password = getpass.getpass("Enter your master password: ")
        is_valid, error_msg = validate_password_strength(master_password)
        if is_valid:
            break
        print(f"❌ {error_msg}")
        print("Password requirements:")
        print("  - At least 8 characters")
        print("  - Uppercase and lowercase letters")
        print("  - Numbers and special characters")
        print()

    # Load or create persistent vault salt, then derive key
    vault_salt = get_vault_salt()
    if vault_salt is None:
        vault_salt = generate_salt()
        set_vault_salt(vault_salt)
    key = derive_key(master_password, vault_salt)
    clear_sensitive_data(master_password)  # Clear password from memory
    print("✅ Key derived successfully")

    while True:
        print("\nVaultBuddy Menu:")
        print("1. Add secret")
        print("2. Retrieve secret")
        print("3. List secrets")
        print("4. Delete secret")
        print("5. Exit")

        choice = input("Select an option: ")

        if choice == '1':
            add_secret(key)
        elif choice == '2':
            retrieve_secret(key)
        elif choice == '3':
            list_all_secrets()
        elif choice == '4':
            delete_secret_cli()
        elif choice == '5':
            print("Exiting VaultBuddy. Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")


def add_secret(key: bytes):
    """Add a new secret to the vault."""
    # Validate secret name
    while True:
        name = input("Enter secret name: ").strip()
        is_valid, error_msg = validate_secret_name(name)
        if is_valid:
            break
        print(f"❌ {error_msg}")
    
    # Get secret value
    value = getpass.getpass("Enter secret value: ")
    if not value:
        print("❌ Secret value cannot be empty")
        return
    
    try:
        # Generate random salt for this secret
        salt = generate_salt()
        # Derive key with the specific salt
        secret_key = derive_key("", salt)  # We'll use the master key + salt
        # For now, use the master key directly (in production, you'd combine them)
        encrypted_value = encrypt_data(key, value)
        store_secret(name, encrypted_value, salt)
        clear_sensitive_data(value)  # Clear secret from memory
    except Exception as e:
        print(f"❌ Error storing secret: {e}")
        clear_sensitive_data(value)


def retrieve_secret(key: bytes):
    """Retrieve and display a secret from the vault."""
    name = input("Enter secret name: ").strip()
    if not name:
        print("❌ Secret name cannot be empty")
        return
    
    try:
        result = get_secret(name)
        if result is None:
            print(f"❌ Secret '{name}' not found")
            return
        
        encrypted_value, salt = result
        decrypted_value = decrypt_data(key, encrypted_value)
        print(f"🔓 Secret '{name}': {decrypted_value}")
        clear_sensitive_data(decrypted_value)  # Clear decrypted value from memory
    except Exception as e:
        print(f"❌ Error retrieving secret: {e}")


def list_all_secrets():
    """List all stored secret names."""
    try:
        secrets = list_secrets()
        if not secrets:
            print("📂 No secrets stored")
        else:
            print("📂 Stored secrets:")
            for i, name in enumerate(secrets, 1):
                print(f"  {i}. {name}")
    except Exception as e:
        print(f"❌ Error listing secrets: {e}")


def delete_secret_cli():
    """Delete a secret by name."""
    name = input("Enter secret name to delete: ").strip()
    if not name:
        print("❌ Secret name cannot be empty")
        return
    try:
        deleted = delete_secret(name)
        if not deleted:
            print("❌ Nothing deleted")
    except Exception as e:
        print(f"❌ Error deleting secret: {e}")

if __name__ == "__main__":
    main()
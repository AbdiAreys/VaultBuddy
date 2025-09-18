import getpass
from crypto import derive_key, encrypt_data, decrypt_data
from storage import init_db, store_secret, get_secret, list_secrets

def main():
    """
    Main entry point of the VaultBuddy application.
    - Asks for a master password.
    - Derives a key using crypto.py.
    - Displays a placeholder CLI menu.
    """

    init_db()
    # Ask for master password (hidden input so it doesn’t show on screen)
    master_password = getpass.getpass("Enter your master password: ")

    # Derive encryption key
    key = derive_key(master_password)
    print("✅ Key derived successfully")

    while True:
        print("\nVaultBuddy Menu:")
        print("1. Add secret")
        print("2. Retrieve secret")
        print("3. List secrets")
        print("4. Exit")

        choice = input("Select an option: ")

        if choice == '1':
            add_secret(key)
        elif choice == '2':
            retrieve_secret(key)
        elif choice == '3':
            list_all_secrets()
        elif choice == '4':
            print("Exiting VaultBuddy. Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")


def add_secret(key: bytes):
    """Add a new secret to the vault."""
    name = input("Enter secret name: ").strip()
    if not name:
        print("❌ Secret name cannot be empty")
        return
    
    value = getpass.getpass("Enter secret value: ")
    if not value:
        print("❌ Secret value cannot be empty")
        return
    
    try:
        encrypted_value = encrypt_data(key, value)
        store_secret(name, encrypted_value)
    except Exception as e:
        print(f"❌ Error storing secret: {e}")


def retrieve_secret(key: bytes):
    """Retrieve and display a secret from the vault."""
    name = input("Enter secret name: ").strip()
    if not name:
        print("❌ Secret name cannot be empty")
        return
    
    try:
        encrypted_value = get_secret(name)
        if encrypted_value is None:
            print(f"❌ Secret '{name}' not found")
            return
        
        decrypted_value = decrypt_data(key, encrypted_value)
        print(f"🔓 Secret '{name}': {decrypted_value}")
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

if __name__ == "__main__":
    main()
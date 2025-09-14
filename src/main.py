import getpass
from crypto import derive_key
from storage import init_db

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
    print(f"✅ Key derived successfully (hex preview): {key.hex()}")

    while True:
        print("\nVaultBuddy Menu:")
        print("1. Add secret")
        print("2. Retrieve secret")
        print("3. List secrets")
        print("4. Exit")

        choice = input("Select an option: ")

        if choice == '1':
            print("🔐 [Add secret functionality not yet implemented]")
            # Future: call storage.store_secret()
        elif choice == '2':
            print("🔎 [Retrieve secret functionality not yet implemented]")
            # Future: call storage.get_secret()
        elif choice == '3':
            print("📂 [List secrets functionality not yet implemented]")
            # Future: call storage.list_secrets()
        elif choice == '4':
            print("Exiting VaultBuddy. Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")

if __name__ == "__main__":
    main()

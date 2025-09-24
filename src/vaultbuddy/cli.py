import getpass
import threading
import time
try:
    import typer  # type: ignore
except Exception as exc:
    raise RuntimeError("The 'typer' package is required. Install with 'pip install typer'.") from exc

from .crypto import validate_secret_name
from .storage import (
    init_db, store_secret, get_secret, list_secrets, delete_secret
)

app = typer.Typer(add_completion=False, help="VaultBuddy - OS keyring-backed secrets manager")


@app.callback()
def _init(
    ctx: typer.Context,
    verbose: bool = typer.Option(False, "--verbose", help="Verbose output; include secret names in messages"),
    allow_insecure_backend: bool = typer.Option(
        False,
        "--allow-insecure-backend",
        help="Allow running with insecure/unknown keyring backend (NOT RECOMMENDED)",
    ),
) -> None:
    """Initialize app context and storage with backend security enforcement."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = bool(verbose)
    init_db(allow_insecure_backend=allow_insecure_backend)


@app.command()
def add(
    ctx: typer.Context,
    name: str = typer.Argument(..., help="Secret name"),
):
    is_valid, error_msg = validate_secret_name(name)
    if not is_valid:
        raise typer.BadParameter(error_msg)
    existing = get_secret(name)
    if existing is not None:
        verbose = bool(ctx.obj.get("verbose", False))
        prompt = f"Secret '{name}' exists. Overwrite?" if verbose else "Secret exists. Overwrite?"
        overwrite = typer.confirm(prompt, default=False)
        if not overwrite:
            typer.echo("❌ Secret not added")
            raise typer.Exit(code=1)
    value = getpass.getpass("Enter secret value: ")
    if not value:
        typer.echo("❌ Secret value cannot be empty")
        raise typer.Exit(code=1)
    store_secret(name, value)
    # Reduce lifetime of secret value in memory
    value = ""  # strings are immutable; rebinding reduces reference lifetime only
    verbose = bool(ctx.obj.get("verbose", False))
    if verbose:
        typer.echo(f"✅ Secret '{name}' stored successfully")
    else:
        typer.echo("✅ Secret stored successfully")


@app.command()
def get(
    name: str = typer.Argument(..., help="Secret name"),
    copy: bool = typer.Option(False, help="Copy to clipboard with auto-clear"),
    timeout: int = typer.Option(30, help="Clipboard auto-clear seconds"),
):
    value = get_secret(name)
    if value is None:
        typer.echo(f"❌ Secret '{name}' not found")
        raise typer.Exit(code=1)
    if copy:
        copy_to_clipboard_with_autoclear(value, timeout)
    else:
        typer.echo("ℹ️ Retrieval succeeded. Use --copy to place it on clipboard (no stdout).")


@app.command(name="list")
def list_cmd():
    names = list_secrets()
    if not names:
        typer.echo("📂 No secrets stored")
        return
    typer.echo("📂 Stored secrets:")
    for i, n in enumerate(names, 1):
        typer.echo(f"  {i}. {n}")


@app.command()
def delete(
    ctx: typer.Context,
    name: str = typer.Argument(..., help="Secret name"),
):
    if delete_secret(name):
        verbose = bool(ctx.obj.get("verbose", False))
        if verbose:
            typer.echo(f"✅ Secret '{name}' deleted successfully")
        else:
            typer.echo("✅ Secret deleted successfully")
    else:
        typer.echo(f"❌ Secret '{name}' not found")


def copy_to_clipboard_with_autoclear(text: str, seconds: int = 30) -> None:
    try:
        import pyperclip
    except ImportError:
        typer.echo("ℹ️ pyperclip not installed - install with: pip install pyperclip")
        return
    try:
        # Copy to clipboard quickly to minimize time the secret lives in our process
        pyperclip.copy(text)
        typer.echo(f"📋 Copied to clipboard. Will auto-clear in {seconds}s.")
    except Exception as e:
        typer.echo(f"❌ Failed to copy to clipboard: {e}")
        return

    def _clear_later():
        try:
            time.sleep(seconds)
            pyperclip.copy("")
            typer.echo("🧹 Clipboard cleared")
        except Exception:
            pass

    t = threading.Thread(target=_clear_later, daemon=True)
    t.start()
    # Reduce in-memory exposure by dropping local reference
    text = ""


def main():
    app()


def interactive() -> None:
    """Interactive TUI-style menu for local runs (no CLI args)."""
    init_db()
    while True:
        print("\n" + "="*50)
        print("🔐 VaultBuddy - Secure Secrets Manager")
        print("="*50)
        print("1. Add secret")
        print("2. Retrieve secret (no stdout)")
        print("3. List secrets")
        print("4. Delete secret")
        print("5. Exit")
        print("-"*50)

        choice = input("Select an option (1-5): ").strip()

        if choice == '1':
            name = input("Enter secret name: ").strip()
            ok, err = validate_secret_name(name)
            if not ok:
                print(f"❌ {err}")
                continue
            existing = get_secret(name)
            if existing is not None:
                if input("Secret exists. Overwrite? (y/N): ").strip().lower() != 'y':
                    print("❌ Secret not added")
                    continue
            value = getpass.getpass("Enter secret value: ")
            if not value:
                print("❌ Secret value cannot be empty")
                continue
            try:
                store_secret(name, value)
                # Reduce lifetime of secret value in memory
                value = ""
                print("✅ Secret stored successfully")
            except Exception as e:
                print(f"❌ Error storing secret: {e}")
        elif choice == '2':
            name = input("Enter secret name: ").strip()
            if not name:
                print("❌ Secret name cannot be empty")
                continue
            value = get_secret(name)
            if value is None:
                print(f"❌ Secret '{name}' not found")
                continue
            if input("Copy to clipboard (auto-clears in 30s)? (y/N): ").strip().lower() == 'y':
                copy_to_clipboard_with_autoclear(value, 30)
            else:
                print("ℹ️ Retrieval succeeded. Not printing secrets to stdout.")
        elif choice == '3':
            names = list_secrets()
            if not names:
                print("📂 No secrets stored")
            else:
                print("📂 Stored secrets:")
                for i, n in enumerate(names, 1):
                    print(f"  {i}. {n}")
        elif choice == '4':
            name = input("Enter secret name to delete: ").strip()
            if not name:
                print("❌ Secret name cannot be empty")
                continue
            if input(f"Are you sure you want to delete '{name}'? (y/N): ").strip().lower() != 'y':
                print("❌ Deletion cancelled")
                continue
            if delete_secret(name):
                print("✅ Secret deleted successfully")
            else:
                print(f"❌ Secret '{name}' not found")
        elif choice == '5':
            print("\n🔒 Exiting VaultBuddy. Your secrets are safe!")
            print("Goodbye! 👋")
            break
        else:
            print("❌ Invalid option. Please enter 1-5.")



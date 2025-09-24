import time
import sys
from typing import Dict

import pytest

from vaultbuddy.storage import is_secure_backend, init_db, store_secret, get_secret, delete_secret
from vaultbuddy import cli


class DummyKeyring:
    """A minimal in-memory keyring backend for tests."""

    __module__ = "keyring.backends.SecretService"
    __name__ = "Dummy"

    def __init__(self):
        self._data: Dict[tuple[str, str], str] = {}

    def get_password(self, service_name: str, username: str):
        return self._data.get((service_name, username))

    def set_password(self, service_name: str, username: str, password: str):
        self._data[(service_name, username)] = password

    def delete_password(self, service_name: str, username: str):
        key = (service_name, username)
        if key not in self._data:
            import keyring
            raise keyring.errors.PasswordDeleteError("not found")
        del self._data[key]


@pytest.fixture(autouse=True)
def patch_keyring(monkeypatch):
    import keyring

    dummy = DummyKeyring()

    def _get_keyring():
        return dummy

    monkeypatch.setattr(keyring, "get_keyring", _get_keyring)
    monkeypatch.setattr(keyring, "get_password", dummy.get_password)
    monkeypatch.setattr(keyring, "set_password", dummy.set_password)
    monkeypatch.setattr(keyring, "delete_password", dummy.delete_password)
    # Ensure fresh index
    init_db(allow_insecure_backend=True)
    yield


def run_cli(runner, args: list[str]):
    result = runner.invoke(cli.app, args)
    assert result.exception is None, result.output
    return result


def test_backend_detection_secure():
    secure, ident, reason = is_secure_backend()
    assert secure is True
    assert "SecretService" in ident


def test_quiet_mode_add_delete(capsys):
    # Quiet by default: no name echoed
    from click.testing import CliRunner

    runner = CliRunner()
    # Add
    result = runner.invoke(cli.app, ["add", "example"], input="supersecret\n")
    assert result.exit_code == 0
    assert "stored successfully" in result.output
    assert "example" not in result.output

    # Delete
    result = runner.invoke(cli.app, ["delete", "example"]) 
    assert result.exit_code == 0
    assert "deleted successfully" in result.output
    assert "example" not in result.output


def test_verbose_mode_shows_name():
    from click.testing import CliRunner

    runner = CliRunner()
    result = runner.invoke(cli.app, ["--verbose", "add", "ex"], input="s\n")
    assert result.exit_code == 0
    assert "ex" in result.output


def test_backend_detection_insecure(monkeypatch):
    # Force an insecure identity
    class InsecureDummy(DummyKeyring):
        __module__ = "keyrings.alt.file"

    insecure = InsecureDummy()

    import keyring

    def _get_keyring():
        return insecure

    monkeypatch.setattr(keyring, "get_keyring", _get_keyring)
    monkeypatch.setattr(keyring, "get_password", insecure.get_password)
    monkeypatch.setattr(keyring, "set_password", insecure.set_password)
    monkeypatch.setattr(keyring, "delete_password", insecure.delete_password)

    ok, ident, reason = is_secure_backend()
    assert ok is False
    assert "keyrings.alt" in ident or "Unknown" in ident

    with pytest.raises(RuntimeError):
        init_db(allow_insecure_backend=False)


def test_case_insensitive_retrieve_and_delete():
    # Store with mixed case
    store_secret("Steam Login", "pw")
    # Retrieve case-insensitively
    assert get_secret("steam login") == "pw"
    assert get_secret("STEAM LOGIN") == "pw"
    # Delete case-insensitively
    assert delete_secret("steam login") is True
    assert get_secret("Steam Login") is None


def test_clipboard_autoclear(monkeypatch):
    # Simulate pyperclip
    clipboard = {"value": None}

    class FakePyperclip:
        @staticmethod
        def copy(v):
            clipboard["value"] = v

    monkeypatch.setitem(sys.modules, "pyperclip", FakePyperclip)

    # Copy
    cli.copy_to_clipboard_with_autoclear("secret", seconds=1)
    assert clipboard["value"] == "secret"
    time.sleep(1.3)
    assert clipboard["value"] == ""



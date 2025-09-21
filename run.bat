@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

where python >NUL 2>&1
if errorlevel 1 (
  echo Python is not installed or not in PATH.
  pause
  exit /b 1
)

set "VENV_DIR=.venv"
set "PYEXE=%VENV_DIR%\Scripts\python.exe"

if not exist "%PYEXE%" (
  echo Creating virtual environment...
  python -m venv "%VENV_DIR%"
  echo Upgrading pip...
  "%PYEXE%" -m pip install --upgrade pip --disable-pip-version-check
  echo Installing requirements...
  "%PYEXE%" -m pip install -r requirements.txt --disable-pip-version-check --no-input
) else (
  REM Quietly ensure required packages are present; install only if missing
  "%PYEXE%" -c "import importlib,sys; req=['keyring','typer','pyperclip']; missing=[r for r in req if importlib.util.find_spec(r) is None]; sys.exit(1 if missing else 0)" >NUL 2>&1
  if errorlevel 1 (
    "%PYEXE%" -m pip install -r requirements.txt --disable-pip-version-check --no-input -q >NUL 2>&1
  )
)

echo Launching VaultBuddy...
"%PYEXE%" src\main.py

echo.
echo Press any key to exit...
pause >NUL
endlocal
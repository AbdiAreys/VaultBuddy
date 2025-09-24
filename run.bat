@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM VaultBuddy launcher (Windows)
REM - Supports Python 3.10+
REM - Creates .venv if missing
REM - Installs runtime deps if needed

set "PY_CMD="
where py >NUL 2>&1 && set "PY_CMD=py -3"
if "%PY_CMD%"=="" (
  where python >NUL 2>&1 && set "PY_CMD=python"
)
if "%PY_CMD%"=="" (
  echo Python 3.10+ is required. Install from https://www.python.org/downloads/
  pause
  exit /b 1
)

%PY_CMD% -c "import sys; raise SystemExit(0 if sys.version_info>=(3,10) else 1)" >NUL 2>&1
if errorlevel 1 (
  where py >NUL 2>&1 && set "PY_CMD=py -3.10"
  %PY_CMD% -c "import sys; raise SystemExit(0 if sys.version_info>=(3,10) else 1)" >NUL 2>&1
  if errorlevel 1 (
    echo Detected Python older than 3.10. Please install Python 3.10+.
    pause
    exit /b 1
  )
)

set "VENV_DIR=.venv"
set "PYEXE=%VENV_DIR%\Scripts\python.exe"

if not exist "%PYEXE%" (
  echo Creating virtual environment...
  %PY_CMD% -m venv "%VENV_DIR%"
  if errorlevel 1 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

REM Ensure runtime deps (silent)
"%PYEXE%" -c "import importlib,sys; req=['keyring','typer','pyperclip']; missing=[r for r in req if importlib.util.find_spec(r) is None]; sys.exit(1 if missing else 0)" >NUL 2>&1
if errorlevel 1 (
  "%PYEXE%" -m pip install -q --disable-pip-version-check keyring==24.3.1 pyperclip==1.8.2 typer==0.12.3 >NUL 2>&1
)

echo Launching VaultBuddy...
"%PYEXE%" src\main.py

echo.
echo Press any key to exit...
pause >NUL
endlocal


REM VaultBuddy - Windows launcher
REM Checks Python availability and runs the CLI from the repo root.
@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

python -V >NUL 2>&1
if errorlevel 1 (
  echo Python is not installed or not in PATH.
  pause
  exit /b 1
)

python src\main.py

echo.
echo Press any key to exit...
pause >NUL
endlocal



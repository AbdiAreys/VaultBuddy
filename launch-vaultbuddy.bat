@echo off
title VaultBuddy Launcher
echo.
echo ========================================
echo    VaultBuddy Desktop App Launcher
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Python is not installed or not in PATH
    echo The desktop app needs Python to access your secrets
    echo.
    pause
)

REM Navigate to frontend directory
cd /d "%~dp0frontend"

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies for first-time setup...
    echo This may take a few minutes...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Starting VaultBuddy Desktop App...
echo.
echo The app will open in a new window.
echo Close this window or press Ctrl+C to stop the app.
echo.

REM Launch the Electron app
npm run electron-dev

echo.
echo VaultBuddy has been closed.
pause

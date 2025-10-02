@echo off
echo Starting VaultBuddy Frontend Development Environment...
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

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    echo Please ensure Node.js is properly installed
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Python is not installed or not in PATH
    echo The Electron app will not be able to communicate with the VaultBuddy backend
    echo You can still run the React app in web mode for UI development
    echo.
)

echo Starting development environment...
echo This will start both React development server and Electron
echo.
echo Press Ctrl+C to stop the development server
echo.

npm run electron-dev

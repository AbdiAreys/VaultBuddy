@echo off
echo ========================================
echo VaultBuddy Frontend - Cybersecurity UI
echo ========================================
echo.

echo [1/4] Cleaning previous installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
echo.

echo [2/4] Clearing npm cache...
call npm cache clean --force
echo.

echo [3/4] Installing dependencies...
echo This may take a few minutes...
call npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo Trying alternative installation method...
    call npm install --force --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo CRITICAL ERROR: Cannot install dependencies
        echo Please check your Node.js and npm installation
        pause
        exit /b 1
    )
)
echo.

echo [4/4] Starting development server...
echo.
echo SUCCESS! VaultBuddy Frontend is starting...
echo The app will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

echo Setting Node.js legacy OpenSSL provider for compatibility...
set NODE_OPTIONS=--openssl-legacy-provider
call npm start

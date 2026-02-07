@echo off
echo ========================================
echo VaultBuddy Frontend - Troubleshooting
echo ========================================
echo.

echo This script will try multiple installation methods
echo to fix dependency issues...
echo.

echo [1/5] Checking Node.js version...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo [2/5] Checking npm version...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found!
    echo Please reinstall Node.js
    pause
    exit /b 1
)
echo.

echo [3/5] Cleaning everything...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm cache clean --force
echo.

echo [4/5] Trying installation method 1...
echo Installing with legacy peer deps...
call npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo Method 1 failed. Trying method 2...
    echo Installing with force flag...
    call npm install --force --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo Method 2 failed. Trying method 3...
        echo Installing with exact versions...
        call npm install --legacy-peer-deps --exact
        if errorlevel 1 (
            echo.
            echo Method 3 failed. Trying method 4...
            echo Installing with yarn (if available)...
            yarn --version >nul 2>&1
            if errorlevel 1 (
                echo Yarn not available. Trying method 5...
                echo Installing with npm ci...
                call npm install --legacy-peer-deps --no-package-lock
                if errorlevel 1 (
                    echo.
                    echo ALL METHODS FAILED!
                    echo.
                    echo Please try:
                    echo 1. Update Node.js to latest LTS version
                    echo 2. Update npm: npm install -g npm@latest
                    echo 3. Clear npm cache: npm cache clean --force
                    echo 4. Try installing Yarn: npm install -g yarn
                    echo 5. Then run: yarn install
                    echo.
                    pause
                    exit /b 1
                )
            ) else (
                echo Using Yarn...
                call yarn install
            )
        )
    )
)
echo.

echo [5/5] Testing installation...
call npm start
if errorlevel 1 (
    echo.
    echo Installation completed but server failed to start.
    echo Check the error messages above.
    pause
) else (
    echo.
    echo SUCCESS! VaultBuddy Frontend is running!
    echo Open http://localhost:3000 in your browser
)


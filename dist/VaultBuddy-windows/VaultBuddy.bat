@echo off
title VaultBuddy
echo ================================================
echo    VAULTBUDDY - Secure Credential Manager
echo ================================================
echo.

:: Start backend server
echo [*] Starting backend server...
cd /d "%~dp0backend"
start /B vaultbuddy.exe serve

:: Wait for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend
echo [*] Starting frontend...
cd /d "%~dp0frontend"

:: Check if Python is available for serving
where python >nul 2>&1
if %errorlevel%==0 (
    echo [*] Opening browser...
    start http://localhost:3000
    python -m http.server 3000
) else (
    echo [!] Python not found. Please install Python to serve the frontend.
    echo [*] Alternatively, open index.html in a browser manually.
    pause
)

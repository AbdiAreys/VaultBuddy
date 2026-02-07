# VaultBuddy Launcher
# ==========================================
#    VAULTBUDDY - Secure Credential Manager
# ==========================================

$Host.UI.RawUI.WindowTitle = "VaultBuddy"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   VAULTBUDDY - Secure Credential Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend server
Write-Host "[*] Starting backend server..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend\vaultbuddy.exe"
Start-Process -FilePath $backendPath -ArgumentList "serve" -WindowStyle Hidden

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start frontend
Write-Host "[*] Starting frontend server..." -ForegroundColor Green
$frontendPath = Join-Path $scriptDir "frontend"

# Open browser
Write-Host "[*] Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

# Serve frontend with Python
Set-Location $frontendPath
python -m http.server 3000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VaultBuddy Frontend - Cybersecurity UI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Cleaning previous installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json"
}
Write-Host ""

Write-Host "[2/4] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host ""

Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install --legacy-peer-deps --no-audit --no-fund

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Installation failed!" -ForegroundColor Red
    Write-Host "Trying alternative installation method..." -ForegroundColor Yellow
    npm install --force --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "CRITICAL ERROR: Cannot install dependencies" -ForegroundColor Red
        Write-Host "Please check your Node.js and npm installation" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

Write-Host "[4/4] Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "SUCCESS! VaultBuddy Frontend is starting..." -ForegroundColor Green
Write-Host "The app will open at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
npm start

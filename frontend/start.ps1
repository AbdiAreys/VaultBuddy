Write-Host "Starting VaultBuddy Frontend..." -ForegroundColor Green
Write-Host ""

Write-Host "Cleaning previous installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}
Write-Host ""

Write-Host "Installing dependencies with legacy peer deps..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    npm start
} else {
    Write-Host "Installation failed. Please check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}

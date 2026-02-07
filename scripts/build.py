"""
VaultBuddy Build Script
Creates distributable packages for Windows
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
BUILD_DIR = PROJECT_ROOT / "build"
DIST_DIR = PROJECT_ROOT / "dist"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
SRC_DIR = PROJECT_ROOT / "src"

def clean():
    """Clean previous build artifacts"""
    print("🧹 Cleaning previous builds...")
    for dir_path in [BUILD_DIR, DIST_DIR]:
        if dir_path.exists():
            shutil.rmtree(dir_path)
    print("✅ Clean complete")

def install_build_deps():
    """Install build dependencies"""
    print("📦 Installing build dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller", "-q"], check=True)
    print("✅ Build dependencies installed")

def build_python_backend():
    """Build Python backend with PyInstaller"""
    print("🐍 Building Python backend...")
    
    # Create spec content for PyInstaller
    spec_content = '''# -*- mode: python ; coding: utf-8 -*-
import sys
from pathlib import Path

block_cipher = None

a = Analysis(
    ['../src/vaultbuddy/cli.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['keyring.backends.Windows', 'keyring.backends.macOS', 'keyring.backends.SecretService'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='vaultbuddy',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
'''
    
    BUILD_DIR.mkdir(exist_ok=True)
    spec_file = BUILD_DIR / "vaultbuddy.spec"
    spec_file.write_text(spec_content)
    
    subprocess.run([
        sys.executable, "-m", "PyInstaller",
        "--distpath", str(DIST_DIR / "backend"),
        "--workpath", str(BUILD_DIR / "pyinstaller"),
        str(spec_file)
    ], check=True)
    
    print("✅ Python backend built")

def build_frontend():
    """Build React frontend"""
    print("⚛️ Building React frontend...")
    
    # Install npm dependencies if needed
    if not (FRONTEND_DIR / "node_modules").exists():
        print("   Installing npm dependencies...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, shell=True, check=True)
    
    # Build frontend
    subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR, shell=True, check=True)
    
    # Copy build to dist
    frontend_build = FRONTEND_DIR / "build"
    frontend_dist = DIST_DIR / "frontend"
    if frontend_dist.exists():
        shutil.rmtree(frontend_dist)
    shutil.copytree(frontend_build, frontend_dist)
    
    print("✅ Frontend built")

def create_launcher():
    """Create launcher scripts"""
    print("🚀 Creating launcher scripts...")
    
    # Windows batch launcher
    launcher_bat = '''@echo off
title VaultBuddy
cd /d "%~dp0"

echo Starting VaultBuddy...
echo.

REM Start the backend server
start /B backend\\vaultbuddy.exe serve

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Open frontend in default browser
start "" "frontend\\index.html"

echo VaultBuddy is running!
echo Press any key to stop...
pause >nul

REM Kill the backend
taskkill /F /IM vaultbuddy.exe >nul 2>&1
'''
    
    (DIST_DIR / "VaultBuddy.bat").write_text(launcher_bat)
    
    # PowerShell launcher
    launcher_ps1 = '''# VaultBuddy Launcher
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Starting VaultBuddy..." -ForegroundColor Cyan

# Start backend
$backend = Start-Process -FilePath ".\\backend\\vaultbuddy.exe" -ArgumentList "serve" -PassThru -WindowStyle Hidden

# Wait for backend
Start-Sleep -Seconds 2

# Open frontend
Start-Process ".\\frontend\\index.html"

Write-Host "VaultBuddy is running! Press Enter to stop..." -ForegroundColor Green
Read-Host

# Stop backend
Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
'''
    
    (DIST_DIR / "VaultBuddy.ps1").write_text(launcher_ps1)
    
    print("✅ Launcher scripts created")

def create_readme():
    """Create installation readme"""
    readme = '''# VaultBuddy - Installation

## Quick Start

### Windows
1. Extract the ZIP file to a location of your choice
2. Double-click `VaultBuddy.bat` to start the application
3. Your default browser will open with VaultBuddy

### Requirements
- Windows 10 or later
- A modern web browser (Chrome, Firefox, Edge)

## CLI Usage

You can also use VaultBuddy from the command line:

```bash
# Store a secret
backend\\vaultbuddy.exe store my_api_key

# Retrieve a secret
backend\\vaultbuddy.exe get my_api_key

# Copy secret to clipboard
backend\\vaultbuddy.exe copy my_api_key

# List all secrets
backend\\vaultbuddy.exe list

# Delete a secret
backend\\vaultbuddy.exe delete my_api_key
```

## Security

VaultBuddy uses your operating system's secure keyring to store secrets:
- Windows: Windows Credential Manager
- macOS: Keychain
- Linux: Secret Service (GNOME Keyring / KDE Wallet)

Your secrets never leave your machine and are encrypted by the OS.

## Troubleshooting

If the app doesn't start:
1. Make sure no antivirus is blocking the executable
2. Try running as Administrator
3. Check that port 8000 is not in use

## Uninstall

Simply delete the VaultBuddy folder. Your secrets remain in the OS keyring.
To remove secrets, use: `backend\\vaultbuddy.exe delete <secret_name>`

---
VaultBuddy v1.0.0
'''
    (DIST_DIR / "README.txt").write_text(readme)
    print("✅ README created")

def create_zip():
    """Create distributable ZIP"""
    print("📦 Creating ZIP archive...")
    
    zip_name = "VaultBuddy-v1.0.0-windows"
    shutil.make_archive(
        str(PROJECT_ROOT / zip_name),
        'zip',
        DIST_DIR
    )
    
    print(f"✅ Created {zip_name}.zip")
    return f"{zip_name}.zip"

def main():
    """Main build process"""
    print("=" * 50)
    print("VaultBuddy Build Script")
    print("=" * 50)
    print()
    
    try:
        clean()
        install_build_deps()
        build_python_backend()
        build_frontend()
        create_launcher()
        create_readme()
        zip_file = create_zip()
        
        print()
        print("=" * 50)
        print("✅ BUILD COMPLETE!")
        print("=" * 50)
        print(f"Output: {zip_file}")
        print()
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

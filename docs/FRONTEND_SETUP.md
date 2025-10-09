# VaultBuddy Frontend Setup Guide

Desktop app setup and development guide.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **Windows password set** (for safeStorage/DPAPI to work)
3. **Administrator privileges** (for building installers)

### Installation Steps

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Choose the LTS version
   - Run the installer and follow the prompts
   - Verify installation: Open Command Prompt and run `node --version`

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
   This will download all required React and Electron packages (~750 MB).

4. **Start the app in development mode**:
   ```bash
   npm run electron
   # Or: npm run electron-dev (with hot-reload)
   ```

## 🖥️ Building for Production

### Create Windows Installer

1. **Close all running VaultBuddy instances** (to unlock DLL files)

2. **Build the installer** (run as Administrator):
   ```bash
   cd frontend
   npm run electron-pack
   ```

3. **Output files** (in `frontend/dist/`):
   - **`VaultBuddy Setup 0.1.0.exe`** (91.63 MB) ← This is what you distribute
   - `VaultBuddy Setup 0.1.0.exe.blockmap` (for delta updates)
   - `win-unpacked/` folder (for testing, not distributed)

### Distribution

To release VaultBuddy:
1. Upload **only** `VaultBuddy Setup 0.1.0.exe` to GitHub Releases
2. Users download and run the installer
3. App installs to: `C:\Users\[username]\AppData\Local\Programs\VaultBuddy\`
4. User data stored in: `C:\Users\[username]\AppData\Roaming\VaultBuddy\vault.dat`

## 🔧 Features

- Modern UI with cyber theme and smooth startup (no flicker)
- OS-native encryption via Electron safeStorage (DPAPI/Keychain/libsecret)
- Clipboard auto-clear (30s)
- Rate limiting (10 req/min) with exponential backoff
- Persistent audit logging to disk
- Hardened CSP in production
- Loading skeleton for instant visual feedback
- Optimized rendering (removed expensive CSS filters)

## 🔍 Troubleshooting

### safeStorage initialization fails
- **Windows**: Ensure user account has a password set (DPAPI requirement)
- **macOS**: Check Keychain Access is working
- **Linux**: Install `libsecret` package (`apt install libsecret-1-0` or equivalent)

### Build fails with "Access is denied" on DLL files
- Close all running VaultBuddy instances
- Run PowerShell as Administrator
- Clear electron-builder cache: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"`
- Try build again: `cd frontend; npm run electron-pack`

### Startup flicker or black/white screen
- Fixed in v0.1.0+ with optimized rendering and loading skeleton
- If persists, check DevTools console for CSP errors
- Verify `backgroundThrottling: false` is set in `electron.js`

### App won't start
- Check DevTools console for errors (press F12)
- Verify `npm install` completed successfully
- Check `vault-service.js` loaded correctly (logs in console)

### Installer won't run
- Run as Administrator
- Check Windows Defender/antivirus isn't blocking
- Download fresh copy if corrupted

## 📁 Structure

```
frontend/
├── public/
│   ├── electron.js          # Main process
│   └── preload.js           # IPC bridge
├── services/
│   └── vault-service.js     # safeStorage backend
├── src/
│   ├── components/          # React UI
│   └── App.js               # Main component
└── package.json
```

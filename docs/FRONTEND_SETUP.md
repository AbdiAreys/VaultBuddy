# VaultBuddy Frontend Setup Guide

Desktop app setup and development guide.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **Windows password set** (for safeStorage/DPAPI to work)

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
   This will download all required React and Electron packages.

4. **Start the app**:
   ```bash
   npm run electron
   # Or: npm run electron-dev (with hot-reload)
   ```

## 🖥️ Building

Build installer:
```bash
npm run electron-pack
```

Output: `dist/VaultBuddy Setup 0.1.0.exe` and `dist/win-unpacked/VaultBuddy.exe`

## 🔧 Features

- Modern UI with cyber theme
- OS-native encryption via Electron safeStorage (DPAPI/Keychain/libsecret)
- Clipboard auto-clear (30s)
- Rate limiting (10 req/min) with exponential backoff
- Persistent audit logging
- Hardened CSP in production

## 🔍 Troubleshooting

**safeStorage initialization fails:**
- Ensure Windows user account has a password set
- macOS: Check Keychain Access is working
- Linux: Install `libsecret` package

**Build fails:**
- Delete `node_modules` and run `npm install` again
- Run as administrator on Windows

**App won't start:**
- Check DevTools console for errors
- Verify `npm install` completed successfully

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

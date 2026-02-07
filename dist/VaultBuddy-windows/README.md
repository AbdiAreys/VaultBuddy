# VaultBuddy - Secure Credential Manager

## Quick Start

### Windows
1. Double-click `VaultBuddy.bat` to start the application
2. Or run `VaultBuddy.ps1` in PowerShell

### Requirements
- Python 3.8+ (for serving the frontend)

## What's Included

```
VaultBuddy-windows/
├── backend/
│   └── vaultbuddy.exe     # Backend server
├── frontend/              # Web interface files
├── VaultBuddy.bat         # Windows launcher
├── VaultBuddy.ps1         # PowerShell launcher
└── README.md              # This file
```

## Manual Start

If the launcher doesn't work:

1. **Start the backend:**
   ```
   cd backend
   vaultbuddy.exe serve
   ```

2. **Serve the frontend (in a new terminal):**
   ```
   cd frontend
   python -m http.server 3000
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Features

- Secure credential storage using OS keyring
- AES-256-GCM encryption
- Modern Matrix-style UI
- Cross-platform support

## Troubleshooting

- **Backend won't start:** Ensure no other application is using port 8000
- **Frontend won't load:** Ensure Python is installed and in PATH
- **Browser shows blank page:** Wait a few seconds for servers to initialize

## License

MIT License

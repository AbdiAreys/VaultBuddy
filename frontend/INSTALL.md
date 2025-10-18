# VaultBuddy Frontend Installation Guide

## Quick Start

### Option 1: Windows Batch File (Recommended)
```bash
start.bat
```

### Option 2: PowerShell Script
```powershell
.\start.ps1
```

### Option 3: Manual Installation
```bash
# Clean previous installation
rmdir /s /q node_modules
del package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps

# Start development server
npm start
```

## Troubleshooting

### TypeScript Version Conflict
If you encounter a TypeScript version conflict error, this is because:
- react-scripts@5.0.1 expects TypeScript 4.x
- The package.json has been updated to use TypeScript 4.9.5
- Use `--legacy-peer-deps` flag to resolve peer dependency conflicts

### Alternative: Use Yarn
If npm continues to have issues, try using Yarn:
```bash
# Install Yarn globally (if not already installed)
npm install -g yarn

# Install dependencies
yarn install

# Start development server
yarn start
```

### Alternative: Use Create React App
If you prefer a fresh start:
```bash
# Create new React app
npx create-react-app vaultbuddy-frontend --template typescript

# Copy our source files to the new project
# Then install additional dependencies
npm install
```

## What's Fixed

1. **TypeScript Version**: Downgraded from 5.x to 4.9.5 for compatibility
2. **Node Types**: Updated to match TypeScript version
3. **Legacy Peer Deps**: Added flag to handle dependency conflicts
4. **Clean Installation**: Scripts now clean previous installations

## Development Server

Once installed successfully, the frontend will be available at:
- **URL**: http://localhost:3000
- **Features**: Hot reload, TypeScript compilation, CSS processing

## Backend Integration

The frontend is designed to work with the Python backend. Currently uses localStorage for demo purposes, but can be easily connected to the actual Python CLI.

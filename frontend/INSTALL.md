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

### Option 3: Troubleshooting Script (If others fail)
```bash
install-fix.bat
```

## Installation Methods

### Method 1: Standard Installation
```bash
# Clean previous installation
rmdir /s /q node_modules
del package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps

# Start development server
npm start
```

### Method 2: Force Installation
```bash
# If standard installation fails
npm install --force --legacy-peer-deps
npm start
```

### Method 3: Using Yarn (Alternative)
```bash
# Install Yarn globally
npm install -g yarn

# Install dependencies
yarn install

# Start development server
yarn start
```

## Troubleshooting

### Common Issues and Solutions

#### 1. TypeScript Version Conflict
**Error**: `Could not resolve dependency: peerOptional typescript@"^3.2.1 || ^4"`
**Solution**: The package.json uses TypeScript 4.9.5 which is compatible with react-scripts 4.0.3

#### 2. AJV Module Resolution Error
**Error**: `Cannot find module 'ajv/dist/compile/codegen'`
**Solution**: Use the troubleshooting script: `install-fix.bat`

#### 3. Node.js Version Issues
**Error**: Various dependency resolution errors
**Solution**: 
- Update Node.js to LTS version (16.x or 18.x)
- Update npm: `npm install -g npm@latest`
- Clear cache: `npm cache clean --force`

#### 4. Permission Errors
**Error**: EACCES or permission denied
**Solution**:
- Run as Administrator
- Or use: `npm install --legacy-peer-deps --no-optional`

### Advanced Troubleshooting

#### If All Methods Fail:
1. **Check Node.js Version**:
   ```bash
   node --version  # Should be 16.x or 18.x
   npm --version   # Should be 8.x or 9.x
   ```

2. **Use Stable Package Configuration**:
   ```bash
   # Backup current package.json
   copy package.json package.json.backup
   
   # Use stable configuration
   copy package-stable.json package.json
   
   # Install
   npm install --legacy-peer-deps
   ```

3. **Clean Everything**:
   ```bash
   # Remove all node files
   rmdir /s /q node_modules
   del package-lock.json
   del yarn.lock
   
   # Clear all caches
   npm cache clean --force
   yarn cache clean
   
   # Reinstall
   npm install --legacy-peer-deps
   ```

## What's Fixed

1. **React Scripts**: Downgraded to 4.0.3 (more stable)
2. **TypeScript**: Version 4.9.5 (compatible with react-scripts)
3. **Web Vitals**: Downgraded to 2.1.4 (more stable)
4. **Error Handling**: Multiple fallback installation methods
5. **Cache Clearing**: Automatic npm cache cleanup
6. **Progress Indicators**: Clear step-by-step feedback

## Development Server

Once installed successfully, the frontend will be available at:
- **URL**: http://localhost:3000
- **Features**: Hot reload, TypeScript compilation, CSS processing
- **Auto-open**: Browser should open automatically

## Backend Integration

The frontend is designed to work with the Python backend. Currently uses localStorage for demo purposes, but can be easily connected to the actual Python CLI.

## File Structure

```
frontend/
├── start.bat          # Main installer (Windows)
├── start.ps1          # PowerShell installer
├── install-fix.bat    # Troubleshooting installer
├── package.json       # Main dependencies
├── package-stable.json # Fallback stable config
└── src/               # React source code
```

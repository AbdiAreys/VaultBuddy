# VaultBuddy Frontend Setup Guide

This guide will help you set up and run the VaultBuddy React/Electron frontend.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **Python** (v3.10 or higher) - Should already be installed for VaultBuddy backend
3. **Git** (optional) - For version control

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

4. **Start the development environment**:
   
   **Option A: Full Electron App (Recommended)**
   ```bash
   npm run electron-dev
   ```
   Or double-click `start-dev.bat` on Windows
   
   **Option B: Web Version Only (for UI development)**
   ```bash
   npm start
   ```
   Or double-click `start-web.bat` on Windows

## 🖥️ Running the Application

### Development Mode

**Full Electron Application:**
- Run: `npm run electron-dev` or `start-dev.bat`
- This starts both React dev server and Electron
- Includes hot-reload for development
- Full integration with Python backend
- Opens DevTools for debugging

**Web-only Mode:**
- Run: `npm start` or `start-web.bat`
- Opens in your web browser
- Uses mock data (no real secrets)
- Good for UI development and testing

### Production Build

To build the application for distribution:

```bash
# Build React app and package Electron
npm run electron-pack
```

The packaged application will be in the `dist` folder.

## 🔧 Features

### User Interface
- **Modern Design**: Clean, responsive interface with smooth animations
- **Dark Theme**: Beautiful gradient background with glassmorphism effects
- **Responsive**: Works on different screen sizes
- **Accessible**: Keyboard navigation and screen reader friendly

### Functionality
- **Secret Management**: Add, view, copy, and delete secrets
- **Search**: Quick search through your secret names
- **Clipboard Integration**: Secure copy-to-clipboard with auto-clear
- **Real-time Updates**: Live updates when secrets are modified
- **Error Handling**: User-friendly error messages and validation

### Security
- **No Secret Display**: Secrets are never shown in the UI, only copied to clipboard
- **Secure IPC**: Isolated communication between frontend and backend
- **Auto-clear**: Clipboard automatically clears after specified timeout
- **Input Validation**: All inputs are validated before processing

## 🔍 Troubleshooting

### Common Issues

**"Node.js is not recognized"**
- Install Node.js from https://nodejs.org/
- Restart your command prompt/terminal
- Verify with `node --version`

**"Python is not recognized"**
- Ensure Python is installed and in your PATH
- The frontend will show a warning but can still run in web mode

**"npm install fails"**
- Try deleting the `node_modules` folder and running `npm install` again
- Check your internet connection
- Try running as administrator (Windows)

**"Electron app won't start"**
- Make sure all dependencies are installed: `npm install`
- Check that Python backend is working: `python ../src/main.py`
- Try running web version first: `npm start`

**"Can't connect to Python backend"**
- Verify Python is in your PATH: `python --version`
- Test the backend directly: `python ../src/main.py --api-mode`
- Check Windows Defender or antivirus isn't blocking the connection

### Development Tips

1. **Use DevTools**: The Electron app opens with DevTools for debugging
2. **Check Console**: Look for JavaScript errors in the browser console
3. **Monitor Backend**: Watch the Python backend output for API errors
4. **Hot Reload**: Changes to React components will automatically reload
5. **Electron Restart**: Changes to Electron main process require restart

## 📁 Project Structure

```
frontend/
├── public/
│   ├── electron.js          # Electron main process
│   ├── preload.js           # Secure IPC bridge
│   ├── index.html           # HTML template
│   └── manifest.json        # Web app manifest
├── src/
│   ├── components/          # React components
│   │   ├── Header.js        # App header with actions
│   │   ├── SecretList.js    # Sidebar secret list
│   │   ├── AddSecretForm.js # Add secret form
│   │   ├── SecretDetails.js # Secret details view
│   │   └── StatusMessage.js # Toast notifications
│   ├── App.js               # Main React component
│   ├── App.css              # Main styles
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies and scripts
├── start-dev.bat           # Windows development startup script
├── start-web.bat           # Windows web-only startup script
└── README.md               # Detailed documentation
```

## 🚀 Next Steps

1. **Try the Application**: Start with `npm run electron-dev` or `start-dev.bat`
2. **Add Some Secrets**: Use the "Add Secret" button to create test secrets
3. **Explore Features**: Try searching, copying, and deleting secrets
4. **Customize**: Modify the CSS files to change the appearance
5. **Build for Production**: Use `npm run electron-pack` when ready to distribute

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Look at the browser/Electron console for errors
3. Verify the Python backend is working independently
4. Check that all prerequisites are properly installed
5. Try the web version first to isolate Electron-specific issues

The frontend is designed to be user-friendly and should work out of the box once Node.js is installed and dependencies are downloaded.

Happy secret managing! 🔐

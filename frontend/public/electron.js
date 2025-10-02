const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;
let pythonProcess = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add icon later
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start Python backend process
function startPythonBackend() {
  if (pythonProcess) return;

  try {
    // Try to find the Python executable and VaultBuddy
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const vaultbuddyPath = isDev 
      ? path.join(__dirname, '../../src/main.py')
      : path.join(process.resourcesPath, 'python/main.py');

    pythonProcess = spawn(pythonCmd, [vaultbuddyPath, '--api-mode'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      pythonProcess = null;
    });

  } catch (error) {
    console.error('Failed to start Python backend:', error);
  }
}

// Stop Python backend process
function stopPythonBackend() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  startPythonBackend();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopPythonBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPythonBackend();
});

// IPC handlers for communicating with Python backend via API
ipcMain.handle('vault-api-call', async (event, action, params = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const vaultbuddyPath = isDev 
        ? path.join(__dirname, '../../src/main.py')
        : path.join(process.resourcesPath, 'python/main.py');

      const child = spawn(pythonCmd, [vaultbuddyPath, '--api-mode'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let responseReceived = false;
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        // Try to parse JSON responses
        const lines = stdout.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const response = JSON.parse(line);
              if (!responseReceived) {
                responseReceived = true;
                
                // Send the command after API is ready
                if (response.success && response.data && response.data.message === "VaultBuddy API ready") {
                  const command = JSON.stringify({ action, params });
                  child.stdin.write(command + '\n');
                }
              } else {
                // This is the actual response to our command
                child.kill();
                resolve(response);
                return;
              }
            } catch (e) {
              // Not a JSON response, continue
            }
          }
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (!responseReceived) {
          resolve({ success: false, error: stderr || 'No response from Python backend' });
        }
      });

      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!responseReceived) {
          child.kill();
          resolve({ success: false, error: 'Timeout waiting for Python backend' });
        }
      }, 10000);

    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
});

// Handle secret input (for adding secrets)
ipcMain.handle('get-secret-input', async (event, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'none',
    title: 'Enter Secret',
    message: message || 'Enter secret value:',
    detail: 'This will be stored securely in your OS keyring.',
    buttons: ['OK', 'Cancel'],
    defaultId: 0,
    cancelId: 1
  });

  if (result.response === 0) {
    // In a real implementation, you'd want a secure input dialog
    // For now, we'll return a placeholder that the frontend can handle
    return { success: true, cancelled: false };
  } else {
    return { success: false, cancelled: true };
  }
});

// Handle clipboard operations
ipcMain.handle('copy-to-clipboard', async (event, text, timeout = 30) => {
  const { clipboard } = require('electron');
  
  try {
    clipboard.writeText(text);
    
    // Auto-clear after timeout
    setTimeout(() => {
      clipboard.clear();
    }, timeout * 1000);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');

/**
 * Sanitizes error messages to prevent information leakage
 */
function sanitizeErrorMessage(error) {
  let message = error.message || 'Unknown error';
  message = message.replace(/[A-Z]:\\[^\s"']+/g, '[path]');
  message = message.replace(/\/[^\s"']+/g, '[path]');
  if (message.length > 150) {
    message = message.substring(0, 150) + '...';
  }
  return message;
}

/**
 * Simple rate limiter to prevent IPC call abuse
 * Limits to 100 requests per action per minute
 */
const rateLimiter = new Map();
const RATE_LIMIT = 100; // max 100 requests per minute per action
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(action) {
  const now = Date.now();
  const timestamps = rateLimiter.get(action) || [];
  
  // Remove timestamps older than rate window
  const recentTimestamps = timestamps.filter(t => now - t < RATE_WINDOW);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= RATE_LIMIT) {
    return false;
  }
  
  // Add current timestamp and update
  recentTimestamps.push(now);
  rateLimiter.set(action, recentTimestamps);
  
  return true;
}

// Import native vault service (replaces Python backend)
let vaultService;
try {
  console.log('Loading vault service...');
  vaultService = require('../services/vault-service');
  console.log('Vault service loaded successfully');
} catch (error) {
  console.error('CRITICAL: Failed to load vault service:', error);
  console.error('Error stack:', error.stack);
  app.quit();
}

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

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

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' http://localhost:*"
        ]
      }
    });
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

// Initialize vault service
async function initializeVault() {
  try {
    const result = await vaultService.initialize();
    if (!result.success) {
      console.error('Failed to initialize vault service:', result.error);
      dialog.showErrorBox('Vault Initialization Failed', 
        result.error || 'Could not initialize the vault service.');
    }
  } catch (error) {
    console.error('Failed to initialize vault service:', error);
    dialog.showErrorBox('Vault Initialization Failed', 
      'An unexpected error occurred while initializing the vault service.');
  }
}

// App event handlers
app.whenReady().then(async () => {
  await initializeVault();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for vault operations using native service
ipcMain.handle('vault-api-call', async (event, action, params = {}) => {
  try {
    // Apply rate limiting
    if (!checkRateLimit(action)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please wait before trying again.' 
      };
    }

    let result;

    switch (action) {
      case 'list':
        result = await vaultService.listSecrets();
        break;

      case 'add':
        if (!params.name) {
          result = { success: false, error: "Missing 'name' parameter" };
        } else {
          result = await vaultService.addSecret(params.name, params.value);
        }
        break;

      case 'get':
        if (!params.name) {
          result = { success: false, error: "Missing 'name' parameter" };
        } else {
          result = await vaultService.getSecret(params.name);
        }
        break;

      case 'copy':
        if (!params.name) {
          result = { success: false, error: "Missing 'name' parameter" };
        } else {
          const getResult = await vaultService.getSecret(params.name);
          if (getResult.success) {
            result = { 
              success: true, 
              message: 'Secret retrieved successfully',
              has_value: true,
              value: getResult.value
            };
          } else {
            result = getResult;
          }
        }
        break;

      case 'delete':
        if (!params.name) {
          result = { success: false, error: "Missing 'name' parameter" };
        } else {
          result = await vaultService.deleteSecret(params.name);
        }
        break;

      case 'status':
        result = await vaultService.getStatus();
        break;

      case 'update':
        if (!params.name) {
          result = { success: false, error: "Missing 'name' parameter" };
        } else {
          result = await vaultService.updateSecret(params.name, params.value);
        }
        break;

      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }

    return result;
  } catch (error) {
    console.error('Vault API error:', error);
    return { success: false, error: sanitizeErrorMessage(error) };
  }
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

// Handle clipboard operations with auto-clear
ipcMain.handle('copy-to-clipboard', async (event, text, timeout = 30) => {
  try {
    clipboard.writeText(text);
    
    // Auto-clear after timeout
    setTimeout(() => {
      clipboard.clear();
    }, timeout * 1000);
    
    return { success: true, message: `Copied to clipboard. Will auto-clear in ${timeout}s.` };
  } catch (error) {
    console.error('Clipboard error:', error);
    return { success: false, error: sanitizeErrorMessage(error) };
  }
});

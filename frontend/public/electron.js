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
 * Enhanced rate limiter with exponential backoff to prevent IPC call abuse
 * Limits to 10 requests per action per minute, with backoff for repeated failures
 */
const rateLimiter = new Map();
const failureTracker = new Map();
const RATE_LIMIT = 10; // max 10 requests per minute per action (hardened from 100)
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(action) {
  const now = Date.now();
  const timestamps = rateLimiter.get(action) || [];
  
  // Remove timestamps older than rate window
  const recentTimestamps = timestamps.filter(t => now - t < RATE_WINDOW);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= RATE_LIMIT) {
    return { allowed: false, reason: 'Rate limit exceeded' };
  }
  
  // Check exponential backoff for failures
  const failures = failureTracker.get(action) || { count: 0, lastFail: 0 };
  if (failures.count > 5) {
    const backoffTime = Math.min(Math.pow(2, failures.count) * 1000, 300000); // Max 5min
    if (now - failures.lastFail < backoffTime) {
      const remainingTime = Math.ceil((backoffTime - (now - failures.lastFail)) / 1000);
      return { allowed: false, reason: `Too many failures. Retry in ${remainingTime}s` };
    }
  }
  
  // Add current timestamp and update
  recentTimestamps.push(now);
  rateLimiter.set(action, recentTimestamps);
  
  return { allowed: true };
}

function recordFailure(action) {
  const failures = failureTracker.get(action) || { count: 0, lastFail: 0 };
  failures.count += 1;
  failures.lastFail = Date.now();
  failureTracker.set(action, failures);
}

function resetFailures(action) {
  failureTracker.delete(action);
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
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add icon later
    show: false,
    frame: true,
    backgroundColor: '#667eea', // Match React gradient start color
    titleBarStyle: 'default'
  });

  // Set Content Security Policy (Hardened)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          (isDev 
            ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +  // Dev mode needs these for React HMR
              "style-src 'self' 'unsafe-inline'; " +
              "connect-src 'self' http://localhost:* ws://localhost:*; "
            : "script-src 'self'; " +  // Production: allow inline styles for React
              "style-src 'self' 'unsafe-inline'; " +  // Required for React inline styles during hydration
              "connect-src 'self'; "
          ) +
          "img-src 'self' data:; " +
          "font-src 'self' data:; " +
          "base-uri 'none'; " +
          "form-action 'none'; " +
          "frame-ancestors 'none';"
        ]
      }
    });
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Prevent flicker: wait for first paint before showing window
  mainWindow.webContents.once('did-finish-load', () => {
    // Use requestAnimationFrame to wait for actual paint
    mainWindow.webContents.executeJavaScript(`
      new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });
    `).then(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    }).catch(err => {
      console.error('Error waiting for paint:', err);
      // Fallback: show anyway
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });
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
app.whenReady().then(() => {
  // Create window immediately, initialize vault in parallel
  createWindow();
  initializeVault(); // Don't await - initialize in background

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
    // Apply enhanced rate limiting with backoff
    const rateLimitCheck = checkRateLimit(action);
    if (!rateLimitCheck.allowed) {
      recordFailure(action);
      return { 
        success: false, 
        error: rateLimitCheck.reason || 'Rate limit exceeded. Please wait before trying again.' 
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
          // Security Fix: Perform clipboard operation entirely in main process
          // Secret value NEVER crosses IPC boundary
          const getResult = await vaultService.getSecret(params.name);
          if (getResult.success && getResult.value) {
            const timeout = params.timeout || 30;
            clipboard.writeText(getResult.value);
            
            // Auto-clear after timeout
            setTimeout(() => {
              clipboard.clear();
            }, timeout * 1000);
            
            result = { 
              success: true, 
              message: `Secret copied to clipboard (auto-clears in ${timeout}s)`
            };
            // Note: value is NOT included in result - stays in main process only
          } else {
            result = { success: false, error: getResult.error || 'Failed to retrieve secret' };
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

    // Track success/failure for exponential backoff
    if (result.success) {
      resetFailures(action);
    } else {
      recordFailure(action);
    }

    return result;
  } catch (error) {
    console.error('Vault API error:', error);
    recordFailure(action);
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

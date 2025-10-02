const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Vault operations via API
  vaultApiCall: (action, params) => ipcRenderer.invoke('vault-api-call', action, params),
  
  // Secret input
  getSecretInput: (message) => ipcRenderer.invoke('get-secret-input', message),
  
  // Clipboard operations
  copyToClipboard: (text, timeout) => ipcRenderer.invoke('copy-to-clipboard', text, timeout),
  
  // App info
  platform: process.platform,
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

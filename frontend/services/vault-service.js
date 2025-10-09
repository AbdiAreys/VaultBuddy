/**
 * VaultBuddy Native Vault Service (safeStorage)
 * 
 * Provides secure secret management using Electron's safeStorage API
 * which leverages OS-native encryption (DPAPI/Keychain/libsecret).
 * 
 * Security: All operations are in-process, secrets never traverse IPC boundaries.
 * Storage: Encrypted vault file persisted to userData directory.
 */

const { safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

const VAULT_PATH = path.join(app.getPath('userData'), 'vault.dat');
const AUDIT_LOG_PATH = path.join(app.getPath('userData'), 'audit.log');

/**
 * Sanitizes error messages to prevent information leakage
 * Removes file paths and limits message length
 */
function sanitizeErrorMessage(error) {
    let message = error.message || 'Unknown error';
    
    // Remove Windows file paths (C:\...)
    message = message.replace(/[A-Z]:\\[^\s"']+/g, '[path]');
    
    // Remove Unix/Mac file paths (/...)
    message = message.replace(/\/[^\s"']+/g, '[path]');
    
    // Limit message length to prevent verbose error exposure
    if (message.length > 150) {
        message = message.substring(0, 150) + '...';
    }
    
    return message;
}

/**
 * Audit log for security-sensitive operations
 * Logs to both console and persistent file for forensics
 */
async function auditLog(action, secretName, success, details = '') {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `${timestamp} | ${action.toUpperCase().padEnd(10)} | ${secretName.padEnd(30)} | ${status}${details ? ' | ' + details : ''}`;
    
    console.log('[AUDIT]', logEntry);
    
    // Persist to file for forensic analysis
    try {
        await fs.appendFile(AUDIT_LOG_PATH, logEntry + '\n', { mode: 0o600 });
    } catch (err) {
        console.error('[AUDIT] Failed to write audit log:', sanitizeErrorMessage(err));
    }
}

/**
 * Validates secret names according to VaultBuddy security policy
 * Matches validation logic from crypto.py
 */
function validateSecretName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Secret name cannot be empty' };
    }
    
    const trimmed = name.trim();
    if (!trimmed) {
        return { valid: false, error: 'Secret name cannot be empty' };
    }
    
    if (trimmed.length > 100) {
        return { valid: false, error: 'Secret name must be less than 100 characters' };
    }
    
    // Check for whitespace control characters
    if (/[\n\r\t]/.test(trimmed)) {
        return { valid: false, error: 'Secret name cannot contain whitespace control characters' };
    }
    
    // Check for invalid characters (matching Python implementation)
    if (/["';\\/:*?<>|]/.test(trimmed)) {
        return { valid: false, error: 'Secret name contains invalid characters' };
    }
    
    return { valid: true, error: null };
}

/**
 * VaultService class - main interface for secret management
 * Uses Electron safeStorage for OS-native encryption
 */
class VaultService {
    constructor() {
        this.secrets = new Map();
        this.initialized = false;
    }

    /**
     * Load vault from encrypted file
     * @private
     */
    async _loadVault() {
        try {
            const encryptedData = await fs.readFile(VAULT_PATH);
            const decrypted = safeStorage.decryptString(encryptedData);
            const entries = JSON.parse(decrypted);
            this.secrets = new Map(entries);
            console.log(`Loaded ${this.secrets.size} secrets from vault`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Vault doesn't exist yet, start fresh
                console.log('No existing vault found, starting fresh');
                this.secrets = new Map();
            } else {
                console.error('Error loading vault:', error);
                throw new Error(`Failed to load vault: ${sanitizeErrorMessage(error)}`);
            }
        }
    }

    /**
     * Save vault to encrypted file
     * @private
     */
    async _saveVault() {
        try {
            const entries = Array.from(this.secrets.entries());
            const json = JSON.stringify(entries);
            const encrypted = safeStorage.encryptString(json);
            
            // Write with restricted permissions (owner read/write only)
            await fs.writeFile(VAULT_PATH, encrypted, { mode: 0o600 });
        } catch (error) {
            console.error('Error saving vault:', error);
            throw new Error(`Failed to save vault: ${sanitizeErrorMessage(error)}`);
        }
    }

    /**
     * Initialize the vault service
     * Checks for safeStorage availability and loads existing vault
     */
    async initialize() {
        if (this.initialized) {
            return { success: true };
        }

        try {
            console.log('Initializing vault service (safeStorage)...');
            
            // Check if safeStorage is available
            if (!safeStorage.isEncryptionAvailable()) {
                const error = 'OS encryption not available. Please ensure you are logged in with a local account.';
                console.error(error);
                return {
                    success: false,
                    error: error
                };
            }
            
            console.log('safeStorage encryption available');
            
            // Load existing vault
            await this._loadVault();
            
            this.initialized = true;
            console.log('Vault service initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('Vault initialization error:', error);
            return {
                success: false,
                error: `Failed to initialize vault: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * Add a new secret to the vault
     * @param {string} name - Secret name
     * @param {string} value - Secret value
     * @returns {Promise<Object>} Result object with success status
     */
    async addSecret(name, value) {
        try {
            // Validate secret name
            const validation = validateSecretName(name);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Validate value
            if (!value || typeof value !== 'string') {
                return { success: false, error: 'Secret value cannot be empty' };
            }

            // Check for null bytes that can cause issues
            if (value.includes('\0')) {
                return { success: false, error: 'Secret value cannot contain null bytes' };
            }

            // Enforce maximum length to prevent DoS and memory issues
            if (value.length > 10000) {
                return { success: false, error: 'Secret value too large (maximum 10,000 characters)' };
            }

            // Check if secret already exists
            if (this.secrets.has(name)) {
                return { success: false, error: `Secret '${name}' already exists` };
            }

            // Store the secret
            this.secrets.set(name, value);
            await this._saveVault();

            await auditLog('add', name, true);
            return {
                success: true,
                message: `Secret '${name}' stored successfully`
            };
        } catch (error) {
            console.error('Error adding secret:', error);
            await auditLog('add', name, false, sanitizeErrorMessage(error));
            return {
                success: false,
                error: `Failed to add secret: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * Retrieve a secret from the vault
     * @param {string} name - Secret name
     * @returns {Promise<Object>} Result object with secret value or error
     */
    async getSecret(name) {
        try {
            const value = this.secrets.get(name);
            
            if (value === undefined) {
                await auditLog('get', name, false, 'Secret not found');
                return { success: false, error: `Secret '${name}' not found` };
            }

            await auditLog('get', name, true);
            return {
                success: true,
                value: value,
                message: 'Secret retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting secret:', error);
            return {
                success: false,
                error: `Failed to retrieve secret: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * List all secret names
     * @returns {Promise<Object>} Result object with array of secret names
     */
    async listSecrets() {
        try {
            const secrets = Array.from(this.secrets.keys()).sort();
            
            return {
                success: true,
                data: { secrets }
            };
        } catch (error) {
            console.error('Error listing secrets:', error);
            return {
                success: false,
                error: `Failed to list secrets: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * Delete a secret from the vault
     * @param {string} name - Secret name
     * @returns {Promise<Object>} Result object with success status
     */
    async deleteSecret(name) {
        try {
            if (!this.secrets.has(name)) {
                await auditLog('delete', name, false, 'Secret not found');
                return { success: false, error: `Secret '${name}' not found` };
            }

            // Delete the secret
            this.secrets.delete(name);
            await this._saveVault();

            await auditLog('delete', name, true);
            return {
                success: true,
                message: `Secret '${name}' deleted successfully`
            };
        } catch (error) {
            console.error('Error deleting secret:', error);
            return {
                success: false,
                error: `Failed to delete secret: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * Get vault status and backend information
     * @returns {Promise<Object>} Status information
     */
    async getStatus() {
        try {
            const platform = process.platform;
            let backendName = 'Unknown';
            
            switch (platform) {
                case 'win32':
                    backendName = 'Windows DPAPI (Data Protection API)';
                    break;
                case 'darwin':
                    backendName = 'macOS Keychain Services';
                    break;
                case 'linux':
                    backendName = 'Linux libsecret';
                    break;
            }

            return {
                success: true,
                data: {
                    status: 'running',
                    backend: {
                        identity: `Electron safeStorage (${backendName})`,
                        secure: true,
                        reason: 'Using OS-native encryption via Electron safeStorage API'
                    },
                    secretCount: this.secrets.size
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get status: ${sanitizeErrorMessage(error)}`
            };
        }
    }

    /**
     * Update an existing secret (overwrite)
     * @param {string} name - Secret name
     * @param {string} value - New secret value
     * @returns {Promise<Object>} Result object with success status
     */
    async updateSecret(name, value) {
        try {
            // Validate secret name
            const validation = validateSecretName(name);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Validate value
            if (!value || typeof value !== 'string') {
                return { success: false, error: 'Secret value cannot be empty' };
            }

            // Check for null bytes
            if (value.includes('\0')) {
                return { success: false, error: 'Secret value cannot contain null bytes' };
            }

            // Enforce maximum length to prevent DoS and memory issues
            if (value.length > 10000) {
                return { success: false, error: 'Secret value too large (maximum 10,000 characters)' };
            }

            // Check if secret exists
            if (!this.secrets.has(name)) {
                return { success: false, error: `Secret '${name}' not found` };
            }

            // Update the secret
            this.secrets.set(name, value);
            await this._saveVault();

            await auditLog('update', name, true);
            return {
                success: true,
                message: `Secret '${name}' updated successfully`
            };
        } catch (error) {
            console.error('Error updating secret:', error);
            return {
                success: false,
                error: `Failed to update secret: ${sanitizeErrorMessage(error)}`
            };
        }
    }
}

// Export singleton instance
module.exports = new VaultService();

/**
 * VaultBuddy Native Vault Service
 * 
 * Provides secure secret management using OS-native keyring storage
 * via the keytar library. This replaces the Python backend for the
 * desktop application.
 * 
 * Security: All operations are in-process, secrets never traverse IPC boundaries.
 */

const keytar = require('keytar');

const SERVICE_NAME = 'VaultBuddy';
const INDEX_KEY = '__index__';

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
 * Logs to console (can be extended to write to file)
 */
function auditLog(action, secretName, success, details = '') {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `${timestamp} | ${action.toUpperCase().padEnd(10)} | ${secretName.padEnd(30)} | ${status}${details ? ' | ' + details : ''}`;
    console.log('[AUDIT]', logEntry);
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
 * Loads the secret index from the keyring
 * The index is stored as a newline-separated list of secret names
 */
async function loadIndex() {
    try {
        const indexData = await keytar.getPassword(SERVICE_NAME, INDEX_KEY);
        if (!indexData) {
            return new Set();
        }
        const names = indexData.split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);
        return new Set(names);
    } catch (error) {
        console.error('Error loading index:', error);
        return new Set();
    }
}

/**
 * Saves the secret index to the keyring
 */
async function saveIndex(namesSet) {
    try {
        const payload = Array.from(namesSet).sort().join('\n');
        await keytar.setPassword(SERVICE_NAME, INDEX_KEY, payload);
    } catch (error) {
        console.error('Error saving index:', error);
        throw new Error('Failed to save secret index');
    }
}

/**
 * Ensures the index exists in the keyring
 */
async function ensureIndex() {
    try {
        const indexData = await keytar.getPassword(SERVICE_NAME, INDEX_KEY);
        if (indexData === null) {
            await keytar.setPassword(SERVICE_NAME, INDEX_KEY, '');
        }
    } catch (error) {
        // More helpful error message for common issues
        if (error.message && error.message.includes('Password')) {
            throw new Error(
                'Cannot access Windows Credential Manager. Please ensure:\n' +
                '1. Your Windows user account has a password set\n' +
                '2. You are logged in with a local/domain account (not temporary)\n' +
                '3. Credential Manager service is running'
            );
        }
        throw error;
    }
}

/**
 * VaultService class - main interface for secret management
 */
class VaultService {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the vault service
     * Ensures the index exists and validates the keyring backend
     */
    async initialize() {
        if (this.initialized) {
            return { success: true };
        }

        try {
            console.log('Initializing vault service...');
            console.log('Testing keytar access...');
            
            // Test if keytar can access the keyring at all
            const testResult = await keytar.findPassword(SERVICE_NAME);
            console.log('Keytar test result:', testResult !== undefined ? 'Success' : 'No entries yet');
            
            await ensureIndex();
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

            // Enforce maximum length to prevent DoS and memory issues
            if (value.length > 10000) {
                return { success: false, error: 'Secret value too large (maximum 10,000 characters)' };
            }

            // Check if secret already exists
            const existing = await keytar.getPassword(SERVICE_NAME, name);
            if (existing !== null) {
                return { success: false, error: `Secret '${name}' already exists` };
            }

            // Store the secret
            await keytar.setPassword(SERVICE_NAME, name, value);

            // Update index
            const index = await loadIndex();
            index.add(name);
            await saveIndex(index);

            auditLog('add', name, true);
            return {
                success: true,
                message: `Secret '${name}' stored successfully`
            };
        } catch (error) {
            console.error('Error adding secret:', error);
            auditLog('add', name, false, sanitizeErrorMessage(error));
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
            const value = await keytar.getPassword(SERVICE_NAME, name);
            
            if (value === null) {
                auditLog('get', name, false, 'Secret not found');
                return { success: false, error: `Secret '${name}' not found` };
            }

            auditLog('get', name, true);
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
            const index = await loadIndex();
            const secrets = Array.from(index).sort();
            
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
            const deleted = await keytar.deletePassword(SERVICE_NAME, name);
            
            if (!deleted) {
                auditLog('delete', name, false, 'Secret not found');
                return { success: false, error: `Secret '${name}' not found` };
            }

            // Update index
            const index = await loadIndex();
            if (index.has(name)) {
                index.delete(name);
                await saveIndex(index);
            }

            auditLog('delete', name, true);
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
            return {
                success: true,
                data: {
                    status: 'running',
                    backend: {
                        identity: 'Native Node.js (keytar)',
                        secure: true,
                        reason: 'Using OS-native keyring via keytar library'
                    }
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

            // Enforce maximum length to prevent DoS and memory issues
            if (value.length > 10000) {
                return { success: false, error: 'Secret value too large (maximum 10,000 characters)' };
            }

            // Check if secret exists
            const existing = await keytar.getPassword(SERVICE_NAME, name);
            if (existing === null) {
                return { success: false, error: `Secret '${name}' not found` };
            }

            // Update the secret
            await keytar.setPassword(SERVICE_NAME, name, value);

            auditLog('update', name, true);
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


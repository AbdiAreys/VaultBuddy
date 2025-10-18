import { Secret } from '../types/Secret';

class PythonBackendService {
  private async executePythonCommand(command: string, args: string[] = []): Promise<string> {
    // This would execute the Python CLI commands
    // For now, we'll use a simple fetch approach or subprocess
    const commandArgs = [command, ...args];
    
    try {
      // In a real implementation, this would use child_process or a local server
      // For now, we'll simulate the behavior with localStorage
      return this.simulatePythonCall(command, args);
    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private simulatePythonCall(command: string, args: string[]): string {
    // This simulates the Python backend behavior
    // In production, this would be replaced with actual Python subprocess calls
    const secrets = JSON.parse(localStorage.getItem('vaultbuddy_secrets') || '{}');
    
    switch (command) {
      case 'list':
        const secretList = Object.keys(secrets).map(name => ({
          name,
          lastModified: new Date().toISOString()
        }));
        return JSON.stringify(secretList);
        
      case 'store':
        if (args.length < 2) throw new Error('Missing secret name or value');
        const [name, value] = args;
        if (!name.trim()) throw new Error('Secret name cannot be empty');
        if (!value) throw new Error('Secret value cannot be empty');
        if (name.length > 100) throw new Error('Secret name too long');
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
          throw new Error('Secret name contains invalid characters');
        }
        secrets[name] = value;
        localStorage.setItem('vaultbuddy_secrets', JSON.stringify(secrets));
        return 'Secret stored successfully';
        
      case 'get':
        if (args.length < 1) throw new Error('Missing secret name');
        const secretValue = secrets[args[0]];
        if (!secretValue) throw new Error(`Secret '${args[0]}' not found`);
        return secretValue;
        
      case 'delete':
        if (args.length < 1) throw new Error('Missing secret name');
        if (!(args[0] in secrets)) throw new Error(`Secret '${args[0]}' not found`);
        delete secrets[args[0]];
        localStorage.setItem('vaultbuddy_secrets', JSON.stringify(secrets));
        return 'Secret deleted successfully';
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async listSecrets(): Promise<Secret[]> {
    try {
      const result = await this.executePythonCommand('list');
      const secretData = JSON.parse(result);
      return secretData.map((secret: any) => ({
        name: secret.name,
        lastModified: new Date(secret.lastModified)
      }));
    } catch (error) {
      throw new Error(`Failed to list secrets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async storeSecret(name: string, value: string): Promise<void> {
    try {
      await this.executePythonCommand('store', [name, value]);
    } catch (error) {
      throw new Error(`Failed to store secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSecret(name: string): Promise<string> {
    try {
      return await this.executePythonCommand('get', [name]);
    } catch (error) {
      throw new Error(`Failed to get secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSecret(name: string): Promise<void> {
    try {
      await this.executePythonCommand('delete', [name]);
    } catch (error) {
      throw new Error(`Failed to delete secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async copySecret(name: string): Promise<void> {
    try {
      const value = await this.getSecret(name);
      await navigator.clipboard.writeText(value);
    } catch (error) {
      throw new Error(`Failed to copy secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const pythonBackendService = new PythonBackendService();

import { Secret, VaultService } from '../types/Secret';
import { pythonBackendService } from './pythonBackend';

class VaultServiceImplementation implements VaultService {

  async listSecrets(): Promise<Secret[]> {
    return pythonBackendService.listSecrets();
  }

  async storeSecret(name: string, value: string): Promise<void> {
    return pythonBackendService.storeSecret(name, value);
  }

  async getSecret(name: string): Promise<string> {
    return pythonBackendService.getSecret(name);
  }

  async deleteSecret(name: string): Promise<void> {
    return pythonBackendService.deleteSecret(name);
  }

  async copySecret(name: string): Promise<void> {
    return pythonBackendService.copySecret(name);
  }
}

export const vaultService = new VaultServiceImplementation();

export interface Secret {
  name: string;
  value?: string; // Optional since we don't always load the actual value
  lastModified?: Date;
}

export interface VaultService {
  listSecrets(): Promise<Secret[]>;
  storeSecret(name: string, value: string): Promise<void>;
  getSecret(name: string): Promise<string>;
  deleteSecret(name: string): Promise<void>;
  copySecret(name: string): Promise<void>;
}

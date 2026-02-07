import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import VaultDashboard from './components/VaultDashboard';
import AddSecretModal from './components/AddSecretModal';
import { Secret } from './types/Secret';
import { vaultService } from './services/vaultService';

function App() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load secrets on component mount
  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      setError(null);
      const secretsList = await vaultService.listSecrets();
      setSecrets(secretsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecret = async (name: string, value: string) => {
    try {
      await vaultService.storeSecret(name, value);
      setStatusMessage(`✅ Secret '${name}' stored successfully`);
      await loadSecrets();
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store secret');
    }
  };

  const handleDeleteSecret = async (name: string) => {
    try {
      await vaultService.deleteSecret(name);
      setStatusMessage(`✅ Secret '${name}' deleted successfully`);
      await loadSecrets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete secret');
    }
  };

  const handleCopySecret = async (name: string) => {
    try {
      await vaultService.copySecret(name);
      setStatusMessage(`📋 Secret '${name}' copied to clipboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy secret');
    }
  };

  // Clear status messages after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return (
    <div className="App">
      <Header 
        onAddSecret={() => setShowAddModal(true)}
        onRefresh={loadSecrets}
        loading={loading}
      />
      
      <main className="main-content">
        {error && (
          <div className="error-message">
            <span className="text-error">{error}</span>
          </div>
        )}
        
        {statusMessage && (
          <div className="status-message">
            <span className="text-success">{statusMessage}</span>
          </div>
        )}
        
        <VaultDashboard
          secrets={secrets}
          loading={loading}
          onDeleteSecret={handleDeleteSecret}
          onCopySecret={handleCopySecret}
        />
      </main>
      
      {showAddModal && (
        <AddSecretModal
          onClose={() => setShowAddModal(false)}
          onAddSecret={handleAddSecret}
        />
      )}
    </div>
  );
}

export default App;

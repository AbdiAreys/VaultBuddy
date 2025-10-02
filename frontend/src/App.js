import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import SecretList from './components/SecretList';
import AddSecretForm from './components/AddSecretForm';
import SecretDetails from './components/SecretDetails';
import StatusMessage from './components/StatusMessage';
import { Shield, AlertTriangle } from 'lucide-react';

function App() {
  const [secrets, setSecrets] = useState([]);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(window.electronAPI !== undefined);
    
    // Load initial secrets
    loadSecrets();
  }, []);

  const showStatus = (message, type = 'info', duration = 3000) => {
    setStatus({ message, type, visible: true });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  const loadSecrets = async () => {
    if (!window.electronAPI) {
      setSecrets(['example-secret', 'api-key', 'database-password']); // Mock data for web
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.vaultApiCall('list');
      if (result.success && result.data) {
        setSecrets(result.data.secrets || []);
      } else {
        showStatus('Failed to load secrets: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showStatus('Error loading secrets: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecret = async (name, value) => {
    if (!window.electronAPI) {
      setSecrets(prev => [...prev, name]);
      showStatus('Secret added successfully (mock)', 'success');
      setShowAddForm(false);
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.vaultApiCall('add', { name, value });
      if (result.success) {
        await loadSecrets();
        showStatus('Secret added successfully', 'success');
        setShowAddForm(false);
      } else {
        showStatus('Failed to add secret: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showStatus('Error adding secret: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSecret = async (name) => {
    if (!window.electronAPI) {
      setSecrets(prev => prev.filter(s => s !== name));
      showStatus('Secret deleted successfully (mock)', 'success');
      setSelectedSecret(null);
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.vaultApiCall('delete', { name });
      if (result.success) {
        await loadSecrets();
        showStatus('Secret deleted successfully', 'success');
        setSelectedSecret(null);
      } else {
        showStatus('Failed to delete secret: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showStatus('Error deleting secret: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = async (name) => {
    if (!window.electronAPI) {
      showStatus('Secret copied to clipboard (mock)', 'success');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.vaultApiCall('copy', { name });
      if (result.success) {
        showStatus('Secret copied to clipboard (auto-clears in 30s)', 'success');
      } else {
        showStatus('Failed to copy secret: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showStatus('Error copying secret: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Temporarily show full UI in web mode for demo
  // if (!isElectron) {
  //   return (
  //     <div className="app">
  //       <div className="web-warning">
  //         <AlertTriangle size={48} />
  //         <h2>Web Version - Demo Mode</h2>
  //         <p>
  //           VaultBuddy is designed to run as a desktop application with Electron
  //           for secure access to your OS keyring. This web version shows the UI
  //           with mock data only.
  //         </p>
  //         <p>
  //           Download the desktop app for full functionality and secure secret storage.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="app">
      <Header 
        onAddSecret={() => setShowAddForm(true)}
        onRefresh={loadSecrets}
        loading={loading}
      />
      
      <main className="main-content">
        <div className="sidebar">
          <SecretList
            secrets={secrets}
            selectedSecret={selectedSecret}
            onSelectSecret={setSelectedSecret}
            loading={loading}
          />
        </div>
        
        <div className="content">
          {showAddForm ? (
            <AddSecretForm
              onSubmit={handleAddSecret}
              onCancel={() => setShowAddForm(false)}
              loading={loading}
            />
          ) : selectedSecret ? (
            <SecretDetails
              secretName={selectedSecret}
              onDelete={handleDeleteSecret}
              onCopy={handleCopySecret}
              loading={loading}
            />
          ) : (
            <div className="welcome">
              <Shield size={64} />
              <h2>Welcome to VaultBuddy</h2>
              <p>Select a secret from the sidebar or add a new one to get started.</p>
              <p className="subtitle">
                Your secrets are securely stored in your OS keyring.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <StatusMessage
        message={status.message}
        type={status.type}
        visible={status.visible}
      />
    </div>
  );
}

export default App;

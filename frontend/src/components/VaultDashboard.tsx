import React, { useState } from 'react';
import SecretCard from './SecretCard';
import { Secret } from '../types/Secret';
import './VaultDashboard.css';

interface VaultDashboardProps {
  secrets: Secret[];
  loading: boolean;
  onDeleteSecret: (name: string) => void;
  onCopySecret: (name: string) => void;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({
  secrets,
  loading,
  onDeleteSecret,
  onCopySecret
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  const filteredSecrets = secrets
    .filter(secret => 
      secret.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0);
    });

  if (loading) {
    return (
      <div className="vault-dashboard loading">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <h2>Accessing Vault...</h2>
          <p>Decrypting secure storage</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-dashboard">
      <div className="dashboard-header">
        <h2>Secure Vault</h2>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-label">Secrets</span>
            <span className="stat-value">{secrets.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className="stat-value">Online</span>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <label className="sort-label">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="date">Modified</option>
          </select>
        </div>
      </div>

      <div className="secrets-container">
        {filteredSecrets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>No Secrets Found</h3>
            <p>
              {searchTerm 
                ? 'No secrets match your search.'
                : 'Vault is empty. Add a secret to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="secrets-grid">
            {filteredSecrets.map((secret) => (
              <SecretCard
                key={secret.name}
                secret={secret}
                onDelete={onDeleteSecret}
                onCopy={onCopySecret}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultDashboard;

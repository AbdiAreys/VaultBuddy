import React from 'react';
import './Header.css';

interface HeaderProps {
  onAddSecret: () => void;
  onRefresh: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAddSecret, onRefresh, loading }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">🔐</div>
            <div className="logo-text">
              <h1>VAULTBUDDY</h1>
              <span className="logo-subtitle">SECURE_VAULT_ACCESS</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn-secondary"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                REFRESHING...
              </>
            ) : (
              'REFRESH'
            )}
          </button>
          
          <button 
            className="btn-primary"
            onClick={onAddSecret}
          >
            + ADD_SECRET
          </button>
        </div>
      </div>
      
      <div className="header-status">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>SYSTEM_STATUS: SECURE</span>
        </div>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>ENCRYPTION: ACTIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

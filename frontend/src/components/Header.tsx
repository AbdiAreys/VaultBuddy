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
              <span className="logo-subtitle">Secure Vault Access</span>
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
                Loading...
              </>
            ) : (
              '↻ Refresh'
            )}
          </button>
          
          <button 
            className="btn-primary"
            onClick={onAddSecret}
          >
            + Add Secret
          </button>
        </div>
      </div>
      
      <div className="header-status">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>System: Online</span>
        </div>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Encryption: Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

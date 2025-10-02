import React from 'react';
import { Shield, Plus, RefreshCw } from 'lucide-react';
import './Header.css';

function Header({ onAddSecret, onRefresh, loading }) {
  return (
    <header className="header">
      <div className="header-left">
        <Shield size={24} />
        <h1>VaultBuddy</h1>
        <span className="version">v0.1.0</span>
      </div>
      
      <div className="header-right">
        <button
          className="header-btn refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh secrets list"
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
        </button>
        
        <button
          className="header-btn add-btn"
          onClick={onAddSecret}
          disabled={loading}
          title="Add new secret"
        >
          <Plus size={18} />
          Add Secret
        </button>
      </div>
    </header>
  );
}

export default Header;

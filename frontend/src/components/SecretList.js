import React from 'react';
import { Key, Search } from 'lucide-react';
import './SecretList.css';

function SecretList({ secrets, selectedSecret, onSelectSecret, loading }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSecrets = secrets.filter(secret =>
    secret.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="secret-list">
      <div className="secret-list-header">
        <h3>Secrets</h3>
        <span className="secret-count">{secrets.length}</span>
      </div>
      
      <div className="search-container">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search secrets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="secret-items">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading secrets...</span>
          </div>
        ) : filteredSecrets.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <Search size={24} />
                <span>No secrets match your search</span>
              </>
            ) : (
              <>
                <Key size={24} />
                <span>No secrets stored yet</span>
              </>
            )}
          </div>
        ) : (
          filteredSecrets.map((secret) => (
            <div
              key={secret}
              className={`secret-item ${selectedSecret === secret ? 'selected' : ''}`}
              onClick={() => onSelectSecret(secret)}
            >
              <Key size={16} />
              <span className="secret-name">{secret}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SecretList;

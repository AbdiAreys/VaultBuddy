import React, { useState } from 'react';
import { Key, Copy, Trash2, Eye, EyeOff, Clock } from 'lucide-react';
import './SecretDetails.css';

function SecretDetails({ secretName, onDelete, onCopy, loading }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState(30);

  const handleCopy = () => {
    onCopy(secretName);
  };

  const handleDelete = () => {
    onDelete(secretName);
    setShowDeleteConfirm(false);
  };

  const formatSecretName = (name) => {
    return name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="secret-details">
      <div className="secret-header">
        <div className="secret-info">
          <Key size={24} />
          <div>
            <h2>{formatSecretName(secretName)}</h2>
            <span className="secret-id">{secretName}</span>
          </div>
        </div>
      </div>
      
      <div className="secret-content">
        <div className="info-section">
          <h3>Secret Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{secretName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Storage:</span>
              <span className="info-value">OS Keyring</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">Encrypted Secret</span>
            </div>
          </div>
        </div>
        
        <div className="actions-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <div className="copy-section">
              <div className="copy-options">
                <label htmlFor="copy-timeout">Auto-clear timeout:</label>
                <select
                  id="copy-timeout"
                  value={copyTimeout}
                  onChange={(e) => setCopyTimeout(parseInt(e.target.value))}
                  className="timeout-select"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
              <button
                className="action-btn copy-btn"
                onClick={handleCopy}
                disabled={loading}
              >
                <Copy size={16} />
                Copy to Clipboard
              </button>
              <span className="copy-help">
                <Clock size={14} />
                Clipboard will auto-clear after {copyTimeout} seconds
              </span>
            </div>
          </div>
        </div>
        
        <div className="danger-section">
          <h3>Danger Zone</h3>
          <div className="danger-content">
            <div className="danger-info">
              <p>
                <strong>Delete this secret</strong>
              </p>
              <p>
                This action cannot be undone. The secret will be permanently
                removed from your OS keyring.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                className="action-btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                <Trash2 size={16} />
                Delete Secret
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Are you sure you want to delete <strong>{secretName}</strong>?</p>
                <div className="confirm-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner small"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecretDetails;

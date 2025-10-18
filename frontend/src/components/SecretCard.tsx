import React, { useState } from 'react';
import { Secret } from '../types/Secret';
import './SecretCard.css';

interface SecretCardProps {
  secret: Secret;
  onDelete: (name: string) => void;
  onCopy: (name: string) => void;
}

const SecretCard: React.FC<SecretCardProps> = ({ secret, onDelete, onCopy }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    onDelete(secret.name);
    setShowConfirmDelete(false);
  };

  const handleCopy = () => {
    onCopy(secret.name);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'UNKNOWN';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`secret-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="secret-header">
        <div className="secret-icon">🔑</div>
        <div className="secret-info">
          <h3 className="secret-name">{secret.name}</h3>
          <span className="secret-date">
            MODIFIED: {formatDate(secret.lastModified)}
          </span>
        </div>
        <div className="secret-status">
          <span className="status-indicator">SECURE</span>
        </div>
      </div>

      <div className="secret-actions">
        <button
          className="btn-secondary small"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          📋 COPY
        </button>
        
        {!showConfirmDelete ? (
          <button
            className="btn-danger small"
            onClick={() => setShowConfirmDelete(true)}
            title="Delete secret"
          >
            🗑️ DELETE
          </button>
        ) : (
          <div className="confirm-delete">
            <button
              className="btn-danger small"
              onClick={handleDelete}
              title="Confirm deletion"
            >
              ✓ CONFIRM
            </button>
            <button
              className="btn-secondary small"
              onClick={() => setShowConfirmDelete(false)}
              title="Cancel deletion"
            >
              ✗ CANCEL
            </button>
          </div>
        )}
      </div>

      <div className="secret-footer">
        <div className="security-indicators">
          <span className="indicator">ENCRYPTED</span>
          <span className="indicator">OS_KEYRING</span>
        </div>
      </div>
    </div>
  );
};

export default SecretCard;

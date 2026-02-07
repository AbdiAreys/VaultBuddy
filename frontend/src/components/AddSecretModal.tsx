import React, { useState, useEffect } from 'react';
import './AddSecretModal.css';

interface AddSecretModalProps {
  onClose: () => void;
  onAddSecret: (name: string, value: string) => void;
}

const AddSecretModal: React.FC<AddSecretModalProps> = ({ onClose, onAddSecret }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Focus on name input when modal opens
    const nameInput = document.getElementById('secret-name');
    if (nameInput) nameInput.focus();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Secret name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Secret name must be 100 characters or less';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      newErrors.name = 'Secret name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!value) {
      newErrors.value = 'Secret value is required';
    }

    if (value !== confirmValue) {
      newErrors.confirmValue = 'Secret values do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddSecret(name.trim(), value);
    }
  };

  const handleClose = () => {
    setName('');
    setValue('');
    setConfirmValue('');
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Secret</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="secret-form">
          <div className="form-group">
            <label htmlFor="secret-name" className="form-label">
              Secret Name
            </label>
            <input
              id="secret-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter secret name (e.g., github_token)"
              autoComplete="off"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="secret-value" className="form-label">
              Secret Value
            </label>
            <div className="password-input-container">
              <input
                id="secret-value"
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`form-input ${errors.value ? 'error' : ''}`}
                placeholder="Enter secret value"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.value && (
              <span className="error-message">{errors.value}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm-value" className="form-label">
              Confirm Value
            </label>
            <input
              id="confirm-value"
              type="password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              className={`form-input ${errors.confirmValue ? 'error' : ''}`}
              placeholder="Confirm secret value"
              autoComplete="new-password"
            />
            {errors.confirmValue && (
              <span className="error-message">{errors.confirmValue}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Store Secret
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <div className="security-notice">
            <span className="security-icon">🔒</span>
            <span>Secret will be encrypted using OS keyring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSecretModal;

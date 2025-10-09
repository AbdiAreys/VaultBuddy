import React, { useState } from 'react';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import './AddSecretForm.css';

function AddSecretForm({ onSubmit, onCancel, loading }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Secret name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Secret name must be less than 100 characters';
    } else if (/[\n\r\t]/.test(name)) {
      newErrors.name = 'Secret name cannot contain whitespace control characters';
    } else if (/["';\\/:*?<>|]/.test(name)) {
      newErrors.name = 'Secret name contains invalid characters';
    }
    
    if (!value.trim()) {
      newErrors.value = 'Secret value is required';
    } else if (value.length < 1) {
      newErrors.value = 'Secret value cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(name.trim(), value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handleValueChange = (e) => {
    setValue(e.target.value);
    if (errors.value) {
      setErrors(prev => ({ ...prev, value: null }));
    }
  };

  return (
    <div className="add-secret-form">
      <div className="form-header">
        <div className="form-title">
          <Plus size={20} />
          <h2>Add New Secret</h2>
        </div>
        <button
          type="button"
          className="close-btn"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="secret-name">Secret Name</label>
          <input
            id="secret-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g., api-key, database-password"
            className={`form-input ${errors.name ? 'error' : ''}`}
            disabled={loading}
            autoFocus
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
          <span className="help-text">
            Cannot contain: " ' ; \ / : * ? &lt; &gt; | or control characters
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="secret-value">Secret Value</label>
          <div className="password-input-container">
            <input
              id="secret-value"
              type={showValue ? 'text' : 'password'}
              value={value}
              onChange={handleValueChange}
              placeholder="Enter your secret value"
              className={`form-input password-input ${errors.value ? 'error' : ''}`}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowValue(!showValue)}
              disabled={loading}
              tabIndex={-1}
            >
              {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.value && <span className="error-message">{errors.value}</span>}
          <span className="help-text">
            This will be securely stored in your OS keyring
          </span>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !name.trim() || !value.trim()}
          >
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Secret
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSecretForm;

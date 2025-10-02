import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './StatusMessage.css';

function StatusMessage({ message, type, visible }) {
  if (!visible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getClassName = () => {
    return `status-message ${type} ${visible ? 'visible' : ''}`;
  };

  return (
    <div className={getClassName()}>
      <div className="status-content">
        {getIcon()}
        <span className="status-text">{message}</span>
      </div>
    </div>
  );
}

export default StatusMessage;

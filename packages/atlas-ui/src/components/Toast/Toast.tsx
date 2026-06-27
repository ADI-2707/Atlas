import React from 'react';
import './Toast.css';

export interface ToastProps {
  id?: string;
  title: string;
  message?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'info',
  onClose,
}) => {
  return (
    <div className={`atlas-toast atlas-toast--${variant}`} role="alert">
      <div className="atlas-toast-content">
        <span className="atlas-toast-title">{title}</span>
        {message && <span className="atlas-toast-message">{message}</span>}
      </div>
      {onClose && (
        <button className="atlas-toast-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
};

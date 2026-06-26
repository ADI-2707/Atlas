import React, { InputHTMLAttributes } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`atlas-checkbox-container ${className}`}>
      <div className="atlas-checkbox-wrapper">
        <input 
          type="checkbox" 
          id={checkboxId} 
          className={`atlas-checkbox-input ${error ? 'atlas-checkbox--error' : ''}`}
          {...props} 
        />
        <div className="atlas-checkbox-custom">
          <svg className="atlas-checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      {label && (
        <label htmlFor={checkboxId} className="atlas-checkbox-label">
          {label}
        </label>
      )}
      {error && <span className="atlas-checkbox-error-msg">{error}</span>}
    </div>
  );
};

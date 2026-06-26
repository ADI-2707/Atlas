import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  const inputClass = ['atlas-input', error ? 'atlas-input--error' : '', className].filter(Boolean).join(' ');

  return (
    <div className="atlas-input-container">
      {label && (
        <label htmlFor={inputId} className="atlas-input-label">
          {label}
        </label>
      )}
      <div className="atlas-input-wrapper">
        <input id={inputId} className={inputClass} {...props} />
      </div>
      {error && <span className="atlas-input-error-msg">{error}</span>}
    </div>
  );
};

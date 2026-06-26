import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  trailingIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  const inputClasses = [
    'atlas-input',
    error ? 'atlas-input--error' : '',
    icon ? 'atlas-input--has-icon' : '',
    trailingIcon ? 'atlas-input--has-trailing-icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="atlas-input-container">
      {label && (
        <label htmlFor={inputId} className="atlas-input-label">
          {label}
        </label>
      )}
      <div className="atlas-input-wrapper">
        {icon && <span className="atlas-input-icon">{icon}</span>}
        <input id={inputId} className={inputClasses} {...props} />
        {trailingIcon && <span className="atlas-input-icon-trailing">{trailingIcon}</span>}
      </div>
      {error && <span className="atlas-input-error-msg">{error}</span>}
    </div>
  );
};

import React, { HTMLAttributes } from 'react';
import './Modal.css';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

import { createPortal } from 'react-dom';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="atlas-modal-overlay" onClick={onClose}>
      <div 
        className={`atlas-modal ${className}`} 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
        {...props}
      >
        {title && (
          <div className="atlas-modal-header">
            <h2 className="atlas-modal-title">{title}</h2>
            <button className="atlas-modal-close" onClick={onClose} aria-label="Close modal">
              &times;
            </button>
          </div>
        )}
        <div className="atlas-modal-content">
          {children}
        </div>
        {footer && (
          <div className="atlas-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

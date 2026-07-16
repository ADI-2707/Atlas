import React from 'react';
import { Toast } from '@atlas/ui';
import { ToastMessage } from './ToastContext';
import './Toast.css';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="atlas-toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          message={toast.message}
          variant={toast.variant === 'error' ? 'error' : toast.variant === 'success' ? 'success' : toast.variant === 'warning' ? 'warning' : 'info'}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
};

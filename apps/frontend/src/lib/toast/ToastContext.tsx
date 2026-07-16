import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  variant: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  showToast: (
    title: string,
    message?: string,
    variant?: ToastMessage['variant'],
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      variant: ToastMessage['variant'] = 'info',
      duration = 4000
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, title, message, variant };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

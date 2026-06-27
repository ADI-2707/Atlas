import React, { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

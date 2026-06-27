import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenStorage } from './TokenStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hasCompletedSetup?: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  completeSetup: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = TokenStorage.getToken();
    if (token) {
      try {
        const storedUser = localStorage.getItem('atlas_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    TokenStorage.setToken(token);
    const userWithSetup = { ...userData, hasCompletedSetup: userData.hasCompletedSetup ?? false };
    localStorage.setItem('atlas_user', JSON.stringify(userWithSetup));
    setUser(userWithSetup);
    setIsAuthenticated(true);
  };

  const completeSetup = () => {
    if (user) {
      const updatedUser = { ...user, hasCompletedSetup: true };
      localStorage.setItem('atlas_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    TokenStorage.removeToken();
    localStorage.removeItem('atlas_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, completeSetup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

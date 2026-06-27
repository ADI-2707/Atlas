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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeSetup: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode; apiUrl?: string }> = ({ children, apiUrl = 'http://localhost:3001/api/v1' }) => {
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

  const login = async (email: string, password: string) => {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid email or password');
    }

    const { data } = await res.json();
    const { accessToken, user: backendUser } = data;

    TokenStorage.setToken(accessToken);
    
    // Check if the user has completed setup. Since backend doesn't store this yet,
    // we'll keep the mock logic or default to false for now.
    const userWithSetup = {
      id: backendUser.id,
      email: backendUser.email,
      name: `${backendUser.firstName} ${backendUser.lastName}`,
      role: backendUser.roles[0] || 'User',
      hasCompletedSetup: false 
    };
    
    // We still store user in localStorage for persistence across reloads until we add a /me endpoint
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

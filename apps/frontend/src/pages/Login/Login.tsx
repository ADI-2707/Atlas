import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardBody, Input, Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@atlas.com' && password === 'password') {
        login('mock_jwt_token', { id: '1', email, name: 'Admin User', role: 'admin' });
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Use admin@atlas.com / password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="atlas-login-page">
      <div className="atlas-login-card-wrapper">
        <Card>
          <CardBody>
            <div className="atlas-login-header">
              <h1 className="atlas-login-logo">Atlas OS</h1>
              <p className="atlas-login-subtitle">Sign in to your enterprise workspace</p>
            </div>

            <form className="atlas-login-form" onSubmit={handleLogin}>
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="admin@atlas.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <div style={{ color: '#ef4444', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                isLoading={isLoading}
                style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
              >
                Sign In
              </Button>
            </form>

            <div className="atlas-login-footer">
              Secure enterprise authentication
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

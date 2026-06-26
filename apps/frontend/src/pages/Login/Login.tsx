import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@atlas/auth';
import { Input, Button, Checkbox } from '@atlas/ui';
import './Login.css';

const EnvelopeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const SsoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 12h8"></path>
    <path d="M12 8v8"></path>
  </svg>
);

const AtlasLogo = () => (
  <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="atlas-logo-svg">
    <g transform="translate(24, 24) rotate(45)">
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="currentColor"/>
      <rect x="-20" y="-20" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" className="logo-node node-1"/>
      <rect x="10" y="-20" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" className="logo-node node-2"/>
      <rect x="10" y="10" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" className="logo-node node-3"/>
      <rect x="-20" y="10" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" className="logo-node node-4"/>
    </g>
  </svg>
);


export const Login: React.FC = () => {
  const [animPhase, setAnimPhase] = useState(0);
  const [email, setEmail] = useState('admin@atlas.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setAnimPhase(1), 200);
    const t2 = setTimeout(() => setAnimPhase(2), 1000);
    const t3 = setTimeout(() => setAnimPhase(3), 1800);
    const t4 = setTimeout(() => setAnimPhase(4), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await login('mock-token-123', {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin'
      });
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`atlas-login-layout phase-${animPhase}`}>
      <div className="atlas-login-left-panel">
        <div className="atlas-brand-content">
          <div className="atlas-logo-wrapper">
            <AtlasLogo />
          </div>
          <div className="atlas-brand-text">
            <h1 className="atlas-brand-title">Atlas</h1>
            <h2 className="atlas-brand-subtitle">Enterprise Application Framework</h2>
            <div className="atlas-brand-description">
              <p>A modular core platform providing reusable enterprise infrastructure.</p>
              <p>Build and scale independent business plugins seamlessly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="atlas-login-right-panel">
        <div className="atlas-login-card-wrapper">
          <div className="atlas-login-card">
            
            <div className="atlas-login-card-content">
              <div className="atlas-login-card-header">
                <h2>Welcome back</h2>
                <p>Sign in to your enterprise workspace</p>
              </div>

              <form onSubmit={handleLogin} className="atlas-login-form">
                <div>
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<EnvelopeIcon />}
                    required
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label="Password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<LockIcon />}
                    trailingIcon={<EyeIcon />}
                    required
                  />
                </div>

                {error && <div className="atlas-login-error">{error}</div>}

                <div className="atlas-login-options">
                  <Checkbox label="Remember me" />
                  <a href="#" className="atlas-login-forgot">Forgot password?</a>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="atlas-login-submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Sign In →
                  </Button>
                </div>
              </form>

              <div className="atlas-login-divider">
                <span>or continue with</span>
              </div>

              <div className="atlas-sso-container">
                <button type="button" className="atlas-sso-btn" aria-label="Sign in with Microsoft">
                  <MicrosoftIcon />
                </button>
                <button type="button" className="atlas-sso-btn" aria-label="Sign in with Google">
                  <GoogleIcon />
                </button>
                <button type="button" className="atlas-sso-btn atlas-sso-btn-text" aria-label="Sign in with SSO">
                  <SsoIcon />
                  <span>SSO</span>
                </button>
              </div>

              <div className="atlas-login-footer">
                <LockIcon />
                <span>Secure enterprise authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

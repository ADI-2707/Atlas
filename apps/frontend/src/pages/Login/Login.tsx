import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" y1="2" x2="22" y2="22"></line>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

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
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
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

              {justRegistered && (
                <div className="atlas-login-registered-banner">
                  ✅ Account created! Sign in with your new credentials.
                </div>
              )}

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
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<LockIcon />}
                    trailingIcon={
                      <span onClick={() => setShowPassword(!showPassword)} style={{ display: 'flex' }}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </span>
                    }
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

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

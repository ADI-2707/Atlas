import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '@atlas/ui';
import './AcceptInvite.css';

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No invitation token was provided in the URL.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/invitation/verify?token=${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Invitation is invalid or has expired.');
        }
        const json = await res.json();
        setEmail(json.data.email);
        setOrgName(json.data.organization.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid invitation link.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/invitation/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to accept invitation.');
      }

      const { data } = await res.json();
      const { accessToken, user: backendUser } = data;

      // Manually configure access local storage and trigger home page mount
      localStorage.setItem('atlas_access_token', accessToken);
      
      const userWithSetup = {
        id: backendUser.id,
        email: backendUser.email,
        name: `${backendUser.firstName} ${backendUser.lastName}`,
        role: backendUser.roles[0] || 'User',
        hasCompletedSetup: backendUser.hasCompletedSetup ?? true,
        orgSlug: backendUser.orgSlug,
        orgTier: backendUser.orgTier,
        permissions: backendUser.permissions || [],
      };
      
      localStorage.setItem('atlas_user', JSON.stringify(userWithSetup));
      
      // Navigate to base route and force hard reload to sync AuthProvider
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="accept-invite-layout">
        <div className="accept-invite-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Verifying invitation link...</p>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="accept-invite-layout">
        <div className="accept-invite-card" style={{ maxWidth: '450px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-danger)', fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Invalid Invitation</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>{error}</p>
          <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invite-layout">
      <div className="accept-invite-left-panel">
        <div className="atlas-brand-content">
          <div className="atlas-logo-wrapper">
            <AtlasLogo />
          </div>
          <div className="atlas-brand-text">
            <h1 className="atlas-brand-title">Atlas</h1>
            <h2 className="atlas-brand-subtitle">Welcome to Your Workspace</h2>
            <div className="atlas-brand-description">
              <p>You have been invited to join <strong>{orgName}</strong>.</p>
              <p>Set up your account password below to access the platform.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="accept-invite-right-panel">
        <div className="accept-invite-card-wrapper">
          <div className="accept-invite-card">
            <div className="accept-invite-card-content">
              <div className="accept-invite-card-header">
                <h2>Join Workspace</h2>
                <p>Complete your account details below</p>
              </div>

              {error && <div className="accept-invite-error">{error}</div>}

              <form onSubmit={handleSubmit} className="accept-invite-form">
                <div>
                  <Input
                    type="email"
                    label="Email Address"
                    value={email}
                    disabled
                  />
                </div>

                <div className="form-row-names">
                  <Input
                    type="text"
                    label="First Name"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    icon={<UserIcon />}
                    required
                  />
                  <Input
                    type="text"
                    label="Last Name"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    icon={<UserIcon />}
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
                    required
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<LockIcon />}
                    required
                  />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <Button
                    type="submit"
                    className="accept-invite-submit"
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    Accept Invite & Join →
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

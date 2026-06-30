import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';

interface FullScreenLockProps {
  title: string;
  description: string;
  upgradePath: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const FullScreenLock: React.FC<FullScreenLockProps> = ({ title, description, upgradePath, secondaryAction }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-surface-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1rem', lineHeight: '1.6', margin: '0 auto' }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Button variant="primary" onClick={() => navigate(upgradePath)}>
          Upgrade Plan
        </Button>
        {secondaryAction ? (
          <Button variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

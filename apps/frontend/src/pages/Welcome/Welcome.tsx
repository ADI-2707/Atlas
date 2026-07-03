import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import './Welcome.css';

export const Welcome: React.FC = () => {
  const { user } = useAuth();
  const { installedPlugins } = usePlugins();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (installedPlugins.length > 0) {
      navigate('/', { replace: true });
    }
  }, [installedPlugins, navigate]);

  const handleAddPlugins = () => {
    navigate('/store');
  };

  return (
    <div className="welcome-landing-container">
      <div className="welcome-landing-content animate-fade-in-up">
        <div className="welcome-landing-icon">🎉</div>
        <h1 className="welcome-landing-title">Welcome, {firstName}!</h1>
        <p className="welcome-landing-org">
          Your workspace is live and ready to go.
        </p>
        <p className="welcome-landing-subtitle">
          You're all set up. To unlock the power of Atlas, install your first
          enterprise plugin from the marketplace — CRM, Inventory, HR, Analytics and more.
        </p>
        <div className="welcome-status-chips">
          <span className="welcome-chip welcome-chip--done">✓ Account created</span>
          <span className="welcome-chip welcome-chip--done">✓ Workspace ready</span>
          <span className="welcome-chip welcome-chip--pending">○ Add first plugin</span>
        </div>
        <Button onClick={handleAddPlugins} size="large" className="welcome-landing-button">
          Browse Plugin Marketplace →
        </Button>
      </div>
    </div>
  );
};

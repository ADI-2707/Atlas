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
        <div className="welcome-landing-icon">👋</div>
        <h1 className="welcome-landing-title">Welcome to Atlas, {user?.name || 'User'}!</h1>
        <p className="welcome-landing-subtitle">
          Your workspace is currently empty. To get started and unlock the power of Atlas, 
          you need to install some enterprise plugins.
        </p>
        <Button onClick={handleAddPlugins} size="large" className="welcome-landing-button">
          Add Plugins to Workspace
        </Button>
      </div>
    </div>
  );
};

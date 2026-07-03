import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { useTheme } from '../../contexts/ThemeContext';
import { mockPlugins } from '../../plugins/mock-plugins';
import './Setup.css';

const steps = [
  {
    title: 'Welcome to Atlas',
    subtitle: 'The modern Enterprise Application Framework.',
    content: 'Atlas provides a modular, event-driven architecture designed to scale with your business. It serves as the single source of truth for all your enterprise operations.',
  },
  {
    title: 'Services We Offer',
    subtitle: 'Everything you need, nothing you don’t.',
    content: 'From advanced CRM capabilities to intelligent Inventory management and real-time Analytics, Atlas offers a vast ecosystem of enterprise-grade services tailored to your needs.',
  },
  {
    title: 'Your Workspace',
    subtitle: 'Fully customizable and secure.',
    content: 'Your workspace is an isolated environment. You have full control over data residency, access roles, and which applications run within your organization.',
  },
  {
    title: 'Setup Your Plugins',
    subtitle: 'Select the tools you need to get started.',
    content: 'Choose from our marketplace of plugins. You can always add or remove plugins later from the dashboard.',
  }
];

export const Setup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const navigate = useNavigate();
  const { completeSetup } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && !isAnimatingOut) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimatingOut(false);
      }, 500);
    }
  };

  const handleSkip = async () => {
    await completeSetup();
    navigate('/');
  };

  const handlePluginSelect = async (pluginId: string) => {
    await completeSetup();
    navigate(`/store/${pluginId}`);
  };

  return (
    <div className="atlas-setup-container">
      <div className="atlas-setup-background">
        <div className="setup-glow setup-glow-1" />
        <div className="setup-glow setup-glow-2" />
      </div>

      <div className="atlas-setup-content">
        <div className={`setup-content-wrapper ${isAnimatingOut ? 'slide-out-right' : 'slide-in-right'}`} key={currentStep}>
          <div className="setup-header">
            <h1 className="setup-title">{steps[currentStep].title}</h1>
            <p className="setup-subtitle delay-1">{steps[currentStep].subtitle}</p>
          </div>

          <div className="setup-body delay-2">
            <p>{steps[currentStep].content}</p>

            {currentStep === 3 && (
              <div className="setup-plugins-grid">
                {mockPlugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="setup-plugin-card"
                    onClick={() => handlePluginSelect(plugin.id)}
                  >
                    <div className="plugin-icon">{plugin.id.substring(0, 2).toUpperCase()}</div>
                    <div className="plugin-info">
                      <h3>{plugin.name}</h3>
                      <p>{plugin.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="setup-actions delay-3">
            <Button variant="secondary" onClick={handleSkip}>
              Skip Setup
            </Button>
            {currentStep < steps.length - 1 && (
              <Button onClick={handleNext}>
                Continue
              </Button>
            )}
          </div>
        </div>

        <div className="setup-progress">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`setup-progress-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

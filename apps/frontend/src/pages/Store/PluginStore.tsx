import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { mockPlugins } from '../../plugins/mock-plugins';
import './PluginStore.css';

const tiers = [
  { id: 'free', name: 'Free', price: '$0', desc: 'Basic features for small teams.', features: ['Core Functionality', 'Community Support'] },
  { id: 'pro', name: 'Professional', price: '$49', desc: 'Advanced features for growing teams.', features: ['Core Functionality', 'Priority Support', 'Advanced Analytics'] },
  { id: 'business', name: 'Business', price: '$199', desc: 'High limits and integrations.', features: ['Everything in Pro', 'Custom Integrations', 'SLA Guarantee'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Unlimited everything.', features: ['Everything in Business', 'Dedicated Account Manager', 'On-premise option'] },
];

const tierOrder: Record<string, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3
};

export const PluginStore: React.FC = () => {
  const { pluginId } = useParams<{ pluginId?: string }>();
  const navigate = useNavigate();
  const { installPlugin, upgradePlugin, installedPlugins, allPlugins } = usePlugins();
  const { user, completeSetup } = useAuth();
  
  const handleInstall = async (pId: string, tier: string) => {
    await installPlugin(pId, tier);
    if (user && !user.hasCompletedSetup) {
      completeSetup();
    }
    navigate(`/${pId}`);
  };

  const handleUpgrade = async (pId: string, tier: string, activeTierId: string) => {
    const isDowngrade = tierOrder[tier] < tierOrder[activeTierId];
    if (isDowngrade) {
      const confirmed = window.confirm(
        `If you downgrade, the privileges of this tier will be revoked and only privileges of the downgraded tier will be available. Are you sure you want to switch from ${activeTierId.toUpperCase()} to ${tier.toUpperCase()}?`
      );
      if (!confirmed) return;
    }

    try {
      await upgradePlugin(pId, tier);
      alert(`Successfully changed to the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan!`);
      window.location.reload();
    } catch (e) {
      alert('Failed to change plan.');
    }
  };

  if (pluginId) {
    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (!plugin) return <div>Plugin not found</div>;

    const isInstalled = installedPlugins.includes(plugin.id);
    
    // Determine active tier config from DB
    const dbPlugin = allPlugins.find(p => p.id === pluginId);
    const activeBackendTier = dbPlugin?.config?.tier || 'free';
    
    let activeTierId = 'free';
    if (activeBackendTier === 'tier1') activeTierId = 'pro';
    else if (activeBackendTier === 'tier2') activeTierId = 'business';
    else if (activeBackendTier === 'tier3') activeTierId = 'enterprise';

    return (
      <div className="store-container">
        <Button variant="secondary" onClick={() => navigate('/store')} className="back-button">
          &larr; Back to Plugins
        </Button>
        
        <div className="store-header" style={{ marginBottom: '2rem' }}>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>{plugin.description}</p>
        </div>

        <div className="tiers-grid">
          {tiers.map(tier => {
            const isActive = isInstalled && activeTierId === tier.id;
            
            return (
              <div key={tier.id} className={`tier-card ${isActive ? 'active-tier' : ''}`}>
                <h3>{tier.name}</h3>
                <div className="tier-price">{tier.price}<span>/mo</span></div>
                <p className="tier-desc">{tier.desc}</p>
                
                <ul className="tier-features">
                  {tier.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>

                <div className="tier-action">
                  {isActive ? (
                    <Button 
                      disabled
                      style={{ width: '100%', backgroundColor: '#107c41', color: '#fff', borderColor: '#107c41' }}
                    >
                      Active Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => isInstalled ? handleUpgrade(plugin.id, tier.id, activeTierId) : handleInstall(plugin.id, tier.id)}
                      style={{ width: '100%' }}
                    >
                      {isInstalled ? 'Change to this Plan' : `Select ${tier.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <div className="store-header" style={{ marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Enhance your Atlas workspace with powerful plugins.</p>
      </div>

      <div className="plugins-grid">
        {mockPlugins.map(plugin => {
          const isInstalled = installedPlugins.includes(plugin.id);
          return (
            <div key={plugin.id} className="plugin-card" onClick={() => navigate(`/store/${plugin.id}`)}>
              <div className="plugin-icon-large">{plugin.id.substring(0, 2).toUpperCase()}</div>
              <div className="plugin-content">
                <h3>{plugin.name}</h3>
                <p>{plugin.description}</p>
              </div>
              <div className="plugin-status">
                {isInstalled ? <span className="status-badge installed">Installed</span> : <span className="status-badge available">Available</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

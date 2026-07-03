import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { mockPlugins } from '../../plugins/mock-plugins';
import './PluginStore.css';

const getPluginTiers = (pluginId: string) => {
  if (pluginId === 'inventory') {
    return [
      { id: 'free', name: 'Free', price: '$0', desc: 'Basic limits for small catalogs.', features: ['2 Tables', '100 Products', '1 Warehouse'] },
      { id: 'pro', name: 'Professional', price: '$49', desc: 'Increased limits for growing teams.', features: ['5 Tables', '1,000 Products', '1 Warehouse'] },
      { id: 'business', name: 'Business', price: '$199', desc: 'Multi-warehouse support.', features: ['10 Tables', '10,000 Products', '5 Warehouses'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Scale to the maximum.', features: ['25 Tables', '100,000 Products', '20 Warehouses'] },
    ];
  }
  if (pluginId === 'crm') {
    return [
      { id: 'free', name: 'Free', price: '$0', desc: 'Basic CRM for individuals.', features: ['100 Customers', '50 Deals'] },
      { id: 'pro', name: 'Professional', price: '$49', desc: 'For growing sales teams.', features: ['200 Customers', '100 Deals'] },
      { id: 'business', name: 'Business', price: '$199', desc: 'High volume sales.', features: ['1,000 Customers', '500 Deals'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'No limits.', features: ['Unlimited Customers', 'Unlimited Deals'] },
    ];
  }
  if (pluginId === 'hr') {
    return [
      { id: 'free', name: 'Free', price: '$0', desc: 'For very small teams.', features: ['10 Employees', '3 Departments'] },
      { id: 'pro', name: 'Professional', price: '$49', desc: 'Standard HR limits.', features: ['50 Employees', 'Unlimited Departments'] },
      { id: 'business', name: 'Business', price: '$199', desc: 'For medium businesses.', features: ['250 Employees', 'Unlimited Departments'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'For large enterprises.', features: ['Unlimited Employees', 'Unlimited Departments'] },
    ];
  }
  if (pluginId === 'analytics') {
    return [
      { id: 'free', name: 'Free', price: '$0', desc: 'Basic metrics.', features: ['Basic Dashboard', 'Real-time Metrics'] },
      { id: 'pro', name: 'Professional', price: '$49', desc: 'Advanced reporting.', features: ['Basic Dashboard', 'Report Generation'] },
      { id: 'business', name: 'Business', price: '$199', desc: 'Intelligent insights.', features: ['Report Generation', 'Anomaly Detection'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Predictive analytics.', features: ['Report Generation', 'Anomaly Detection', 'Forecasting Models'] },
    ];
  }
  // Default fallback
  return [
    { id: 'free', name: 'Free', price: '$0', desc: 'Basic features.', features: ['Core Functionality'] },
    { id: 'pro', name: 'Professional', price: '$49', desc: 'Advanced features.', features: ['Priority Support'] },
    { id: 'business', name: 'Business', price: '$199', desc: 'High limits.', features: ['Custom Integrations'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Unlimited.', features: ['Dedicated Account Manager'] },
  ];
};

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
          {getPluginTiers(pluginId).map(tier => {
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

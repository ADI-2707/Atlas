import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface InventoryStats {
  productCount: number;
  maxProducts: number;
}

export const InventoryWidget: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ApiResponse<InventoryStats>>('/inventory/stats')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Inventory Plugin Disabled</div>
        <Button variant="secondary" size="small" onClick={() => navigate('/plugins')}>Open Marketplace</Button>
      </div>
    );
  }
  if (!stats) return <div>Loading...</div>;

  const productPct = (stats.productCount / stats.maxProducts) * 100;
  let fillClass = 'fill-normal';
  if (productPct >= 90) fillClass = 'fill-critical';
  else if (productPct >= 80) fillClass = 'fill-warning';
  const isCritical = productPct >= 99.5;

  return (
    <div className={`widget-body ${isCritical ? 'pulsing-critical' : ''}`}>
      <div className="widget-limits-container">
        <div className="limit-item">
          <div className="limit-label">
            <span>Products Usage</span>
            <span>{stats.productCount} / {stats.maxProducts} ({productPct.toFixed(1)}%)</span>
          </div>
          <div className="limit-progress-bar">
            <div className={`limit-progress-fill ${fillClass}`} style={{ width: `${Math.min(productPct, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="widget-footer" style={{ marginTop: '1rem' }}>
        <Button variant="secondary" size="small" onClick={() => navigate('/inventory')}>Open App</Button>
      </div>
    </div>
  );
};

interface CrmLimits {
  limits: { customers: number; deals: number };
  usage: { customers: number; deals: number };
}

export const CrmWidget: React.FC = () => {
  const [stats, setStats] = useState<CrmLimits | null>(null);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ApiResponse<CrmLimits>>('/crm/limits')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>CRM Plugin Disabled</div>
        <Button variant="secondary" size="small" onClick={() => navigate('/plugins')}>Open Marketplace</Button>
      </div>
    );
  }
  if (!stats) return <div>Loading...</div>;

  const contactsPct = stats.limits.customers === -1 ? 0 : (stats.usage.customers / stats.limits.customers) * 100;
  let fillClass = 'fill-normal';
  if (contactsPct >= 90) fillClass = 'fill-critical';
  else if (contactsPct >= 80) fillClass = 'fill-warning';

  return (
    <div className="widget-body">
      <div className="widget-limits-container">
        <div className="limit-item">
          <div className="limit-label">
            <span>Contacts Usage</span>
            <span>{stats.usage.customers} / {stats.limits.customers === -1 ? 'Unlimited' : stats.limits.customers}</span>
          </div>
          <div className="limit-progress-bar">
            <div className={`limit-progress-fill ${fillClass}`} style={{ width: `${Math.min(contactsPct, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="widget-footer" style={{ marginTop: '1rem' }}>
        <Button variant="secondary" size="small" onClick={() => navigate('/crm')}>Open App</Button>
      </div>
    </div>
  );
};

interface HrStats {
  employeeCount: number;
  payrollTotal: number;
}

interface PayrollRecord {
  amount: number;
}

export const HrWidget: React.FC = () => {
  const [stats, setStats] = useState<HrStats | null>(null);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<unknown[]>>('/hr/employees'),
      api.get<ApiResponse<PayrollRecord[]>>('/hr/payroll')
    ]).then(([empRes, payRes]) => {
      const emps = empRes.data || [];
      const pays = payRes.data || [];
      setStats({
        employeeCount: emps.length,
        payrollTotal: pays.reduce((sum: number, p: PayrollRecord) => sum + (p.amount || 0), 0)
      });
    }).catch(err => {
      console.error(err);
      setError(true);
    });
  }, []);

  if (error) {
    return (
      <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>HR Plugin Disabled</div>
        <Button variant="secondary" size="small" onClick={() => navigate('/plugins')}>Open Marketplace</Button>
      </div>
    );
  }
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="widget-body">
      <div className="widget-limits-container">
        <div className="limit-item">
          <span>Total Employees: </span><strong>{stats.employeeCount}</strong>
        </div>
        <div className="limit-item" style={{ marginTop: '0.5rem' }}>
          <span>Monthly Payroll: </span><strong>{formatCurrency(stats.payrollTotal)}</strong>
        </div>
      </div>
      <div className="widget-footer" style={{ marginTop: '1rem' }}>
        <Button variant="secondary" size="small" onClick={() => navigate('/hr')}>Open App</Button>
      </div>
    </div>
  );
};

interface AnalyticsOverview {
  totalRevenue: number;
  inventoryValuation: number;
}

interface AnalyticsResponse {
  overview: AnalyticsOverview;
}

export const AnalyticsWidget: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ApiResponse<AnalyticsResponse>>('/analytics/dashboard?org_id=org_default_123')
      .then(res => setStats(res.data.overview))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Analytics Plugin Disabled</div>
        <Button variant="secondary" size="small" onClick={() => navigate('/plugins')}>Open Marketplace</Button>
      </div>
    );
  }
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="widget-body">
      <div className="widget-limits-container">
        <div>Deals Won Revenue: <strong>{formatCurrency(stats.totalRevenue || 0)}</strong></div>
        <div style={{ marginTop: '0.5rem' }}>Inventory Valuation: <strong>{formatCurrency(stats.inventoryValuation || 0)}</strong></div>
      </div>
      <div className="widget-footer" style={{ marginTop: '1rem' }}>
        <Button variant="secondary" size="small" onClick={() => navigate('/analytics')}>Open App</Button>
      </div>
    </div>
  );
};

interface PmStats {
  projectCount: number;
  issueCount: number;
}

export const PmWidget: React.FC = () => {
  const [stats, setStats] = useState<PmStats | null>(null);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ApiResponse<PmStats>>('/plugins/project-management/stats')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Project Management Plugin Disabled</div>
        <Button variant="secondary" size="small" onClick={() => navigate('/plugins')}>Open Marketplace</Button>
      </div>
    );
  }
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="widget-body">
      <div className="widget-limits-container">
        <div>Projects: <strong>{stats.projectCount}</strong></div>
        <div style={{ marginTop: '0.5rem' }}>Issues: <strong>{stats.issueCount}</strong></div>
      </div>
      <div className="widget-footer" style={{ marginTop: '1rem' }}>
        <Button variant="secondary" size="small" onClick={() => navigate('/projects')}>Open App</Button>
      </div>
    </div>
  );
};

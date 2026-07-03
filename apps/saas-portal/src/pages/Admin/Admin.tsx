import { useEffect, useState } from 'react';
import './Admin.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api/v1`;

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOGS' | 'TICKETS'>('OVERVIEW');
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [token, setToken] = useState(localStorage.getItem('atlas_token') || '');
  const [isAuth, setIsAuth] = useState(!!token);

  useEffect(() => {
    if (isAuth) {
      fetchMetrics();
      fetchLogs();
      fetchTickets();
    }
  }, [isAuth]);

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/metrics`, { headers });
      if (res.ok) setMetrics(await res.json());
      else if (res.status === 401) setIsAuth(false);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/logs`, { headers });
      if (res.ok) setLogs(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tickets`, { headers });
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleResolveTicket = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/tickets/${id}/resolve`, { 
        method: 'POST',
        headers 
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
      }
    } catch (e) { console.error(e); }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/auth/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.data?.accessToken) {
        localStorage.setItem('atlas_token', data.data.accessToken);
        setToken(data.data.accessToken);
        setIsAuth(true);
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Failed to connect to authentication server.');
    }
  };

  if (!isAuth) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2>Super Admin Login</h2>
          <p>Please enter your system admin credentials to access the God View.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {loginError && <div style={{ color: '#a4262c', fontSize: '0.85rem' }}>{loginError}</div>}
            <button type="submit" className="btn btn-primary">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">Atlas God View</div>
        <nav>
          <button className={activeTab === 'OVERVIEW' ? 'active' : ''} onClick={() => setActiveTab('OVERVIEW')}>Overview & Clients</button>
          <button className={activeTab === 'LOGS' ? 'active' : ''} onClick={() => setActiveTab('LOGS')}>Global Event Logs</button>
          <button className={activeTab === 'TICKETS' ? 'active' : ''} onClick={() => setActiveTab('TICKETS')}>Support Inbox ({tickets.filter(t => t.status === 'OPEN').length})</button>
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem('atlas_token'); setIsAuth(false); }}>Logout</button>
        </div>
      </aside>

      <main className="admin-content">
        {activeTab === 'OVERVIEW' && (
          <div className="tab-pane fade-in">
            <header className="admin-header">
              <h1>Platform Overview</h1>
            </header>
            
            <div className="metrics-cards">
              <div className="card">
                <h3>Total Organizations</h3>
                <div className="value">{metrics?.totalOrganizations || 0}</div>
              </div>
              <div className="card">
                <h3>Total MRR</h3>
                <div className="value">${metrics?.monthlyRecurringRevenue?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            <h2>Client Valuation & Health</h2>
            <div className="card-table">
              <table>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Slug</th>
                    <th>Users</th>
                    <th>Audit Events</th>
                    <th>Health Score</th>
                    <th>MRR</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.organizations?.map((org: any) => (
                    <tr key={org.id}>
                      <td style={{ fontWeight: 'bold' }}>{org.name}</td>
                      <td>{org.slug}</td>
                      <td>{org.usersCount}</td>
                      <td>{org.auditLogsCount}</td>
                      <td>
                        <span className={`health-badge ${org.healthScore < 50 ? 'danger' : 'good'}`}>
                          {org.healthScore.toFixed(0)}%
                        </span>
                      </td>
                      <td>${org.mrr.toFixed(2)}</td>
                      <td><span className="status-badge">{org.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="tab-pane fade-in">
            <header className="admin-header">
              <h1>Global Event Logs</h1>
              <p>Real-time feed of all activities across all tenant organizations.</p>
            </header>
            <div className="logs-list">
              {logs.map((log: any) => (
                <div key={log.id} className={`log-item level-${log.level.toLowerCase()}`}>
                  <div className="log-time">{new Date(log.createdAt).toLocaleString()}</div>
                  <div className="log-source">[{log.source}]</div>
                  <div className="log-message">{log.message}</div>
                </div>
              ))}
              {logs.length === 0 && <p>No system logs found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'TICKETS' && (
          <div className="tab-pane fade-in">
            <header className="admin-header">
              <h1>Support Inbox</h1>
            </header>
            <div className="tickets-grid">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className={`ticket-card status-${ticket.status.toLowerCase()}`}>
                  <div className="ticket-header">
                    <h4>{ticket.subject}</h4>
                    <span className="badge">{ticket.status}</span>
                  </div>
                  <div className="ticket-org">From: <strong>{ticket.organization.name}</strong> (MRR: ${ticket.organization.mrr})</div>
                  <p className="ticket-desc">{ticket.description}</p>
                  <div className="ticket-footer">
                    <span className="date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.status === 'OPEN' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleResolveTicket(ticket.id)}>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && <p>No support tickets found.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

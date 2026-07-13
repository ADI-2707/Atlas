import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import './Admin.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const API_URL = BASE_URL.replace(/\/$/, '');

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOGS' | 'TICKETS'>('OVERVIEW');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light';
  });
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [clientPage, setClientPage] = useState(1);
  const [clientFilter, setClientFilter] = useState('');
  const [debouncedClientFilter, setDebouncedClientFilter] = useState('');
  const [token, setToken] = useState(localStorage.getItem('atlas_token') || '');
  const [isAuth, setIsAuth] = useState(!!token);

  useEffect(() => {
    if (isAuth) {
      fetchMetrics();
      fetchLogs();
      fetchTickets();
    }
  }, [isAuth]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedClientFilter(clientFilter);
      setClientPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [clientFilter]);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/metrics`, { headers });
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      } else if (res.status === 401) {
        setIsAuth(false);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/logs`, { headers });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tickets`, { headers });
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
      }
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

  const filteredClients = (metrics?.organizations || [])
    .filter((org: any) => org.name.toLowerCase().includes(debouncedClientFilter.toLowerCase()) || org.slug.toLowerCase().includes(debouncedClientFilter.toLowerCase()))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalClientPages = Math.ceil(filteredClients.length / 10) || 1;
  const paginatedClients = filteredClients.slice((clientPage - 1) * 10, clientPage * 10);

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
    <div className={`saas-admin-dashboard theme-${theme}`}>
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-brand">
          {!isCollapsed && <span>Atlas God View</span>}
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav>
          <button className={activeTab === 'OVERVIEW' ? 'active' : ''} onClick={() => setActiveTab('OVERVIEW')} title="Overview & Clients">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            {!isCollapsed && <span>Overview & Clients</span>}
          </button>
          <button className={activeTab === 'LOGS' ? 'active' : ''} onClick={() => setActiveTab('LOGS')} title="Global Event Logs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {!isCollapsed && <span>Global Event Logs</span>}
          </button>
          <button className={activeTab === 'TICKETS' ? 'active' : ''} onClick={() => setActiveTab('TICKETS')} title="Support Inbox">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {!isCollapsed && <span>Support Inbox ({tickets.filter(t => t.status === 'OPEN').length})</span>}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
            {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('atlas_token'); setIsAuth(false); }} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
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

            <h2>Top 5 High-Value Clients</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'var(--font-sm)' }}>
              Ranking based on a blended Value Score: MRR (60%), User Adoption (20%), and Health (20%).
            </p>

            {metrics?.topClients && metrics.topClients.length > 0 && (
              <div className="top-clients-section">
                <div className="chart-container" style={{ width: '100%', height: 350, backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.topClients}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-tertiary)" />
                      <YAxis dataKey="name" type="category" width={150} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}
                      />
                      <Legend />
                      <Bar dataKey="mrr" name="MRR ($)" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="usersCount" name="Users" fill="#107c41" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card-table" style={{ marginBottom: '3rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Client</th>
                        <th>MRR</th>
                        <th>Users</th>
                        <th>Health</th>
                        <th>Value Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topClients.map((client: any, index: number) => (
                        <tr key={`top-${client.id}`}>
                          <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>#{index + 1}</td>
                          <td style={{ fontWeight: 'bold' }}>{client.name}</td>
                          <td>${client.mrr.toFixed(2)}</td>
                          <td>{client.usersCount}</td>
                          <td>
                            <span className={`health-badge ${client.healthScore < 50 ? 'danger' : 'good'}`}>
                              {client.healthScore.toFixed(0)}%
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{client.valueScore}/100</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.4rem 0.8rem', fontSize: 'var(--font-xs)', borderRadius: 'var(--radius-sm)' }}
                              onClick={() => console.log(`Selected ${client.name} for marketing campaign. Email extraction to follow in phase 2.`)}
                            >
                              Add to Campaign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Clients & Health</h2>
              <input
                type="text"
                placeholder="Filter by name or slug..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '250px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
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
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((org: any) => (
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
                      <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                Showing {(clientPage - 1) * 10 + 1} to {Math.min(clientPage * 10, filteredClients.length)} of {filteredClients.length} clients
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={clientPage === 1}
                  onClick={() => setClientPage(p => Math.max(1, p - 1))}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: clientPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={clientPage === totalClientPages}
                  onClick={() => setClientPage(p => Math.min(totalClientPages, p + 1))}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: clientPage === totalClientPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
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

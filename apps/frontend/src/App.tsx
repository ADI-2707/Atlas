import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from '@atlas/auth';
import { PluginProvider } from './contexts/PluginContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/Layout/AppLayout';
import { usePlugins } from './contexts/PluginContext';
import { Login } from './pages/Login/Login';
import { Setup } from './pages/Setup/Setup';
import { PluginStore } from './pages/Store/PluginStore';
import { Welcome } from './pages/Welcome/Welcome';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AuditLogs } from './pages/AuditLogs/AuditLogs';
import { Admin } from './pages/Admin/Admin';
import { Team } from './pages/Team/Team';


import { InventoryDashboard as Inventory } from '../../../plugins/inventory/frontend/src';
import CRM from '../../../plugins/crm/frontend/src';
import HR from '../../../plugins/hr/frontend/src';
import Analytics from '../../../plugins/analytics/frontend/src';
import { ProjectManagement } from '../../../plugins/project-management/frontend/src';

const LayoutGuard: React.FC = () => {
  const { installedPlugins, isLoadingPlugins } = usePlugins();
  const location = useLocation();

  if (isLoadingPlugins) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#fff' }}>Loading Atlas...</div>;
  }

  // Allow access to welcome, dashboard, store, and logs even if no plugins are installed
  if (installedPlugins.length === 0 && location.pathname !== '/' && location.pathname !== '/logs' && !location.pathname.startsWith('/store')) {
    return <Navigate to="/welcome" replace />;
  }
  return <AppLayout />;
};

const SetupGuard: React.FC<{ children: React.ReactNode, requireSetup?: boolean }> = ({ children, requireSetup = true }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading || !user) return <>{children}</>;

  if (requireSetup && !user.hasCompletedSetup && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }
  
  if (!requireSetup && user.hasCompletedSetup && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AnalyticsWrapper: React.FC = () => {
  const { allPlugins } = usePlugins();
  const analyticsPlugin = allPlugins.find(p => p.id === 'analytics');
  const activeBackendTier = analyticsPlugin?.config?.tier || 'free';
  
  let tier: 'free' | 'pro' | 'business' | 'enterprise' = 'free';
  if (activeBackendTier === 'tier1') tier = 'pro';
  else if (activeBackendTier === 'tier2') tier = 'business';
  else if (activeBackendTier === 'tier3') tier = 'enterprise';
  
  return <Analytics tier={tier} />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PluginProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/setup" element={
                <ProtectedRoute fallback={<Navigate to="/login" replace />}>
                  <SetupGuard requireSetup={false}>
                    <Setup />
                  </SetupGuard>
                </ProtectedRoute>
              } />

              <Route path="/welcome" element={
                <ProtectedRoute fallback={<Navigate to="/login" replace />}>
                  <SetupGuard>
                    <Welcome />
                  </SetupGuard>
                </ProtectedRoute>
              } />

              <Route
                path="/"
                element={
                  <ProtectedRoute fallback={<Navigate to="/login" replace />}>
                    <SetupGuard>
                      <LayoutGuard />
                    </SetupGuard>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="team" element={<Team />} />

                <Route path="logs" element={<AuditLogs />} />
                <Route path="admin" element={<Admin />} />
                <Route path="store" element={<PluginStore />} />
                <Route path="store/:pluginId" element={<PluginStore />} />
                <Route path="inventory/*" element={<Inventory />} />
                <Route path="crm/*" element={<CRM />} />
                <Route path="hr/*" element={<HR />} />
                <Route path="analytics/*" element={<AnalyticsWrapper />} />
                <Route path="projects/*" element={<ProjectManagement />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PluginProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

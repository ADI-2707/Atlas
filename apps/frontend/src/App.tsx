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

const Inventory = () => <div><h2>Inventory Plugin</h2><p>Loaded from @atlas/plugin-inventory</p></div>;
const CRM = () => <div><h2>CRM Plugin</h2><p>Loaded from @atlas/plugin-crm</p></div>;

const LayoutGuard: React.FC = () => {
  const { installedPlugins } = usePlugins();
  const location = useLocation();

  if (installedPlugins.length === 0 && location.pathname === '/') {
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
                <Route path="store" element={<PluginStore />} />
                <Route path="store/:pluginId" element={<PluginStore />} />
                <Route path="inventory/*" element={<Inventory />} />
                <Route path="crm/*" element={<CRM />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PluginProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

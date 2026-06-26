import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@atlas/auth';
import { PluginProvider } from './contexts/PluginContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Login/Login';

const Dashboard = () => <div><h2>Dashboard</h2><p>Welcome to Atlas OS Workspace</p></div>;
const Inventory = () => <div><h2>Inventory Plugin</h2><p>Loaded from @atlas/plugin-inventory</p></div>;
const CRM = () => <div><h2>CRM Plugin</h2><p>Loaded from @atlas/plugin-crm</p></div>;

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PluginProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute fallback={<Navigate to="/login" replace />}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory/*" element={<Inventory />} />
              <Route path="crm/*" element={<CRM />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PluginProvider>
    </AuthProvider>
  );
};

export default App;

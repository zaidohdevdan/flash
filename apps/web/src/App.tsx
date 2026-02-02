import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateReport } from './pages/CreateReport';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { Home } from './pages/Home';
import { Toaster } from 'react-hot-toast';

import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';

// Placeholders for now

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string | string[] }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user?.role || '')) {
      if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
      if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
      if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
      if (user?.role === 'MANAGER') return <Navigate to="/manager-dashboard" />;
    }
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
    if (user?.role === 'MANAGER') return <Navigate to="/manager-dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/dashboard" element={
        <PrivateRoute role="SUPERVISOR">
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/create-report" element={
        <PrivateRoute role="PROFESSIONAL">
          <CreateReport />
        </PrivateRoute>
      } />

      <Route path="/admin-dashboard" element={
        <PrivateRoute role="ADMIN">
          <AdminDashboard />
        </PrivateRoute>
      } />

      <Route path="/manager-dashboard" element={
        <PrivateRoute role="MANAGER">
          <ManagerDashboard />
        </PrivateRoute>
      } />

      <Route path="/analytics" element={
        <PrivateRoute role={['SUPERVISOR', 'MANAGER']}>
          <Analytics />
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute role={['SUPERVISOR', 'MANAGER', 'PROFESSIONAL', 'ADMIN']}>
          <Profile />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

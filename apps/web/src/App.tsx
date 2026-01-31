import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateReport } from './pages/CreateReport';
import { AdminDashboard } from './pages/AdminDashboard';
import { Home } from './pages/Home';
import { Toaster } from 'react-hot-toast';

// Placeholders for now

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
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
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

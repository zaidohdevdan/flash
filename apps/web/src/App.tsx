import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CreateReport = lazy(() => import('./pages/CreateReport').then(m => ({ default: m.CreateReport })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));

// Loading Component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">Carregando Flash...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

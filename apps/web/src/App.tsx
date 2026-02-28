import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { UserSettingsEffects } from './components/UserSettingsEffects';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const CreateReport = lazy(() => import('./pages/CreateReport').then(m => ({ default: m.CreateReport })));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings'));

// Admin Modular Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement').then(m => ({ default: m.DepartmentManagement })));
const AdminTickets = lazy(() => import('./pages/admin/Tickets').then(m => ({ default: m.AdminTickets })));
const AdminAudit = lazy(() => import('./pages/admin/Audit').then(m => ({ default: m.AdminAudit })));
const AdminInbox = lazy(() => import('./pages/admin/Inbox').then(m => ({ default: m.AdminInbox })));
const AdminLogs = lazy(() => import('./pages/admin/Logs').then(m => ({ default: m.Logs })));
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));

// Supervisor Modular Pages
const SupervisorLayout = lazy(() => import('./layouts/SupervisorLayout').then(m => ({ default: m.SupervisorLayout })));
const SupervisorIntelligence = lazy(() => import('./pages/supervisor/Intelligence').then(m => ({ default: m.Intelligence })));
const SupervisorOperations = lazy(() => import('./pages/supervisor/Operations').then(m => ({ default: m.Operations })));
const SupervisorSchedule = lazy(() => import('./pages/supervisor/Schedule').then(m => ({ default: m.Schedule })));
const SupervisorSupport = lazy(() => import('./pages/supervisor/Support').then(m => ({ default: m.Support })));
const SupervisorArchive = lazy(() => import('./pages/supervisor/Archive').then(m => ({ default: m.Archive })));
const SupervisorChat = lazy(() => import('./pages/supervisor/Chat').then(m => ({ default: m.SupervisorChat })));
const SupervisorConference = lazy(() => import('./pages/supervisor/Conference').then(m => ({ default: m.Conference })));

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
      if (user?.role === 'ADMIN') return <Navigate to="/admin/overview" />;
      if (user?.role === 'SUPERVISOR') return <Navigate to="/supervisor/intelligence" />;
      if (user?.role === 'PROFESSIONAL') return <Navigate to="/dashboard" />;
      if (user?.role === 'MANAGER') return <Navigate to="/manager-dashboard" />;
    }
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/overview" />;
    if (user?.role === 'SUPERVISOR') return <Navigate to="/supervisor/intelligence" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/dashboard" />; // Note: The old professional route /create-report is now bound to /dashboard visually for them
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
        <PrivateRoute role={['PROFESSIONAL', 'SUPERVISOR']}>
          {/* Default fallback for legacy endpoints / professional specific dashboard */}
          {useAuth().user?.role === 'SUPERVISOR' ? <Navigate to="/supervisor/intelligence" replace /> : <CreateReport />}
        </PrivateRoute>
      } />

      <Route path="/create-report" element={<Navigate to="/dashboard" replace />} />

      {/* Supervisor Central Hub */}
      <Route path="/supervisor" element={<PrivateRoute role="SUPERVISOR"><SupervisorLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="intelligence" replace />} />
        <Route path="intelligence" element={<SupervisorIntelligence />} />
        <Route path="operations" element={<SupervisorOperations />} />
        <Route path="schedule" element={<SupervisorSchedule />} />
        <Route path="support" element={<SupervisorSupport />} />
        <Route path="archive" element={<SupervisorArchive />} />
        <Route path="chat" element={<SupervisorChat />} />
        <Route path="conference" element={<SupervisorConference />} />
      </Route>

      {/* Admin Central Hub */}
      <Route path="/admin-dashboard" element={<Navigate to="/admin/overview" />} />
      <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminLayout /></PrivateRoute>}>
        <Route path="overview" element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>


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

      <Route path="/settings" element={
        <PrivateRoute role={['SUPERVISOR', 'MANAGER', 'PROFESSIONAL', 'ADMIN']}>
          <Settings />
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

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserSettingsEffects />
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

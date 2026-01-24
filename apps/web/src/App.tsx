import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';

// Placeholders for now
const Dashboard = () => <div className="p-4"><h1>Dashboard (Supervisor)</h1></div>;
const CreateReport = () => <div className="p-4"><h1>Novo Relatório (Profissional)</h1></div>;

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (role && user?.role !== role) {
    // Se tentar acessar rota de outro papel, manda para a correta dele
    if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'SUPERVISOR') return <Navigate to="/dashboard" />;
    if (user?.role === 'PROFESSIONAL') return <Navigate to="/create-report" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

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
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

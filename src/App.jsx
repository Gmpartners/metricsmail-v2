import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Seus contextos originais
import { AuthContextProvider } from "./contexts/AuthContext";
import { useAuthContext } from "./hooks/useAuthContext";
import { MetricsProvider } from "./contexts/MetricsContext";

// Componentes do novo template
import DefaultLayout from './layout/DefaultLayout';

// Suas páginas adaptadas
import Dashboard from './pages/Dashboard';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Settings from './pages/Settings/Settings';
import Accounts from './pages/Accounts';
import Metrics from './pages/Metrics';

const AppRoutes = () => {
  const { user, authIsReady } = useAuthContext();

  if (!authIsReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <MetricsProvider>
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DefaultLayout>
      </MetricsProvider>
    );
  } else {
    return (
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    );
  }
};

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthContextProvider>
  );
}

export default App;
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, Menu, Flame, AlertCircle, RefreshCw, Loader } from 'lucide-react';
import './index.css';
import './styles/styles.css';

import { AuthContextProvider } from "./contexts/AuthContext";
import { useAuthContext } from "./hooks/useAuthContext";
import { MetricsProvider, useMetrics } from "./contexts/MetricsContext";

import { EmailSidebar } from './components/EmailSidebar.jsx';


import DashboardOverview from './pages/Dashboard/DashboardOverview';
import DashboardMetrics from './pages/Dashboard/DashboardMetrics';
import DashboardEmails from './pages/Dashboard/DashboardEmails';
import AccountCreate from './pages/Settings/AccountCreate';

import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';

const DashboardContent = () => {
  const navigate = useNavigate();
  const { 
    data, 
    emailMetricsLoading, 
    dateRange, 
    setDateRange,
    selectedCampaign, 
    setSelectedCampaign,
    selectedMautic, 
    setSelectedMautic,
    showBounced, 
    setShowBounced,
    activeView,
    setActiveView,
    isFiltering,
    loadError,
    refreshData,
    resetFiltersAndRetry,
    loadAttempts,
    noDataAvailable,
    accounts
  } = useMetrics();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const mainContentRef = useRef(null);
  const location = useLocation();
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setCollapsed(true);
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };
    
    console.log('Setting up responsive behavior');
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const applyStaggerAnimation = () => {
    if (mainContentRef.current) {
      const staggerItems = mainContentRef.current.querySelectorAll('.stagger-item');
      
      if (staggerItems.length === 0) {
        console.log('No stagger items found');
        return;
      }
      
      console.log(`Applying stagger animation to ${staggerItems.length} items`);
      staggerItems.forEach((item, index) => {
        item.classList.remove('stagger-item-visible');
        setTimeout(() => {
          item.classList.add('stagger-item-visible');
        }, 100 + (index * 80));
      });
    }
  };
  
  useEffect(() => {
    console.log('Initial mount animation');
    setTimeout(() => {
      setMounted(true);
      applyStaggerAnimation();
    }, 200);
  }, []);
  
  useEffect(() => {
    console.log(`Route changed to: ${location.pathname}`);
    applyStaggerAnimation();
    
    const pathToView = {
      '/': 'overview',
      '/overview': 'overview',
      '/metrics': 'metrics',
      '/emails': 'emails',
      '/settings': 'settings',
      '/accounts/create': 'settings'
    };
    
    if (pathToView[location.pathname]) {
      setActiveView(pathToView[location.pathname]);
    }
  }, [location.pathname, setActiveView]);
  
  useEffect(() => {
    if (data && data.emailData && data.emailData.length > 0 && !initialLoadComplete) {
      console.log('Initial data loaded successfully');
      setInitialLoadComplete(true);
      setTimeout(() => {
        setIsLoaded(true);
      }, 300);
    }
  }, [data, initialLoadComplete]);
  
  useEffect(() => {
    const forceLoadTimer = setTimeout(() => {
      if (!isLoaded) {
        console.log('Force completing load after timeout');
        setIsLoaded(true);
      }
    }, 6000);
    
    return () => clearTimeout(forceLoadTimer);
  }, [isLoaded]);
  
  const toggleMobileSidebar = () => {
    console.log(`Toggle mobile sidebar: ${!sidebarVisible}`);
    setSidebarVisible(!sidebarVisible);
  };
  
  const dashboardProps = {
    data,
    filteredData: data?.dailyData,
    emailFilteredData: data?.emailData,
    dateRange, 
    setDateRange,
    selectedCampaign, 
    setSelectedCampaign,
    selectedMautic, 
    setSelectedMautic,
    showBounced, 
    setShowBounced,
    isFiltering,
    refreshData,
    resetFiltersAndRetry,
    noDataAvailable
  };
  
  const isSettingsRoute = location.pathname === '/settings' || 
                        location.pathname === '/accounts/create';
  
  if ((emailMetricsLoading && !loadError && loadAttempts < 3) && !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-dark-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl animate-pulse"></div>
            <div className="animate-pulse-glow">
              <Flame className="h-16 w-16 text-orange-500 relative z-10" />
            </div>
          </div>
          <div className="text-center animate-fadeInUp">
            <h2 className="text-2xl font-bold text-white mb-2">Carregando Dashboard</h2>
            <p className="text-slate-400">Preparando seus dados de email marketing...</p>
          </div>
          <div className="mt-6">
            <div className="spinner-modern"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-dark-primary)' }}>
        <div className="flex flex-col items-center gap-4 max-w-lg mx-auto p-6 bg-slate-800 rounded-lg shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar dados</h2>
            <p className="text-slate-300 mb-4">{loadError}</p>
            
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-300 mb-2">
                Parece que estamos tendo problemas com os filtros selecionados. 
                Tentar resetar os filtros pode resolver o problema.
              </p>
              <button
                onClick={resetFiltersAndRetry}
                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Resetar filtros e tentar novamente
              </button>
            </div>
            
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }
  


  return (
    <div className={`flex h-screen overflow-hidden ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 relative`} style={{ background: 'var(--bg-dark-primary)' }}>
      {isFiltering && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="spinner-modern"></div>
              <p className="text-white">Atualizando dados...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className={`sidebar-container h-full ${isMobile ? 'fixed z-50' : 'relative'} 
        ${isMobile && !sidebarVisible ? 'translate-x-[-100%]' : 'translate-x-0'} 
        transition-transform duration-300 ease-in-out sidebar-modern`}>
        <div 
          className={`h-full transition-all duration-300 ease-in-out overflow-hidden ${
            collapsed ? "w-[70px]" : "w-[240px]"
          } relative`}
        >
          <EmailSidebar 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>
      </div>

      {!isMobile && (
        <div 
          className="absolute top-28 left-0 z-[60] transform"
          style={{
            left: collapsed ? '59px' : '229px',
            transition: 'left 0.3s ease-in-out'
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-6 h-6 rounded-full 
                      text-white shadow-lg border-2 animate-pulse-glow
                      hover:bg-orange-700 transition-colors"
            style={{ 
              background: 'bg-blue-600',
              borderColor: 'var(--bg-dark-primary)'
            }}
          >
            {collapsed ? (
              <ChevronsRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronsLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}

      {isMobile && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarVisible(false)}
        ></div>
      )}

      <main 
        ref={mainContentRef}
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        style={{ background: 'var(--bg-dark-primary)' }}
      >
        {isMobile && (
          <button
            onClick={toggleMobileSidebar}
            className="fixed top-4 left-4 z-30 text-white rounded-lg p-2 shadow-lg button-modern"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        <Routes>
          <Route path="/" element={<DashboardOverview {...dashboardProps} />} />
          <Route path="/overview" element={<Navigate to="/" replace />} />
          <Route path="/metrics" element={<DashboardMetrics {...dashboardProps} />} />
          <Route path="/emails" element={<DashboardEmails {...dashboardProps} />} />
          <Route path="/settings" element={<AccountCreate />} />
          <Route path="/accounts/create" element={<AccountCreate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {isMobile && (
          <button
            className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full
                      text-white flex items-center justify-center shadow-lg hover:bg-orange-700 
                      transition-all duration-200 transform hover:scale-105 button-modern animate-pulse-glow"
            style={{ background: 'var(--gradient-orange)' }}
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <span className="text-2xl font-bold">↑</span>
          </button>
        )}
      </main>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { user, authIsReady } = useAuthContext();

  if (!authIsReady) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-dark-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl animate-pulse"></div>
            <Flame className="h-16 w-16 text-orange-500 relative z-10" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Carregando</h2>
            <p className="text-slate-400">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <MetricsProvider>
        <DashboardContent />
      </MetricsProvider>
    );
  } else {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
};

function App() {
  console.log('Dashboard Mautic App initializing');
  
  return (
    <AuthContextProvider>
      <Router>
        <AuthenticatedRoutes />
      </Router>
    </AuthContextProvider>
  );
}

export default App;
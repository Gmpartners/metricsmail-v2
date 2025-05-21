import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  BarChart2, 
  Home, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Calendar, 
  Inbox, 
  Flame,
  BadgePercent
} from 'lucide-react';

// Import getInitials from utils as default import
import getInitials from '../utils/getInitials';

// Import authentication hooks
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';

// Named export for the EmailSidebar
export const EmailSidebar = ({ collapsed = false, setCollapsed, activeView, setActiveView }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  // Use the real auth hook to get user data
  const { user } = useAuthContext();
  const { logout } = useLogout();
  
  // Logout function using the real hook
  const handleLogout = () => {
    logout();
  };
  
  // Main navigation items
  const mainNavItems = [
    { id: 'overview', icon: BarChart2, label: 'Métricas', path: '/' },  
    { id: 'emails', icon: Mail, label: 'Emails', path: '/emails' },
  ];
  
  // Admin navigation items
  const adminNavItems = [
    { id: 'settings', icon: Settings, label: 'Configurações', path: '/settings' },
  ];
  
  // Check if an item is active
  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/overview')) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  // Handler for navigation click
  const handleNavClick = (path, id) => {
    navigate(path);
    // Se setActiveView foi fornecido como prop, atualize-o
    if (setActiveView) {
      setActiveView(id);
    }
  };
  
  return (
    <div 
      ref={sidebarRef}
      className="h-full flex flex-col bg-gradient-to-b from-[#0c1020] to-[#131a32] border-r border-white/8 relative"
    >
      {/* Logo Section */}
      <div className={`flex items-center py-6 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Flame className="text-white h-5 w-5" />
          </div>
          
          {!collapsed && (
            <span className="ml-3 text-white text-lg font-semibold tracking-tight">
              Email Insights
            </span>
          )}
        </div>
      </div>
      
      {/* User Profile */}
      <div className={`mx-3 mb-6 flex items-center p-3 rounded-xl bg-[#202942]/60 backdrop-blur-md border border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <div 
          className="relative"
          onMouseEnter={() => setActiveTooltip('user')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-medium">
              {user?.displayName ? getInitials(user.displayName).slice(0, 2) : "U"}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#202942] shadow-sm"></div>
          
          {/* User Tooltip for collapsed mode */}
          {collapsed && activeTooltip === 'user' && (
            <div className="absolute left-full ml-2 z-50 bg-[#202942]/90 backdrop-blur-md text-white text-xs rounded-lg p-3 shadow-xl min-w-[160px] border border-white/10 animate-fade-in">
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#202942]/90 border-b-[6px] border-b-transparent"></div>
              <p className="font-semibold">{user?.displayName || "Usuário"}</p>
              <p className="text-blue-400 text-xs mt-0.5">{user?.email || "Carregando..."}</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-white font-medium truncate">{user?.displayName || "Usuário"}</p>
            <p className="text-blue-400 text-xs truncate">{user?.email || "Carregando..."}</p>
          </div>
        )}
        
        {!collapsed && (
          <button className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 px-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <li key={item.id}
                onMouseEnter={() => setActiveTooltip(item.id)}
                onMouseLeave={() => setActiveTooltip(null)}
                className="transform transition-transform duration-200 hover:scale-[1.02]"
              >
                {/* Button style based on active state */}
                <button 
                  onClick={() => handleNavClick(item.path, item.id)}
                  className={`w-full flex items-center relative py-3 rounded-xl transition-all duration-300 ease-out 
                  ${active 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'} 
                  ${collapsed ? 'justify-center px-2' : 'px-3'}`}
                >
                  <div className="flex-shrink-0">
                    <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  </div>
                  
                  {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
                  
                  {/* Badge indicator */}
                  {item.badge && (
                    <span className={`${collapsed ? 'absolute top-0 right-0' : 'ml-auto'} 
                      bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm
                      ${active && 'bg-white text-indigo-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
                
                {/* Tooltip for collapsed mode */}
                {collapsed && activeTooltip === item.id && (
                  <div className="absolute left-full ml-2 z-50 bg-[#202942]/90 backdrop-blur-md text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap border border-white/10 animate-fade-in">
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#202942]/90 border-b-[6px] border-b-transparent"></div>
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        
        {/* Admin Section Header */}
        {!collapsed && (
          <div className="mt-8 mb-3 px-3 text-xs font-medium text-indigo-300/60 uppercase tracking-wider">
            Administração
          </div>
        )}
        
        {/* Admin Navigation */}
        <ul className={`space-y-2 ${collapsed ? 'mt-8' : 'mt-0'}`}>
          {adminNavItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <li key={item.id}
                onMouseEnter={() => setActiveTooltip(item.id)}
                onMouseLeave={() => setActiveTooltip(null)}
                className="transform transition-transform duration-200 hover:scale-[1.02]"
              >
                <button 
                  onClick={() => handleNavClick(item.path, item.id)}
                  className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 ease-out
                  ${active 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'} 
                  ${collapsed ? 'justify-center px-2' : 'px-3'}`}
                >
                  <div className="flex-shrink-0">
                    <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  </div>
                  
                  {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
                
                {/* Tooltip for collapsed mode */}
                {collapsed && activeTooltip === item.id && (
                  <div className="absolute left-full ml-2 z-50 bg-[#202942]/90 backdrop-blur-md text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap border border-white/10 animate-fade-in">
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#202942]/90 border-b-[6px] border-b-transparent"></div>
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Status and Logout */}
      <div className="mt-auto py-4 border-t border-white/10">
        {/* Status indicator */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute top-0 left-0 opacity-75"></div>
              </div>
              <span className="ml-2 text-xs text-green-400/90">Todas Contas Conectadas</span>
            </div>
          </div>
        )}
        
        {/* Logout button */}
        <div className="px-3 mt-1">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300 ease-out 
            ${collapsed ? 'justify-center px-2' : 'px-3'}`}
            onMouseEnter={() => setActiveTooltip('logout')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex-shrink-0">
              <LogOut className={`${collapsed ? 'w-6 h-6' : 'w-5 w-5'}`} />
            </div>
            
            {!collapsed && <span className="ml-3 font-medium">Sair</span>}
            
            {/* Tooltip for collapsed mode */}
            {collapsed && activeTooltip === 'logout' && (
              <div className="absolute left-full ml-2 z-50 bg-[#202942]/90 backdrop-blur-md text-rose-400 text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap border border-white/10 animate-fade-in">
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#202942]/90 border-b-[6px] border-b-transparent"></div>
                Sair
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* CSS para animações */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 9999px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
        }
      `}</style>
    </div>
  );
}
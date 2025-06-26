import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart3,
  CreditCard,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Sun,
  Moon,
  Building2
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menu de navegação baseado no sistema real
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Visão geral e KPIs'
    },
    {
      name: 'Fluxo de Caixa',
      href: '/fluxo-caixa',
      icon: TrendingUp,
      description: 'Extrato diário'
    },
    {
      name: 'Cartões',
      href: '/cartoes',
      icon: CreditCard,
      description: 'Gestão de cartões'
    },
    {
      name: 'Receitas',
      href: '/fontes-renda',
      icon: DollarSign,
      description: 'Receitas por fonte'
    },
    {
      name: 'Contas a Pagar',
      href: '/contas-pagar',
      icon: Calendar,
      description: 'Gestão de pagamentos'
    },
    {
      name: 'Contas a Receber',
      href: '/contas-receber',
      icon: TrendingUp,
      description: 'Gestão de recebimentos'
    },
    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: FileText,
      description: 'Relatórios mensais e anuais'
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aqui você implementaria a lógica de tema
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-full bg-gray-800 border-r border-gray-700">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">HG Soluções</h1>
                <p className="text-gray-400 text-xs">Sistema Financeiro</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
            <div className="flex items-center text-sm text-gray-300">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="font-medium text-white truncate">
                  {user?.nome || 'Usuário'}
                </div>
                <div className="text-xs text-gray-400">
                  {user?.role === 'admin' ? 'Administrador' : 'Operador'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 h-16">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title for mobile */}
            <div className="lg:hidden">
              <h1 className="text-white font-semibold">
                {navigation.find(item => isActivePath(item.href))?.name || 'HG Soluções'}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.nome?.split(' ')[0] || 'Usuário'}
                  </span>
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-700">
                      <p className="text-white font-medium">{user?.nome}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/configuracoes"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Configurações
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-gray-900">
          {children}
        </main>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Layout;
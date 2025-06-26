import React, { useState, useEffect } from 'react';
import { BarChart3, CreditCard, TrendingUp, FileText, DollarSign } from 'lucide-react';

// Importar componentes reais que foram implementados com APIs
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FluxoCaixa from './components/FluxoCaixa';
import FontesRenda from './components/FontesRenda';
import Despesas from './components/Despesas';
import Relatorios from './components/Relatorios';

// Importar serviços de API
import { authService } from './services/api';
// Importar contexto de autenticação
import { useAuth } from './contextos/AuthContext.jsx.js';

// ==============================================
// COMPONENTE PRINCIPAL DO SISTEMA
// ==============================================
const HGFinancialSystem = ({ isDarkMode, setIsDarkMode, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Tabs disponíveis
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'fluxo', name: 'Fluxo de Caixa', icon: TrendingUp },
    { id: 'receitas', name: 'Receitas', icon: DollarSign },
    { id: 'despesas', name: 'Despesas', icon: CreditCard },
    { id: 'relatorios', name: 'Relatórios', icon: FileText }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HG</span>
              </div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                HG SOLUÇÕES - GESTOR FINANCEIRO
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Olá, {user.name}
              </span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard isDarkMode={isDarkMode} />}
        {activeTab === 'fluxo' && <FluxoCaixa isDarkMode={isDarkMode} />}
        {activeTab === 'receitas' && <FontesRenda isDarkMode={isDarkMode} />}
        {activeTab === 'despesas' && <Despesas isDarkMode={isDarkMode} />}
        {activeTab === 'relatorios' && <Relatorios isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
};

// ==============================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ==============================================
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Usar o contexto de autenticação para verificar estado do usuário
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
    setLoading(authLoading);
  }, [authUser, authLoading]);

  // Verificar autenticação a cada renderização
  useEffect(() => {
    const token = localStorage.getItem('hg_token');
    if (!token && !loading) {
      // Redirecionar para página de login se não estiver autenticado
      console.log("Usuário não autenticado, redirecionando para login...");
    }
  }, [loading]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('hg_token');
    }
  };

  // Mostrar carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        onLogin={handleLogin}
      />
    );
  }

  return (
    <HGFinancialSystem 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode}
      user={user}
      onLogout={handleLogout}
    />
  );
};

export default App;

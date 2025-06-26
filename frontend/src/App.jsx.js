import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import HGFinancialSystem from './components/HGFinancialSystem';
import FontesRenda from './components/FontesRenda';
import DespesasCategoria from './components/DespesasCategoria';

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Componente de Loading
const Loading = ({ isDarkMode }) => (
  <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando...</p>
    </div>
  </div>
);

// Componente principal do App
const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (loading) {
    return <Loading isDarkMode={isDarkMode} />;
  }

  if (!isAuthenticated) {
    return <Login isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
  }

  return (
    <HGFinancialSystem 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode}
      user={user}
    />
  );
};

// App principal com providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
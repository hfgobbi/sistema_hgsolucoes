import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('hg_token'));

  // Verificar se há token salvo e buscar dados do usuário
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData.user);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          localStorage.removeItem('hg_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, senha) => {
    try {
      const response = await authService.login(email, senha);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('hg_token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('hg_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        token,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
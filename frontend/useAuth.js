import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('hg_token');
        const savedUser = localStorage.getItem('hg_user');

        if (token && savedUser) {
          // Verificar se o token ainda é válido
          await authService.verifyToken();
          
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.warn('Token inválido ou expirado:', error);
        // Limpar dados inválidos
        localStorage.removeItem('hg_token');
        localStorage.removeItem('hg_user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      const { token, user: userData } = await authService.login(email, senha);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`Bem-vindo, ${userData.nome}!`);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.warn('Erro no logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      toast.success('Logout realizado com sucesso!');
    }
  };

  // Função para alterar senha
  const changePassword = async (senhaAtual, novaSenha) => {
    try {
      await authService.changePassword(senhaAtual, novaSenha);
      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro ao alterar senha. Tente novamente.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verificar se usuário é admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Verificar se usuário tem permissão
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Adicionar lógica específica de permissões aqui se necessário
    return false;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    isAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default useAuth;
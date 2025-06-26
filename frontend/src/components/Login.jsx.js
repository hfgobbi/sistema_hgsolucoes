import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = ({ isDarkMode, setIsDarkMode }) => {
  const [email, setEmail] = useState('admin@hgsolucoes.com');
  const [senha, setSenha] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">HG</span>
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            HG Soluções
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema Financeiro
          </p>
        </div>

        {/* Formulário */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-8 px-6 shadow-xl rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="admin@hgsolucoes.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="admin123"
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Informações de acesso */}
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Acesso de Demonstração:
            </h4>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>Email:</strong> admin@hgsolucoes.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </div>
        </div>

        {/* Toggle Dark Mode */}
        <div className="text-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
        </div>

        {/* Status da API */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              API: http://localhost:3000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
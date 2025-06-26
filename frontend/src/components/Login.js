import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '../services/api';

const Login = ({ isDarkMode, setIsDarkMode, onLogin }) => {
  const [email, setEmail] = useState('admin@hgsolucoes.com');
  const [senha, setSenha] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    try {
      // Login real utilizando a API
      const resposta = await authService.login(email, senha);
      if (resposta.token) {
        onLogin({ name: resposta.usuario?.nome || 'Administrador', email: resposta.usuario?.email || email });
      } else {
        setErro('Erro de autenticação. Verifique suas credenciais.');
      }
    } catch (error) {
      setErro(error.message || 'Falha ao tentar fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-8 p-8">
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

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-8 px-6 shadow-xl rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {erro && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{erro}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="admin@hgsolucoes.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="admin123"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
          </form>

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

        <div className="text-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

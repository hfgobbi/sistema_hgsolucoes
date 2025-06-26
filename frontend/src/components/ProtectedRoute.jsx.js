import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn, Loader2, Building2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.senha);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'admin@hgsolucoes.com',
      senha: 'admin123'
    });
    
    const result = await login('admin@hgsolucoes.com', 'admin123');
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Sistema desenvolvido especificamente para HG Soluções
          </p>
          <p className="text-gray-600 text-xs mt-1">
            v1.0.0 - Baseado nas planilhas reais da empresa
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            HG Soluções
          </h1>
          <p className="text-gray-400">
            Sistema Financeiro
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Fazer Login
            </h2>
            <p className="text-gray-400 text-sm">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label 
                htmlFor="senha" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.senha 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-400">{errors.senha}</p>
              )}
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Login Demo */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center border border-gray-600"
          >
            Usar Conta Demo
          </button>

          {/* Credenciais Demo */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Credenciais Demo:
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p><strong>Email:</strong> admin@hgsolucoes.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </div>
        </div>

        {
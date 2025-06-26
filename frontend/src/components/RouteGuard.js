import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente de guarda de rotas para proteger contra acesso não autenticado
const RouteGuard = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('hg_token');
    
    // Se não houver token, redirecionar para login
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  
  return <>{children}</>;
};

export default RouteGuard;

import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3000/api';

// URL para WebSockets, se necessário
const WS_URL = 'ws://localhost:3000/ws';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token a cada requisição e logs de diagnóstico
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log para ajudar no diagnóstico
    console.log(`Requisição para ${config.url}:`, {
      method: config.method,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    // console.log(`Resposta de ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('hg_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ==============================================
// SERVIÇOS DE AUTENTICAÇÃO
// ==============================================
export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    if (response.token) {
      localStorage.setItem('hg_token', response.token);
    }
    return response;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('hg_token');
  },

  getProfile: () => api.get('/auth/me'),

  changePassword: (senhaAtual, novaSenha) => 
    api.put('/auth/change-password', { senhaAtual, novaSenha }),
};

// ==============================================
// SERVIÇOS DO DASHBOARD
// ==============================================
export const dashboardService = {
  getKPIs: (ano, mes) => api.get('/dashboard/kpis', { params: { ano, mes } }),
  getFluxoMensal: (ano) => api.get('/dashboard/fluxo-mensal', { params: { ano } }),
  getFluxoDiario: (ano, mes) => api.get('/dashboard/fluxo-diario', { params: { ano, mes } }),
  getCartoesResumo: () => api.get('/dashboard/cartoes-resumo'),
  getMetasVsRealizado: (ano, mes) => api.get('/dashboard/metas-vs-realizado', { params: { ano, mes } }),
  getProximosVencimentos: (dias = 7) => api.get('/dashboard/proximos-vencimentos', { params: { dias } }),
};

// ==============================================
// SERVIÇOS DE CARTÕES
// ==============================================
export const cartoesService = {
  getAll: (filtros = {}) => api.get('/cartoes', { params: filtros }),
  getById: (id) => api.get(`/cartoes/${id}`),
  create: (dados) => api.post('/cartoes', dados),
  update: (id, dados) => api.put(`/cartoes/${id}`, dados),
  delete: (id) => api.delete(`/cartoes/${id}`),
  getExtrato: (id, ano) => api.get(`/cartoes/${id}/extrato`, { params: { ano } }),
  ativar: (id) => api.post(`/cartoes/${id}/ativar`),
};

// ==============================================
// SERVIÇOS DE FONTES DE RENDA
// ==============================================
export const fontesRendaService = {
  getAll: (filtros = {}) => api.get('/fontes-renda', { params: filtros }),
  getById: (id) => api.get(`/fontes-renda/${id}`),
  create: (dados) => api.post('/fontes-renda', dados),
  update: (id, dados) => api.put(`/fontes-renda/${id}`, dados),
  delete: (id) => api.delete(`/fontes-renda/${id}`),
  getHistorico: (id, ano, limite = 50) => api.get(`/fontes-renda/${id}/historico`, { params: { ano, limite } }),
  getComparativo: (ano) => api.get('/fontes-renda/comparativo/mensal', { params: { ano } }),
  ativar: (id) => api.post(`/fontes-renda/${id}/ativar`),
  getTipos: () => api.get('/fontes-renda/tipos/opcoes'),
  // Método usado pelo hook useFontesRenda - alias para getAll
  listarFontesRenda: (filtros = {}) => api.get('/fontes-renda', { params: filtros }),
  // Método usado pelo hook useFonteRenda - alias para getById
  getFonte: (id) => api.get(`/fontes-renda/${id}`),
};

// ==============================================
// SERVIÇOS DE LANÇAMENTOS
// ==============================================
export const lancamentosService = {
  getAll: (filtros = {}) => api.get('/lancamentos', { params: filtros }),
  getById: (id) => api.get(`/lancamentos/${id}`),
  create: (dados) => api.post('/lancamentos', dados),
  update: (id, dados) => api.put(`/lancamentos/${id}`, dados),
  delete: (id) => api.delete(`/lancamentos/${id}`),
  createLote: (lancamentos) => api.post('/lancamentos/lote', { lancamentos }),
  getResumoCategorias: (ano, mes) => api.get('/lancamentos/resumo/categorias', { params: { ano, mes } }),
  getExtratoDiario: (ano, mes) => api.get('/lancamentos/extrato/diario', { params: { ano, mes } }),
  getBalancete: (ano, mes) => api.get('/lancamentos/balancete', { params: { ano, mes } }),
};

// ==============================================
// SERVIÇOS DE CONTAS A PAGAR
// ==============================================
export const contasPagarService = {
  getAll: (filtros = {}) => api.get('/contas-pagar', { params: filtros }),
  getById: (id) => api.get(`/contas-pagar/${id}`),
  create: (dados) => api.post('/contas-pagar', dados),
  update: (id, dados) => api.put(`/contas-pagar/${id}`, dados),
  delete: (id) => api.delete(`/contas-pagar/${id}`),
  pagar: (id, dados) => api.post(`/contas-pagar/${id}/pagar`, dados),
  getProximosVencimentos: (dias = 7) => api.get('/contas-pagar/vencimentos/proximos', { params: { dias } }),
  getResumoCartoes: (status = 'pendente', ano, mes) => api.get('/contas-pagar/resumo/cartoes', { params: { status, ano, mes } }),
};

// ==============================================
// SERVIÇOS DE CONTAS A RECEBER
// ==============================================
export const contasReceberService = {
  getAll: (filtros = {}) => api.get('/contas-receber', { params: filtros }),
  getById: (id) => api.get(`/contas-receber/${id}`),
  create: (dados) => api.post('/contas-receber', dados),
  update: (id, dados) => api.put(`/contas-receber/${id}`, dados),
  delete: (id) => api.delete(`/contas-receber/${id}`),
  receber: (id, dados) => api.post(`/contas-receber/${id}/receber`, dados),
  getProximosVencimentos: (dias = 7) => api.get('/contas-receber/vencimentos/proximos', { params: { dias } }),
  getResumoFontes: (status = 'pendente', ano, mes) => api.get('/contas-receber/resumo/fontes', { params: { status, ano, mes } }),
  getInadimplencia: () => api.get('/contas-receber/inadimplencia'),
};

// ==============================================
// SERVIÇOS DE RELATÓRIOS
// ==============================================
export const relatoriosService = {
  getAnual: (ano) => api.get('/relatorios/anual', { params: { ano } }),
  getMensal: (ano, mes) => api.get('/relatorios/mensal', { params: { ano, mes } }),
  getFluxoCaixa: (ano) => api.get('/relatorios/fluxo-caixa', { params: { ano } }),
  getCartoesExtrato: (ano) => api.get('/relatorios/cartoes-extrato', { params: { ano } }),
  getMetasPerformance: (ano) => api.get('/relatorios/metas-performance', { params: { ano } }),
  getFornecedores: (ano, categoria) => api.get('/relatorios/fornecedores', { params: { ano, categoria } }),
  // Método usado pelo componente Relatórios - alias para getMensal
  getRelatorioMensal: (ano, mes) => api.get('/relatorios/mensal', { params: { ano, mes } }),
  // Método para download de relatório em PDF
  baixarRelatorio: (ano, mes) => api.get('/relatorios/mensal/download', { params: { ano, mes }, responseType: 'blob' }),
};

// ==============================================
// SERVIÇOS DE FLUXO DE CAIXA
// ==============================================
export const fluxoCaixaService = {
  getAll: (filtros = {}) => api.get('/fluxo-caixa', { params: filtros }),
  getById: (id) => api.get(`/fluxo-caixa/${id}`),
  create: (dados) => api.post('/fluxo-caixa', dados),
  update: (id, dados) => api.put(`/fluxo-caixa/${id}`, dados),
  delete: (id) => api.delete(`/fluxo-caixa/${id}`),
  // Método usado pelo hook useFluxoCaixa - alias para getAll
  getFluxoCaixa: (filtros = {}) => api.get('/fluxo-caixa', { params: filtros }),
  // Métodos usados pelo hook useFluxoCaixaMutations
  criarFluxoDiario: (dados) => api.post('/fluxo-caixa', dados),
  atualizarFluxoDiario: (id, dados) => api.put(`/fluxo-caixa/${id}`, dados),
};

// ==============================================
// HOOKS CUSTOMIZADOS PARA REACT QUERY
// ==============================================
export const useAuth = () => {
  const token = localStorage.getItem('hg_token');
  return {
    isAuthenticated: !!token,
    token,
  };
};

// Função para verificar se API está online
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  } catch (error) {
    return { status: 'ERROR', message: error.message };
  }
};

// Função para download de relatórios
export const downloadReport = async (endpoint, filename) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    throw error;
  }
};

export default api;
import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base da API
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://sua-api.com/api' 
    : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('hg_token');
      localStorage.removeItem('hg_user');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
      return Promise.reject(error);
    }
    
    if (response?.status === 403) {
      toast.error('Acesso negado. Você não tem permissão para esta ação.');
      return Promise.reject(error);
    }
    
    if (response?.status === 429) {
      toast.error('Muitas tentativas. Aguarde um momento e tente novamente.');
      return Promise.reject(error);
    }
    
    if (response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      return Promise.reject(error);
    }
    
    // Erro customizado da API
    if (response?.data?.error) {
      toast.error(response.data.error);
      return Promise.reject(error);
    }
    
    // Erro de rede
    if (!response) {
      toast.error('Erro de conexão. Verifique sua internet.');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// =============================================
// SERVIÇOS DE AUTENTICAÇÃO
// =============================================
export const authService = {
  // Login
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user } = response.data;
      
      localStorage.setItem('hg_token', token);
      localStorage.setItem('hg_user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Erro no logout:', error);
    } finally {
      localStorage.removeItem('hg_token');
      localStorage.removeItem('hg_user');
    }
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('hg_token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('hg_user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Alterar senha
  async changePassword(senhaAtual, novaSenha) {
    try {
      const response = await api.put('/auth/change-password', {
        senhaAtual,
        novaSenha
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DO DASHBOARD
// =============================================
export const dashboardService = {
  // KPIs principais
  async getKPIs(ano, mes) {
    try {
      const response = await api.get('/dashboard/kpis', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fluxo mensal
  async getFluxoMensal(ano) {
    try {
      const response = await api.get('/dashboard/fluxo-mensal', {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resumo dos cartões
  async getCartoesResumo() {
    try {
      const response = await api.get('/dashboard/cartoes-resumo');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Metas vs realizado
  async getMetasVsRealizado(ano, mes) {
    try {
      const response = await api.get('/dashboard/metas-vs-realizado', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Próximos vencimentos
  async getProximosVencimentos(dias = 7) {
    try {
      const response = await api.get('/dashboard/proximos-vencimentos', {
        params: { dias }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DOS CARTÕES
// =============================================
export const cartoesService = {
  // Listar cartões
  async getCartoes(filtros = {}) {
    try {
      const response = await api.get('/cartoes', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter cartão por ID
  async getCartao(id) {
    try {
      const response = await api.get(`/cartoes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar cartão
  async criarCartao(dados) {
    try {
      const response = await api.post('/cartoes', dados);
      toast.success('Cartão criado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar cartão
  async atualizarCartao(id, dados) {
    try {
      const response = await api.put(`/cartoes/${id}`, dados);
      toast.success('Cartão atualizado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Desativar cartão
  async desativarCartao(id) {
    try {
      const response = await api.delete(`/cartoes/${id}`);
      toast.success('Cartão desativado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Extrato do cartão
  async getExtrato(id, ano) {
    try {
      const response = await api.get(`/cartoes/${id}/extrato`, {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DAS FONTES DE RENDA
// =============================================
export const fontesRendaService = {
  // Listar fontes
  async getFontes(filtros = {}) {
    try {
      const response = await api.get('/fontes-renda', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter fonte por ID
  async getFonte(id) {
    try {
      const response = await api.get(`/fontes-renda/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar fonte
  async criarFonte(dados) {
    try {
      const response = await api.post('/fontes-renda', dados);
      toast.success('Fonte de renda criada com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar fonte
  async atualizarFonte(id, dados) {
    try {
      const response = await api.put(`/fontes-renda/${id}`, dados);
      toast.success('Fonte de renda atualizada com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Histórico da fonte
  async getHistorico(id, ano) {
    try {
      const response = await api.get(`/fontes-renda/${id}/historico`, {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Comparativo mensal
  async getComparativo(ano) {
    try {
      const response = await api.get('/fontes-renda/comparativo/mensal', {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DOS LANÇAMENTOS
// =============================================
export const lancamentosService = {
  // Listar lançamentos
  async getLancamentos(filtros = {}) {
    try {
      const response = await api.get('/lancamentos', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter lançamento por ID
  async getLancamento(id) {
    try {
      const response = await api.get(`/lancamentos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar lançamento
  async criarLancamento(dados) {
    try {
      const response = await api.post('/lancamentos', dados);
      toast.success('Lançamento criado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar múltiplos lançamentos
  async criarLancamentosLote(lancamentos) {
    try {
      const response = await api.post('/lancamentos/lote', { lancamentos });
      toast.success(`${lancamentos.length} lançamentos criados com sucesso!`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar lançamento
  async atualizarLancamento(id, dados) {
    try {
      const response = await api.put(`/lancamentos/${id}`, dados);
      toast.success('Lançamento atualizado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excluir lançamento
  async excluirLancamento(id) {
    try {
      const response = await api.delete(`/lancamentos/${id}`);
      toast.success('Lançamento excluído com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Extrato diário
  async getExtratoDiario(ano, mes) {
    try {
      const response = await api.get('/lancamentos/extrato/diario', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resumo por categorias
  async getResumoCategorias(ano, mes) {
    try {
      const response = await api.get('/lancamentos/resumo/categorias', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Balancete
  async getBalancete(ano, mes) {
    try {
      const response = await api.get('/lancamentos/balancete', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DAS CONTAS A PAGAR
// =============================================
export const contasPagarService = {
  // Listar contas a pagar
  async getContas(filtros = {}) {
    try {
      const response = await api.get('/contas-pagar', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter conta por ID
  async getConta(id) {
    try {
      const response = await api.get(`/contas-pagar/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar conta a pagar
  async criarConta(dados) {
    try {
      const response = await api.post('/contas-pagar', dados);
      toast.success('Conta a pagar criada com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar conta
  async atualizarConta(id, dados) {
    try {
      const response = await api.put(`/contas-pagar/${id}`, dados);
      toast.success('Conta atualizada com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar como paga
  async pagarConta(id, dados) {
    try {
      const response = await api.post(`/contas-pagar/${id}/pagar`, dados);
      toast.success('Conta marcada como paga!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Próximos vencimentos
  async getProximosVencimentos(dias = 7) {
    try {
      const response = await api.get('/contas-pagar/vencimentos/proximos', {
        params: { dias }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resumo por cartões
  async getResumoCartoes(status, ano, mes) {
    try {
      const response = await api.get('/contas-pagar/resumo/cartoes', {
        params: { status, ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DAS CONTAS A RECEBER
// =============================================
export const contasReceberService = {
  // Listar contas a receber
  async getContas(filtros = {}) {
    try {
      const response = await api.get('/contas-receber', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter conta por ID
  async getConta(id) {
    try {
      const response = await api.get(`/contas-receber/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar conta a receber
  async criarConta(dados) {
    try {
      const response = await api.post('/contas-receber', dados);
      toast.success('Conta a receber criada com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar como recebida
  async receberConta(id, dados) {
    try {
      const response = await api.post(`/contas-receber/${id}/receber`, dados);
      toast.success('Conta marcada como recebida!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Relatório de inadimplência
  async getInadimplencia() {
    try {
      const response = await api.get('/contas-receber/inadimplencia');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DOS RELATÓRIOS
// =============================================
export const relatoriosService = {
  // Relatório anual
  async getRelatorioAnual(ano) {
    try {
      const response = await api.get('/relatorios/anual', {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Relatório mensal
  async getRelatorioMensal(ano, mes) {
    try {
      const response = await api.get('/relatorios/mensal', {
        params: { ano, mes }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fluxo de caixa
  async getFluxoCaixa(ano) {
    try {
      const response = await api.get('/relatorios/fluxo-caixa', {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Performance das metas
  async getMetasPerformance(ano) {
    try {
      const response = await api.get('/relatorios/metas-performance', {
        params: { ano }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Relatório de fornecedores
  async getFornecedores(ano, categoria) {
    try {
      const response = await api.get('/relatorios/fornecedores', {
        params: { ano, categoria }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// =============================================
// SERVIÇOS DO FLUXO DE CAIXA
// =============================================
export const fluxoCaixaService = {
  // Obter fluxo de caixa
  async getFluxoCaixa(filtros = {}) {
    try {
      const response = await api.get('/fluxo-caixa', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar lançamento diário
  async criarFluxoDiario(dados) {
    try {
      const response = await api.post('/fluxo-caixa', dados);
      toast.success('Fluxo de caixa atualizado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar fluxo diário
  async atualizarFluxoDiario(id, dados) {
    try {
      const response = await api.put(`/fluxo-caixa/${id}`, dados);
      toast.success('Fluxo de caixa atualizado com sucesso!');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  dashboardService,
  cartoesService,
  fontesRendaService,
  lancamentosService,
  contasPagarService,
  contasReceberService,
  relatoriosService,
  fluxoCaixaService
} from '../services/api';

// =============================================
// HOOKS DO DASHBOARD
// =============================================
export const useDashboardKPIs = (ano, mes) => {
  return useQuery(
    ['dashboard', 'kpis', ano, mes],
    () => dashboardService.getKPIs(ano, mes),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    }
  );
};

export const useFluxoMensal = (ano) => {
  return useQuery(
    ['dashboard', 'fluxo-mensal', ano],
    () => dashboardService.getFluxoMensal(ano),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useCartoesResumo = () => {
  return useQuery(
    ['dashboard', 'cartoes-resumo'],
    () => dashboardService.getCartoesResumo(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutos
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useMetasVsRealizado = (ano, mes) => {
  return useQuery(
    ['dashboard', 'metas-vs-realizado', ano, mes],
    () => dashboardService.getMetasVsRealizado(ano, mes),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useProximosVencimentos = (dias = 7) => {
  return useQuery(
    ['dashboard', 'proximos-vencimentos', dias],
    () => dashboardService.getProximosVencimentos(dias),
    {
      staleTime: 1 * 60 * 1000, // 1 minuto
      cacheTime: 3 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    }
  );
};

// =============================================
// HOOKS DOS CARTÕES
// =============================================
export const useCartoes = (filtros = {}) => {
  return useQuery(
    ['cartoes', filtros],
    () => cartoesService.getCartoes(filtros),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useCartao = (id) => {
  return useQuery(
    ['cartoes', id],
    () => cartoesService.getCartao(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useExtratoCartao = (id, ano) => {
  return useQuery(
    ['cartoes', id, 'extrato', ano],
    () => cartoesService.getExtrato(id, ano),
    {
      enabled: !!id && !!ano,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useCartaoMutations = () => {
  const queryClient = useQueryClient();

  const criarCartao = useMutation(cartoesService.criarCartao, {
    onSuccess: () => {
      queryClient.invalidateQueries(['cartoes']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  const atualizarCartao = useMutation(
    ({ id, dados }) => cartoesService.atualizarCartao(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['cartoes']);
        queryClient.invalidateQueries(['cartoes', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
      },
    }
  );

  const desativarCartao = useMutation(cartoesService.desativarCartao, {
    onSuccess: () => {
      queryClient.invalidateQueries(['cartoes']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  return {
    criarCartao,
    atualizarCartao,
    desativarCartao,
  };
};

// =============================================
// HOOKS DAS FONTES DE RENDA
// =============================================
export const useFontesRenda = (filtros = {}) => {
  return useQuery(
    ['fontes-renda', filtros],
    () => fontesRendaService.getFontes(filtros),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useFonteRenda = (id) => {
  return useQuery(
    ['fontes-renda', id],
    () => fontesRendaService.getFonte(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useHistoricoFonte = (id, ano) => {
  return useQuery(
    ['fontes-renda', id, 'historico', ano],
    () => fontesRendaService.getHistorico(id, ano),
    {
      enabled: !!id && !!ano,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useComparativoFontes = (ano) => {
  return useQuery(
    ['fontes-renda', 'comparativo', ano],
    () => fontesRendaService.getComparativo(ano),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useFonteRendaMutations = () => {
  const queryClient = useQueryClient();

  const criarFonte = useMutation(fontesRendaService.criarFonte, {
    onSuccess: () => {
      queryClient.invalidateQueries(['fontes-renda']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  const atualizarFonte = useMutation(
    ({ id, dados }) => fontesRendaService.atualizarFonte(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['fontes-renda']);
        queryClient.invalidateQueries(['fontes-renda', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
      },
    }
  );

  return {
    criarFonte,
    atualizarFonte,
  };
};

// =============================================
// HOOKS DOS LANÇAMENTOS
// =============================================
export const useLancamentos = (filtros = {}) => {
  return useQuery(
    ['lancamentos', filtros],
    () => lancamentosService.getAll(filtros),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useLancamento = (id) => {
  return useQuery(
    ['lancamentos', id],
    () => lancamentosService.getLancamento(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useExtratoDiario = (ano, mes) => {
  return useQuery(
    ['lancamentos', 'extrato-diario', ano, mes],
    () => lancamentosService.getExtratoDiario(ano, mes),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useResumoCategorias = (ano, mes) => {
  return useQuery(
    ['lancamentos', 'resumo-categorias', ano, mes],
    () => lancamentosService.getResumoCategorias(ano, mes),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useBalancete = (ano, mes) => {
  return useQuery(
    ['lancamentos', 'balancete', ano, mes],
    () => lancamentosService.getBalancete(ano, mes),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useLancamentoMutations = () => {
  const queryClient = useQueryClient();

  const criarLancamento = useMutation(lancamentosService.criarLancamento, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lancamentos']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['relatorios']);
    },
  });

  const criarLancamentosLote = useMutation(lancamentosService.criarLancamentosLote, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lancamentos']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['relatorios']);
    },
  });

  const atualizarLancamento = useMutation(
    ({ id, dados }) => lancamentosService.atualizarLancamento(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['lancamentos']);
        queryClient.invalidateQueries(['lancamentos', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['relatorios']);
      },
    }
  );

  const excluirLancamento = useMutation(lancamentosService.excluirLancamento, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lancamentos']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['relatorios']);
    },
  });

  return {
    criarLancamento,
    criarLancamentosLote,
    atualizarLancamento,
    excluirLancamento,
  };
};

// =============================================
// HOOKS DAS CONTAS A PAGAR
// =============================================
export const useContasPagar = (filtros = {}) => {
  return useQuery(
    ['contas-pagar', filtros],
    () => contasPagarService.getContas(filtros),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useContaPagar = (id) => {
  return useQuery(
    ['contas-pagar', id],
    () => contasPagarService.getConta(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useProximosVencimentosPagar = (dias = 7) => {
  return useQuery(
    ['contas-pagar', 'proximos-vencimentos', dias],
    () => contasPagarService.getProximosVencimentos(dias),
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 3 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    }
  );
};

export const useResumoCartoesContas = (status, ano, mes) => {
  return useQuery(
    ['contas-pagar', 'resumo-cartoes', status, ano, mes],
    () => contasPagarService.getResumoCartoes(status, ano, mes),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useContaPagarMutations = () => {
  const queryClient = useQueryClient();

  const criarConta = useMutation(contasPagarService.criarConta, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contas-pagar']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['cartoes']);
    },
  });

  const atualizarConta = useMutation(
    ({ id, dados }) => contasPagarService.atualizarConta(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['contas-pagar']);
        queryClient.invalidateQueries(['contas-pagar', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['cartoes']);
      },
    }
  );

  const pagarConta = useMutation(
    ({ id, dados }) => contasPagarService.pagarConta(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['contas-pagar']);
        queryClient.invalidateQueries(['contas-pagar', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['cartoes']);
        queryClient.invalidateQueries(['lancamentos']);
      },
    }
  );

  return {
    criarConta,
    atualizarConta,
    pagarConta,
  };
};

// =============================================
// HOOKS DAS CONTAS A RECEBER
// =============================================
export const useContasReceber = (filtros = {}) => {
  return useQuery(
    ['contas-receber', filtros],
    () => contasReceberService.getContas(filtros),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useContaReceber = (id) => {
  return useQuery(
    ['contas-receber', id],
    () => contasReceberService.getConta(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useInadimplencia = () => {
  return useQuery(
    ['contas-receber', 'inadimplencia'],
    () => contasReceberService.getInadimplencia(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

export const useContaReceberMutations = () => {
  const queryClient = useQueryClient();

  const criarConta = useMutation(contasReceberService.criarConta, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contas-receber']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['fontes-renda']);
    },
  });

  const receberConta = useMutation(
    ({ id, dados }) => contasReceberService.receberConta(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['contas-receber']);
        queryClient.invalidateQueries(['contas-receber', variables.id]);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['fontes-renda']);
        queryClient.invalidateQueries(['lancamentos']);
      },
    }
  );

  return {
    criarConta,
    receberConta,
  };
};

// =============================================
// HOOKS DOS RELATÓRIOS
// =============================================
export const useRelatorioAnual = (ano) => {
  return useQuery(
    ['relatorios', 'anual', ano],
    () => relatoriosService.getRelatorioAnual(ano),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

export const useRelatorioMensal = (ano, mes) => {
  return useQuery(
    ['relatorios', 'mensal', ano, mes],
    () => relatoriosService.getRelatorioMensal(ano, mes),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );
};

export const useFluxoCaixaRelatorio = (ano) => {
  return useQuery(
    ['relatorios', 'fluxo-caixa', ano],
    () => relatoriosService.getFluxoCaixa(ano),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

export const useMetasPerformance = (ano) => {
  return useQuery(
    ['relatorios', 'metas-performance', ano],
    () => relatoriosService.getMetasPerformance(ano),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

export const useFornecedoresRelatorio = (ano, categoria) => {
  return useQuery(
    ['relatorios', 'fornecedores', ano, categoria],
    () => relatoriosService.getFornecedores(ano, categoria),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

// =============================================
// HOOKS DO FLUXO DE CAIXA
// =============================================
export const useFluxoCaixa = (filtros = {}) => {
  return useQuery(
    ['fluxo-caixa', filtros],
    () => fluxoCaixaService.getFluxoCaixa(filtros),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const useFluxoCaixaMutations = () => {
  const queryClient = useQueryClient();

  const criarFluxoDiario = useMutation(fluxoCaixaService.criarFluxoDiario, {
    onSuccess: () => {
      queryClient.invalidateQueries(['fluxo-caixa']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['lancamentos']);
    },
  });

  const atualizarFluxoDiario = useMutation(
    ({ id, dados }) => fluxoCaixaService.atualizarFluxoDiario(id, dados),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['fluxo-caixa']);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['lancamentos']);
      },
    }
  );

  return {
    criarFluxoDiario,
    atualizarFluxoDiario,
  };
};

// =============================================
// HOOK GENÉRICO PARA INVALIDAR QUERIES
// =============================================
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  const invalidateDashboard = () => {
    queryClient.invalidateQueries(['dashboard']);
  };

  const invalidateCartoes = () => {
    queryClient.invalidateQueries(['cartoes']);
  };

  const invalidateLancamentos = () => {
    queryClient.invalidateQueries(['lancamentos']);
  };

  const invalidateRelatorios = () => {
    queryClient.invalidateQueries(['relatorios']);
  };

  return {
    invalidateAll,
    invalidateDashboard,
    invalidateCartoes,
    invalidateLancamentos,
    invalidateRelatorios,
  };
};
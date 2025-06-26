import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, DollarSign, FileText, Filter, BarChart3, RefreshCw } from 'lucide-react';
import { useLancamentos, useResumoCategorias, useExtratoDiario, useBalancete } from '../hooks/useApi';

const LancamentosContabeis = ({ isDarkMode }) => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('mes_atual');
  
  // Obter data atual para filtros
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = dataAtual.getMonth() + 1;
  
  // Buscar dados da API
  const { data: lancamentosData, isLoading: lancamentosLoading, error: lancamentosError, refetch: refetchLancamentos } = useLancamentos({});
  const { data: resumoCategoriasData, isLoading: resumoCategoriasLoading } = useResumoCategorias(anoAtual, mesAtual);
  const { data: extratoDiarioData, isLoading: extratoDiarioLoading } = useExtratoDiario(anoAtual, mesAtual);
  const { data: balanceteData, isLoading: balanceteLoading } = useBalancete(anoAtual, mesAtual);

  // Verificar se temos dados carregados
  const lancamentos = useMemo(() => {
    if (!lancamentosData) return [];
    return lancamentosData.map(l => ({
      id: l.id,
      data: new Date(l.data),
      tipo: l.tipoLancamento,
      descricao: l.descricao,
      valor: Number(l.valor),
      categoria: l.categoria || 'SEM CATEGORIA',
      contaDebito: l.contaDebito?.nome || 'N/A',
      contaCredito: l.contaCredito?.nome || 'N/A',
      observacoes: l.observacao || ''
    }));
  }, [lancamentosData]);

  // Categorias extraídas dos dados reais
  const categorias = useMemo(() => {
    if (!lancamentosData) return ['RECEITAS', 'MATERIAL', 'SERVIÇOS', 'ADM', 'CARRO', 'MKT', 'DESP_CASA', 'FINANCEIRO'];
    return [...new Set(lancamentosData.map(l => l.categoria || 'SEM CATEGORIA'))];
  }, [lancamentosData]);

  const getLancamentosFiltrados = () => {
    return lancamentos.filter(lancamento => {
      // Filtrar por tipo
      if (filtroTipo !== 'todos' && lancamento.tipo !== filtroTipo) {
        return false;
      }
      
      // Filtrar por categoria
      if (filtroCategoria !== 'todos' && lancamento.categoria !== filtroCategoria) {
        return false;
      }
      
      // Filtro de período
      if (periodoFiltro === 'hoje') {
        const hoje = new Date();
        if (lancamento.data.toDateString() !== hoje.toDateString()) {
          return false;
        }
      } else if (periodoFiltro === 'semana') {
        const agora = new Date();
        const semanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (lancamento.data < semanaAtras) {
          return false;
        }
      } else if (periodoFiltro === 'mes_atual') {
        const dataLancamento = new Date(lancamento.data);
        if (dataLancamento.getMonth() !== dataAtual.getMonth() || 
            dataLancamento.getFullYear() !== dataAtual.getFullYear()) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Calcular totais com base nos lançamentos filtrados
  const calcularTotais = (lancamentosFiltrados) => {
    const receitas = lancamentosFiltrados
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);
      
    const despesas = lancamentosFiltrados
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);
      
    return { receitas, despesas, saldo: receitas - despesas };
  };

  const lancamentosFiltrados = useMemo(() => getLancamentosFiltrados(), [lancamentos, filtroTipo, filtroCategoria, periodoFiltro]);
  const totais = useMemo(() => calcularTotais(lancamentosFiltrados), [lancamentosFiltrados]);
  
  // Estados de loading e error
  const isLoading = lancamentosLoading || resumoCategoriasLoading || extratoDiarioLoading || balanceteLoading;

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'receita':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'despesa':
        return <DollarSign className="w-4 h-4 text-red-600" />;
      case 'transferencia':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'receita': return 'text-green-600 bg-green-100';
      case 'despesa': return 'text-red-600 bg-red-100';
      case 'transferencia': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Carregamento */}
      {isLoading && (
        <div className="flex items-center justify-center p-6 bg-blue-50 mb-4 rounded-lg">
          <RefreshCw className="animate-spin mr-2" />
          <span>Carregando dados...</span>
        </div>
      )}
      
      {/* Mensagem de Erro */}
      {lancamentosError && (
        <div className="flex items-center justify-center p-6 bg-red-50 text-red-700 mb-4 rounded-lg">
          <span>Erro ao carregar dados: {lancamentosError.message || 'Erro desconhecido'}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Lançamentos Contábeis
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Controle de débitos e créditos
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Saldo Período</p>
              <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totais.saldo)}
              </p>
              <p className="text-xs text-gray-500">
                {totais.saldo >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
            <BarChart3 className={`w-8 h-8 ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totais.receitas)}
              </p>
              <p className="text-xs text-gray-500">
                {lancamentosFiltrados.filter(l => l.tipo === 'receita').length} lançamentos
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totais.despesas)}
              </p>
              <p className="text-xs text-gray-500">
                {lancamentosFiltrados.filter(l => l.tipo === 'despesa').length} lançamentos
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
            <option value="transferencia">Transferências</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Categoria
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="todos">Todas</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Período
          </label>
          <select
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="mes_atual">Mês Atual</option>
            <option value="semana">Última Semana</option>
            <option value="hoje">Hoje</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => refetchLancamentos()}
            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} flex items-center gap-2`}
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Lançamentos */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Data
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descrição
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Débito
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Crédito
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valor
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoria
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lancamentosFiltrados.length > 0 ? lancamentosFiltrados.map((lancamento) => (
                <tr key={lancamento.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div>
                      <div className="font-medium">
                        {formatDate(lancamento.data)}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{lancamento.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(lancamento.tipo)}`}>
                      {getTipoIcon(lancamento.tipo)}
                      {lancamento.tipo.charAt(0).toUpperCase() + lancamento.tipo.slice(1)}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div>
                      <div className="font-medium">{lancamento.descricao}</div>
                      {lancamento.observacoes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lancamento.observacoes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-red-600 font-medium">
                    {lancamento.contaDebito}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-green-600 font-medium">
                    {lancamento.contaCredito}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold">
                    <span className={`${
                      lancamento.tipo === 'receita' ? 'text-green-600' : 
                      lancamento.tipo === 'despesa' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {formatCurrency(lancamento.valor)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      lancamento.categoria === 'RECEITAS' ? 'bg-green-100 text-green-800' :
                      lancamento.categoria === 'MATERIAL' ? 'bg-blue-100 text-blue-800' :
                      lancamento.categoria === 'SERVIÇOS' ? 'bg-purple-100 text-purple-800' :
                      lancamento.categoria === 'ADM' ? 'bg-yellow-100 text-yellow-800' :
                      lancamento.categoria === 'MKT' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lancamento.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded">
                        Editar
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 bg-gray-100 rounded">
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo por Categoria */}
      {!isLoading && resumoCategoriasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Balancete por Categoria
            </h3>
            <div className="space-y-3">
              {resumoCategoriasData.map(item => (
                <div key={item.categoria} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.categoria}
                    </span>
                    <div className="text-xs text-gray-500">
                      {item.totalLancamentos} lançamento{item.totalLancamentos !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-red-600">D: {formatCurrency(item.totalDebitos || 0)}</span>
                      </div>
                      <div>
                        <span className="text-green-600">C: {formatCurrency(item.totalCreditos || 0)}</span>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Saldo: {formatCurrency(item.saldo || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Extrato Diário
            </h3>
            <div className="space-y-3">
              {extratoDiarioData ? extratoDiarioData.slice(0, 5).map(item => (
                <div key={item.data} className="flex items-center justify-between p-2 border-l-4 border-blue-400 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-sm font-medium text-blue-800">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="text-xs text-blue-600">
                        {item.totalLancamentos} lançamentos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-600">
                      R: {formatCurrency(item.totalReceitas || 0)} | D: {formatCurrency(item.totalDespesas || 0)}
                    </div>
                    <div className={`text-sm font-bold ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Saldo: {formatCurrency(item.saldo || 0)}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-gray-500">
                  Dados do extrato diário não disponíveis.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LancamentosContabeis;

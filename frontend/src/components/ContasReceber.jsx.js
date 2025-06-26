import React, { useState } from 'react';
import { Plus, TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';

const ContasReceber = ({ isDarkMode }) => {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroFonte, setFiltroFonte] = useState('todos');

  // Fontes de renda baseadas na planilha
  const fontesRenda = [
    { id: 1, nome: 'PRODUÇÃO (UAUTELAS)', tipo: 'producao', cor: 'bg-green-600' },
    { id: 2, nome: 'HG APLICAÇÃO ACUMULADO', tipo: 'aplicacao', cor: 'bg-yellow-600' },
    { id: 3, nome: 'HG (OUTRAS RENDAS)', tipo: 'outras', cor: 'bg-blue-600' },
    { id: 4, nome: 'PRODUÇÃO (HG TELAS)', tipo: 'producao', cor: 'bg-purple-600' },
    { id: 5, nome: 'UAUTELAS (MATERIAL)', tipo: 'material', cor: 'bg-green-500' }
  ];

  // Dados de exemplo das contas a receber
  const contasReceber = [
    {
      id: 1,
      descricao: 'Produção UAUTELAS - Junho/2025',
      fonteId: 1,
      valor: 12000,
      vencimento: new Date('2025-06-30'),
      status: 'pendente',
      diasVencimento: 13
    },
    {
      id: 2,
      descricao: 'Venda Material - Cliente A',
      fonteId: 5,
      valor: 3500,
      vencimento: new Date('2025-06-20'),
      status: 'pendente',
      diasVencimento: 3
    },
    {
      id: 3,
      descricao: 'HG Telas - Projeto Especial',
      fonteId: 4,
      valor: 8500,
      vencimento: new Date('2025-06-15'),
      status: 'vencido',
      diasVencimento: -2
    },
    {
      id: 4,
      descricao: 'Aplicação HG - Rendimento',
      fonteId: 2,
      valor: 720,
      vencimento: new Date('2025-06-10'),
      status: 'recebido',
      diasVencimento: -7,
      dataRecebimento: new Date('2025-06-08'),
      valorRecebido: 720
    },
    {
      id: 5,
      descricao: 'Outras Rendas - Consultoria',
      fonteId: 3,
      valor: 1200,
      vencimento: new Date('2025-06-25'),
      status: 'pendente',
      diasVencimento: 8
    },
    {
      id: 6,
      descricao: 'UAUTELAS - Produção Maio',
      fonteId: 1,
      valor: 15000,
      vencimento: new Date('2025-06-05'),
      status: 'vencido',
      diasVencimento: -12
    },
    {
      id: 7,
      descricao: 'Material UAUTELAS - Lote 145',
      fonteId: 5,
      valor: 2800,
      vencimento: new Date('2025-06-28'),
      status: 'pendente',
      diasVencimento: 11
    },
    {
      id: 8,
      descricao: 'HG Telas - Cliente Premium',
      fonteId: 4,
      valor: 5600,
      vencimento: new Date('2025-06-18'),
      status: 'recebido',
      diasVencimento: 1,
      dataRecebimento: new Date('2025-06-17'),
      valorRecebido: 5600
    }
  ];

  const getStatusInfo = (status, diasVencimento) => {
    if (status === 'recebido') {
      return { 
        label: 'Recebido', 
        color: 'text-green-600 bg-green-100', 
        icon: CheckCircle,
        priority: 'baixa'
      };
    }
    
    if (diasVencimento < 0) {
      return { 
        label: `Vencido (${Math.abs(diasVencimento)}d)`, 
        color: 'text-red-600 bg-red-100', 
        icon: AlertTriangle,
        priority: 'critica'
      };
    }
    
    if (diasVencimento === 0) {
      return { 
        label: 'Vence Hoje', 
        color: 'text-orange-600 bg-orange-100', 
        icon: AlertTriangle,
        priority: 'alta'
      };
    }
    
    if (diasVencimento <= 7) {
      return { 
        label: `${diasVencimento}d`, 
        color: 'text-yellow-600 bg-yellow-100', 
        icon: Clock,
        priority: 'media'
      };
    }
    
    return { 
      label: `${diasVencimento}d`, 
      color: 'text-blue-600 bg-blue-100', 
      icon: Calendar,
      priority: 'baixa'
    };
  };

  const contasFiltradas = contasReceber.filter(conta => {
    const statusFiltro = filtroStatus === 'todos' || conta.status === filtroStatus;
    const fonteFiltro = filtroFonte === 'todos' || conta.fonteId?.toString() === filtroFonte;
    return statusFiltro && fonteFiltro;
  });

  const totalPendente = contasReceber.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
  const totalRecebido = contasReceber.filter(c => c.status === 'recebido').reduce((sum, c) => sum + (c.valorRecebido || 0), 0);
  const totalVencidas = contasReceber.filter(c => c.status === 'pendente' && c.diasVencimento < 0).reduce((sum, c) => sum + c.valor, 0);
  const contasVencidas = contasReceber.filter(c => c.status === 'pendente' && c.diasVencimento < 0).length;
  const contasVenceHoje = contasReceber.filter(c => c.status === 'pendente' && c.diasVencimento === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Contas a Receber
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Controle de receitas e fontes de renda
          </p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* KPIs de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>A Receber</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalPendente.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">
                {contasReceber.filter(c => c.status === 'pendente').length} contas
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Já Recebido</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalRecebido.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">
                {contasReceber.filter(c => c.status === 'recebido').length} contas
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border-l-4 border-red-500 ${isDarkMode ? 'border-r border-t border-b border-gray-700' : 'border-r border-t border-b border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inadimplência</p>
              <p className="text-2xl font-bold text-red-600">
                {contasVencidas}
              </p>
              <p className="text-xs text-red-500">
                R$ {totalVencidas.toLocaleString('pt-BR')}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border-l-4 border-orange-500 ${isDarkMode ? 'border-r border-t border-b border-gray-700' : 'border-r border-t border-b border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vence Hoje</p>
              <p className="text-2xl font-bold text-orange-600">
                {contasVenceHoje}
              </p>
              <p className="text-xs text-orange-500">Atenção!</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Status
          </label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="recebido">Recebido</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Fonte de Renda
          </label>
          <select
            value={filtroFonte}
            onChange={(e) => setFiltroFonte(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="todos">Todas</option>
            {fontesRenda.map(fonte => (
              <option key={fonte.id} value={fonte.id.toString()}>
                {fonte.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descrição
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fonte de Renda
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valor
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vencimento
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contasFiltradas.map((conta) => {
                const fonte = fontesRenda.find(f => f.id === conta.fonteId);
                const statusInfo = getStatusInfo(conta.status, conta.diasVencimento);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={conta.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>
                        <div className="font-medium">{conta.descricao}</div>
                        <div className="text-xs text-gray-500">#{conta.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {fonte && (
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded ${fonte.cor}`}></div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {fonte.tipo.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-green-600">
                      R$ {conta.valor.toLocaleString('pt-BR')}
                      {conta.status === 'recebido' && conta.valorRecebido && (
                        <div className="text-xs text-gray-500">
                          Recebido: R$ {conta.valorRecebido.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">
                      {conta.vencimento.toLocaleDateString('pt-BR')}
                      {conta.status === 'recebido' && conta.dataRecebimento && (
                        <div className="text-xs text-green-600">
                          Recebido: {conta.dataRecebimento.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {conta.status === 'pendente' && (
                          <button className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-100 rounded">
                            Receber
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise por Fonte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Receitas por Fonte
          </h3>
          <div className="space-y-3">
            {fontesRenda.map(fonte => {
              const contasFonte = contasReceber.filter(c => c.fonteId === fonte.id);
              const totalFonte = contasFonte.reduce((sum, c) => {
                if (c.status === 'recebido') return sum + (c.valorRecebido || 0);
                if (c.status === 'pendente') return sum + c.valor;
                return sum;
              }, 0);
              const pendenteFonte = contasFonte.filter(c => c.status === 'pendente').length;
              
              if (totalFonte === 0) return null;
              
              return (
                <div key={fonte.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${fonte.cor}`}></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {fonte.tipo.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      R$ {totalFonte.toLocaleString('pt-BR')}
                    </div>
                    {pendenteFonte > 0 && (
                      <div className="text-xs text-yellow-600">
                        {pendenteFonte} pendente{pendenteFonte !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Relatório de Inadimplência
          </h3>
          <div className="space-y-3">
            {contasReceber
              .filter(c => c.status === 'pendente' && c.diasVencimento < 0)
              .sort((a, b) => a.diasVencimento - b.diasVencimento)
              .slice(0, 5)
              .map(conta => {
                const fonte = fontesRenda.find(f => f.id === conta.fonteId);
                
                return (
                  <div key={conta.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <div>
                        <span className="text-sm font-medium text-red-800">
                          {conta.descricao.substring(0, 25)}...
                        </span>
                        <div className="text-xs text-red-600">
                          {Math.abs(conta.diasVencimento)} dias em atraso
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">
                        R$ {conta.valor.toLocaleString('pt-BR')}
                      </div>
                      {fonte && (
                        <div className="text-xs text-gray-600">{fonte.tipo}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            
            {contasReceber.filter(c => c.status === 'pendente' && c.diasVencimento < 0).length === 0 && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600">Nenhuma conta em atraso!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContasReceber;
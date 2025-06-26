import React, { useState } from 'react';
import { Plus, Calendar, CreditCard, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';

const ContasPagar = ({ isDarkMode }) => {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCartao, setFiltroCartao] = useState('todos');

  // Dados dos cartões baseados na planilha
  const cartoes = [
    { id: 1, nome: 'SICOOB CHEQUE ESPECIAL', vencimento: 'D30', cor: 'bg-red-500' },
    { id: 2, nome: 'NEON', vencimento: 'D5', cor: 'bg-purple-500' },
    { id: 3, nome: 'SANTANDER', vencimento: 'D15', cor: 'bg-red-600' },
    { id: 4, nome: 'SICOOBCRED', vencimento: 'D11', cor: 'bg-blue-500' },
    { id: 5, nome: 'BRASILCARD', vencimento: 'D20', cor: 'bg-yellow-600' },
    { id: 6, nome: 'FORTBRASIL', vencimento: 'D25', cor: 'bg-green-600' },
    { id: 7, nome: 'SAMSCLLUB', vencimento: 'D26', cor: 'bg-indigo-500' },
    { id: 8, nome: 'Bradesco C.BAHIA', vencimento: 'D25', cor: 'bg-orange-500' },
    { id: 9, nome: 'MELIUS', vencimento: 'D25', cor: 'bg-pink-500' },
    { id: 10, nome: 'Bradesco AMAZON', vencimento: 'D28', cor: 'bg-gray-600' },
    { id: 11, nome: 'Tomasine', vencimento: 'D10', cor: 'bg-teal-500' }
  ];

  // Dados de exemplo das contas a pagar
  const contasPagar = [
    {
      id: 1,
      descricao: 'Fatura SICOOB Junho/2025',
      categoria: 'FINANCEIRO',
      valor: 5350,
      vencimento: new Date('2025-06-30'),
      cartaoId: 1,
      status: 'pendente',
      diasVencimento: 13
    },
    {
      id: 2,
      descricao: 'Fatura NEON Junho/2025',
      categoria: 'FINANCEIRO',
      valor: 289,
      vencimento: new Date('2025-06-05'),
      cartaoId: 2,
      status: 'vencido',
      diasVencimento: -12
    },
    {
      id: 3,
      descricao: 'Fatura SANTANDER Junho/2025',
      categoria: 'FINANCEIRO',
      valor: 3493,
      vencimento: new Date('2025-06-15'),
      cartaoId: 3,
      status: 'pendente',
      diasVencimento: -2
    },
    {
      id: 4,
      descricao: 'Fatura SICOOBCRED Junho/2025',
      categoria: 'FINANCEIRO',
      valor: 1074,
      vencimento: new Date('2025-06-11'),
      cartaoId: 4,
      status: 'pendente',
      diasVencimento: -6
    },
    {
      id: 5,
      descricao: 'Fatura BRASILCARD Junho/2025',
      categoria: 'FINANCEIRO',
      valor: 1931,
      vencimento: new Date('2025-06-20'),
      cartaoId: 5,
      status: 'pendente',
      diasVencimento: 3
    },
    {
      id: 6,
      descricao: 'METALÚRGICA VERDADEIRA',
      categoria: 'MATERIAL',
      valor: 583,
      vencimento: new Date('2025-06-25'),
      cartaoId: null,
      status: 'pendente',
      diasVencimento: 8
    },
    {
      id: 7,
      descricao: 'Serviços Felipe + Deslocamento',
      categoria: 'SERVIÇOS',
      valor: 1095,
      vencimento: new Date('2025-06-28'),
      cartaoId: null,
      status: 'pendente',
      diasVencimento: 11
    },
    {
      id: 8,
      descricao: 'PIX Shopee - Materiais',
      categoria: 'MATERIAL',
      valor: 29,
      vencimento: new Date('2025-06-25'),
      cartaoId: null,
      status: 'pago',
      diasVencimento: 8
    }
  ];

  const getStatusInfo = (status, diasVencimento) => {
    if (status === 'pago') {
      return { 
        label: 'Pago', 
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

  const contasFiltradas = contasPagar.filter(conta => {
    const statusFiltro = filtroStatus === 'todos' || conta.status === filtroStatus;
    const cartaoFiltro = filtroCartao === 'todos' || conta.cartaoId?.toString() === filtroCartao;
    return statusFiltro && cartaoFiltro;
  });

  const totalPendente = contasPagar.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
  const totalVencidas = contasPagar.filter(c => c.status === 'pendente' && c.diasVencimento < 0).reduce((sum, c) => sum + c.valor, 0);
  const contasVencidas = contasPagar.filter(c => c.status === 'pendente' && c.diasVencimento < 0).length;
  const contasVenceHoje = contasPagar.filter(c => c.status === 'pendente' && c.diasVencimento === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Contas a Pagar
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Controle de cartões e contas por vencimento
          </p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* KPIs de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Pendente</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalPendente.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">
                {contasPagar.filter(c => c.status === 'pendente').length} contas
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border-l-4 border-red-500 ${isDarkMode ? 'border-r border-t border-b border-gray-700' : 'border-r border-t border-b border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vencidas</p>
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

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cartões Ativos</p>
              <p className="text-2xl font-bold text-blue-600">
                {cartoes.length}
              </p>
              <p className="text-xs text-gray-500">Cadastrados</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600" />
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
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Cartão
          </label>
          <select
            value={filtroCartao}
            onChange={(e) => setFiltroCartao(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="todos">Todos</option>
            {cartoes.map(cartao => (
              <option key={cartao.id} value={cartao.id.toString()}>
                {cartao.nome} ({cartao.vencimento})
              </option>
            ))}
            <option value="null">Sem Cartão</option>
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
                  Categoria
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cartão/Conta
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
                const cartao = cartoes.find(c => c.id === conta.cartaoId);
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
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        conta.categoria === 'MATERIAL' ? 'bg-green-100 text-green-800' :
                        conta.categoria === 'SERVIÇOS' ? 'bg-blue-100 text-blue-800' :
                        conta.categoria === 'FINANCEIRO' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conta.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {cartao ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded ${cartao.cor}`}></div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {cartao.vencimento}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Direto</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-red-600">
                      R$ {conta.valor.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">
                      {conta.vencimento.toLocaleDateString('pt-BR')}
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
                            Pagar
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

      {/* Resumo por Cartão */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`md:col-span-2 lg:col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Resumo por Cartão - Junho 2025
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cartoes.slice(0, 8).map(cartao => {
              const contasCartao = contasPagar.filter(c => c.cartaoId === cartao.id && c.status === 'pendente');
              const totalCartao = contasCartao.reduce((sum, c) => sum + c.valor, 0);
              
              if (totalCartao === 0) return null;
              
              return (
                <div key={cartao.id} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded ${cartao.cor}`}></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {cartao.vencimento}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    R$ {totalCartao.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {contasCartao.length} conta{contasCartao.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContasPagar;
import React, { useState } from 'react';
import { 
  useDashboardKPIs, 
  useFluxoMensal, 
  useCartoesResumo, 
  useMetasVsRealizado,
  useProximosVencimentos 
} from '../hooks/useApi';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());

  // Hooks para dados
  const { data: kpis, isLoading: loadingKPIs, refetch: refetchKPIs } = useDashboardKPIs(currentYear, currentMonth);
  const { data: fluxoMensal, isLoading: loadingFluxo } = useFluxoMensal(currentYear);
  const { data: cartoesResumo, isLoading: loadingCartoes } = useCartoesResumo();
  const { data: metasData, isLoading: loadingMetas } = useMetasVsRealizado(currentYear, currentMonth);
  const { data: vencimentos, isLoading: loadingVencimentos } = useProximosVencimentos(7);

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  // Cores para gráficos (baseadas na planilha)
  const coresCategorias = {
    MATERIAL: '#10b981',
    SERVIÇOS: '#3b82f6', 
    ADM: '#8b5cf6',
    CARRO: '#f97316',
    MKT: '#ec4899',
    DESP_CASA: '#6366f1'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  // Componente KPI Card
  const KPICard = ({ title, value, change, icon: Icon, trend, loading }) => (
    <div className="card-planilha">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">
              {loading ? (
                <div className="skeleton h-8 w-24"></div>
              ) : (
                formatCurrency(value || 0)
              )}
            </p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
                {trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
                {formatPercent(Math.abs(change))} vs mês anterior
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${
            trend === 'up' ? 'bg-green-600' : trend === 'down' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para cartão de meta
  const MetaCard = ({ categoria, meta, realizado, percentual, cor }) => (
    <div className="card-planilha">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-3 h-3 rounded`} style={{ backgroundColor: cor }}></div>
          <span className="text-xs text-gray-400">{categoria}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Realizado:</span>
            <span className="text-white font-medium">{formatCurrency(realizado)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Meta:</span>
            <span className="text-gray-300">{formatCurrency(meta)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                percentual > 100 ? 'bg-red-500' : percentual > 90 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentual, 100)}%` }}
            ></div>
          </div>
          <div className="text-center">
            <span className={`text-sm font-medium ${
              percentual > 100 ? 'text-red-400' : percentual > 90 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {formatPercent(percentual)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Visão geral financeira - {meses[currentMonth - 1]} {currentYear}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* Seletor de mês */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="form-input w-auto"
          >
            {meses.map((mes, index) => (
              <option key={mes} value={index + 1}>
                {mes}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => refetchKPIs()}
            className="btn-outline"
            disabled={loadingKPIs}
          >
            <RefreshCw className={`w-4 h-4 ${loadingKPIs ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Receitas do Mês"
          value={kpis?.kpis?.receitas?.total}
          icon={TrendingUp}
          trend="up"
          loading={loadingKPIs}
        />
        <KPICard
          title="Despesas do Mês"
          value={kpis?.kpis?.despesas?.total}
          icon={TrendingDown}
          trend="down"
          loading={loadingKPIs}
        />
        <KPICard
          title="Saldo do Mês"
          value={kpis?.kpis?.saldo}
          icon={DollarSign}
          trend={kpis?.kpis?.saldo >= 0 ? 'up' : 'down'}
          loading={loadingKPIs}
        />
      </div>

      {/* Gráficos e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Caixa Mensal */}
        <div className="card-planilha">
          <div className="card-planilha-header">
            <h3 className="text-lg font-semibold text-white">Fluxo de Caixa Mensal</h3>
          </div>
          <div className="card-planilha-content">
            {loadingFluxo ? (
              <div className="skeleton h-64 w-full"></div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={fluxoMensal?.fluxoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="nomeMes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [formatCurrency(value), name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="despesas" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Metas vs Realizado */}
        <div className="card-planilha">
          <div className="card-planilha-header">
            <h3 className="text-lg font-semibold text-white">Metas vs Realizado</h3>
          </div>
          <div className="card-planilha-content">
            {loadingMetas ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton h-16 w-full"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {metasData?.comparativo?.slice(0, 6).map((meta, index) => (
                  <MetaCard
                    key={meta.categoria}
                    categoria={meta.categoria}
                    meta={meta.meta}
                    realizado={meta.realizado}
                    percentual={meta.percentual}
                    cor={coresCategorias[meta.categoria] || '#6b7280'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cartões e Vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo dos Cartões */}
        <div className="card-planilha">
          <div className="card-planilha-header">
            <h3 className="text-lg font-semibold text-white">Resumo dos Cartões</h3>
          </div>
          <div className="card-planilha-content">
            {loadingCartoes ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-12 w-full"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {cartoesResumo?.cartoes?.slice(0, 5).map((cartao) => (
                  <div key={cartao.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{cartao.nome}</p>
                      <p className="text-sm text-gray-400">{cartao.vencimento}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-400">
                        {formatCurrency(cartao.totalPendente)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPercent(cartao.percentualUtilizado)} usado
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Próximos Vencimentos */}
        <div className="card-planilha">
          <div className="card-planilha-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Próximos Vencimentos</h3>
              {vencimentos?.resumo?.quantidadeAVencer > 0 && (
                <span className="badge badge-warning">
                  {vencimentos.resumo.quantidadeAVencer}
                </span>
              )}
            </div>
          </div>
          <div className="card-planilha-content">
            {loadingVencimentos ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-12 w-full"></div>
                ))}
              </div>
            ) : vencimentos?.contasAVencer?.length > 0 ? (
              <div className="space-y-3">
                {vencimentos.contasAVencer.slice(0, 5).map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{conta.descricao}</p>
                      <p className="text-sm text-gray-400">{conta.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-400">
                        {formatCurrency(conta.valor)}
                      </p>
                      <p className={`text-xs ${
                        conta.diasParaVencimento === 0 ? 'text-red-400' :
                        conta.diasParaVencimento <= 2 ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                        {conta.diasParaVencimento === 0 ? 'Vence hoje' :
                         conta.diasParaVencimento === 1 ? 'Vence amanhã' :
                         `${conta.diasParaVencimento} dias`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum vencimento próximo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Despesas por Categoria */}
      <div className="card-planilha">
        <div className="card-planilha-header">
          <h3 className="text-lg font-semibold text-white">Despesas por Categoria</h3>
        </div>
        <div className="card-planilha-content">
          {loadingKPIs ? (
            <div className="skeleton h-64 w-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis?.kpis?.despesas?.porCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="categoria" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Valor']}
                />
                <Bar 
                  dataKey="valor" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
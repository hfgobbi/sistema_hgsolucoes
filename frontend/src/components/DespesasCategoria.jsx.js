import React, { useState } from 'react';
import { Plus, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const DespesasCategoria = ({ isDarkMode }) => {
  const [selectedMonth, setSelectedMonth] = useState(5); // Junho

  // Dados reais das despesas baseados na planilha
  const categoriasDespesas = {
    MATERIAL: {
      meta: 35000,
      valores: [14730, 13500, 12800, 11200, 10500, 8900],
      cor: 'bg-green-500',
      icon: '📦'
    },
    SERVIÇOS: {
      meta: 15000,
      valores: [7675, 9296, 8227, 5435, 5050, 2085],
      cor: 'bg-blue-500',
      icon: '🔧'
    },
    ADM: {
      meta: 8000,
      valores: [2827, 1505, 1303, 1528, 1305, 1331],
      cor: 'bg-purple-500',
      icon: '🏢'
    },
    CARRO: {
      meta: 5000,
      valores: [3420, 5603, 4541, 4582, 3087, 650],
      cor: 'bg-orange-500',
      icon: '🚗'
    },
    MKT: {
      meta: 6000,
      valores: [2304, 3790, 2558, 2503, 1479, 415],
      cor: 'bg-pink-500',
      icon: '📢'
    },
    DESP_CASA: {
      meta: 12000,
      valores: [8956, 7234, 9187, 8642, 7894, 5123],
      cor: 'bg-indigo-500',
      icon: '🏠'
    }
  };

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  const calcularPercentualMeta = (valor, meta) => ((valor / meta) * 100).toFixed(1);
  const calcularTotal = (valores) => valores.reduce((sum, val) => sum + val, 0);

  const totalMesAtual = Object.values(categoriasDespesas).reduce((sum, cat) => sum + cat.valores[selectedMonth], 0);
  const totalMetasMes = Object.values(categoriasDespesas).reduce((sum, cat) => sum + cat.meta, 0);
  const totalAnual = Object.values(categoriasDespesas).reduce((sum, cat) => sum + calcularTotal(cat.valores), 0);

  const getStatusCategoria = (percentual) => {
    if (percentual > 110) return { status: 'excedido', color: 'text-red-600', icon: AlertTriangle };
    if (percentual > 90) return { status: 'proximo', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'dentro', color: 'text-green-600', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Despesas por Categoria
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Controle de gastos com metas mensais
          </p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Mês Atual</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalMesAtual.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">{meses[selectedMonth]}/2025</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Meta do Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalMetasMes.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">
                {calcularPercentualMeta(totalMesAtual, totalMetasMes)}% utilizado
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Anual</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {totalAnual.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Jan-Jun 2025</p>
            </div>
            <TrendingDown className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categorias</p>
              <p className="text-2xl font-bold text-orange-600">
                {Object.keys(categoriasDespesas).length}
              </p>
              <p className="text-xs text-gray-500">Ativas</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Seletor de Mês */}
      <div className="flex justify-center">
        <div className="flex gap-2 overflow-x-auto">
          {meses.slice(0, 6).map((mes, idx) => (
            <button
              key={mes}
              onClick={() => setSelectedMonth(idx)}
              className={`px-4 py-2 rounded font-medium ${
                idx === selectedMonth
                  ? 'bg-blue-600 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mes}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Metas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoriasDespesas).map(([categoria, dados]) => {
          const valorAtual = dados.valores[selectedMonth];
          const percentual = parseFloat(calcularPercentualMeta(valorAtual, dados.meta));
          const status = getStatusCategoria(percentual);
          const StatusIcon = status.icon;

          return (
            <div key={categoria} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${dados.cor} flex items-center justify-center text-2xl`}>
                    {dados.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {categoria.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Meta: R$ {dados.meta.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <StatusIcon className={`w-5 h-5 ${status.color}`} />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">Realizado</span>
                    <span className={`text-sm font-bold ${status.color}`}>
                      {percentual}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentual > 100 ? 'bg-red-500' : percentual > 90 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">
                    R$ {valorAtual.toLocaleString('pt-BR')}
                  </span>
                  <span className={`text-sm ${
                    valorAtual <= dados.meta ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {valorAtual <= dados.meta ? '-' : '+'}R$ {Math.abs(valorAtual - dados.meta).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela Completa */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoria
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Meta
                </th>
                {meses.slice(0, 6).map((mes, idx) => (
                  <th key={mes} className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${idx === selectedMonth ? 'bg-blue-600 text-white' : ''}`}>
                    {mes}
                  </th>
                ))}
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(categoriasDespesas).map(([categoria, dados]) => (
                <tr key={categoria} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${dados.cor} flex items-center justify-center text-sm`}>
                        {dados.icon}
                      </div>
                      <div>
                        <div className="font-medium">{categoria.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">
                          {calcularPercentualMeta(dados.valores[selectedMonth], dados.meta)}% da meta
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-blue-600">
                    {dados.meta.toLocaleString('pt-BR')}
                  </td>
                  {dados.valores.map((valor, mesIdx) => (
                    <td key={mesIdx} className={`px-4 py-4 text-center text-sm font-medium text-red-600 ${mesIdx === selectedMonth ? 'bg-blue-50' : ''}`}>
                      {valor.toLocaleString('pt-BR')}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-sm font-bold text-red-600">
                    {calcularTotal(dados.valores).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              
              {/* Linha de Total */}
              <tr className={`${isDarkMode ? 'bg-gray-700 font-bold' : 'bg-gray-100 font-bold'}`}>
                <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  TOTAL GERAL
                </td>
                <td className="px-4 py-4 text-center text-sm font-bold text-blue-600">
                  {totalMetasMes.toLocaleString('pt-BR')}
                </td>
                {Array.from({length: 6}, (_, mesIdx) => {
                  const totalMes = Object.values(categoriasDespesas).reduce((sum, cat) => sum + cat.valores[mesIdx], 0);
                  return (
                    <td key={mesIdx} className={`px-4 py-4 text-center text-sm font-bold text-red-600 ${mesIdx === selectedMonth ? 'bg-blue-200' : ''}`}>
                      {totalMes.toLocaleString('pt-BR')}
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center text-sm font-bold text-red-600">
                  {totalAnual.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Análises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Status das Metas - {meses[selectedMonth]}
          </h3>
          <div className="space-y-3">
            {Object.entries(categoriasDespesas).map(([categoria, dados]) => {
              const valorAtual = dados.valores[selectedMonth];
              const percentual = parseFloat(calcularPercentualMeta(valorAtual, dados.meta));
              const status = getStatusCategoria(percentual);
              const StatusIcon = status.icon;
              
              return (
                <div key={categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {categoria.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${status.color}`}>
                      {percentual}%
                    </div>
                    <div className="text-xs text-gray-500">
                      R$ {valorAtual.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Maiores Gastos - {meses[selectedMonth]}
          </h3>
          <div className="space-y-3">
            {Object.entries(categoriasDespesas)
              .sort((a, b) => b[1].valores[selectedMonth] - a[1].valores[selectedMonth])
              .slice(0, 4)
              .map(([categoria, dados]) => {
                const valor = dados.valores[selectedMonth];
                const percentualDoTotal = ((valor / totalMesAtual) * 100).toFixed(1);
                
                return (
                  <div key={categoria} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${dados.cor}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {categoria.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        R$ {valor.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500">{percentualDoTotal}%</div>
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

export default DespesasCategoria;
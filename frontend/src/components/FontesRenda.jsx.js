import React, { useState } from 'react';
import { Plus, TrendingUp, DollarSign, BarChart3, Eye } from 'lucide-react';

const FontesRenda = ({ isDarkMode }) => {
  const [selectedMonth, setSelectedMonth] = useState(5); // Junho

  // Dados reais das fontes de renda baseados na planilha
  const fontesRenda = [
    {
      id: 1,
      nome: 'PRODUÇÃO (UAUTELAS)',
      tipo: 'producao',
      valores: [50941, 74572, 56241, 19320, 23679, 7121],
      cor: 'bg-green-600'
    },
    {
      id: 2,
      nome: 'HG APLICAÇÃO ACUMULADO (HG TELAS)',
      tipo: 'aplicacao',
      valores: [0, 0, 0, 0, 720, 0],
      cor: 'bg-yellow-600'
    },
    {
      id: 3,
      nome: 'HG (OUTRAS RENDAS)',
      tipo: 'outras',
      valores: [360, 0, 350, 178, 542, 316],
      cor: 'bg-blue-600'
    },
    {
      id: 4,
      nome: 'PRODUÇÃO (HG TELAS)',
      tipo: 'producao',
      valores: [2640, 974, 0, 7078, 917, 400],
      cor: 'bg-purple-600'
    },
    {
      id: 5,
      nome: 'UAUTELAS (MATERIAL)',
      tipo: 'material',
      valores: [0, 0, 2907, 1738, 5297, 2186],
      cor: 'bg-green-500'
    }
  ];

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  const calcularTotal = (valores) => valores.reduce((sum, val) => sum + val, 0);
  const totalGeral = fontesRenda.reduce((sum, fonte) => sum + calcularTotal(fonte.valores), 0);
  const totalMesAtual = fontesRenda.reduce((sum, fonte) => sum + fonte.valores[selectedMonth], 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Fontes de Renda
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Controle de receitas por fonte e tipo
          </p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Fonte
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Mês Atual</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalMesAtual.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">{meses[selectedMonth]}/2025</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Anual</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalGeral.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Jan-Jun 2025</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fontes Ativas</p>
              <p className="text-2xl font-bold text-purple-600">{fontesRenda.length}</p>
              <p className="text-xs text-gray-500">Cadastradas</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Média Mensal</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {Math.round(totalGeral / 6).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
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

      {/* Tabela de Fontes */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fonte de Renda
                </th>
                {meses.slice(0, 6).map((mes, idx) => (
                  <th key={mes} className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${idx === selectedMonth ? 'bg-blue-600 text-white' : ''}`}>
                    {mes}
                  </th>
                ))}
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  TOTAL
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fontesRenda.map((fonte) => (
                <tr key={fonte.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${fonte.cor}`}></div>
                      <div>
                        <div className="font-medium">{fonte.nome}</div>
                        <div className="text-xs text-gray-500 capitalize">{fonte.tipo}</div>
                      </div>
                    </div>
                  </td>
                  {fonte.valores.map((valor, mesIdx) => (
                    <td key={mesIdx} className={`px-4 py-4 text-center text-sm font-medium ${
                      valor > 0 ? 'text-green-600' : 'text-gray-400'
                    } ${mesIdx === selectedMonth ? 'bg-blue-50' : ''}`}>
                      {valor > 0 ? valor.toLocaleString('pt-BR') : '-'}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-sm font-bold text-green-600">
                    {calcularTotal(fonte.valores).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Linha de Total */}
              <tr className={`${isDarkMode ? 'bg-gray-700 font-bold' : 'bg-gray-100 font-bold'}`}>
                <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  TOTAL GERAL
                </td>
                {Array.from({length: 6}, (_, mesIdx) => {
                  const totalMes = fontesRenda.reduce((sum, fonte) => sum + fonte.valores[mesIdx], 0);
                  return (
                    <td key={mesIdx} className={`px-4 py-4 text-center text-sm font-bold text-green-600 ${mesIdx === selectedMonth ? 'bg-blue-200' : ''}`}>
                      {totalMes.toLocaleString('pt-BR')}
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center text-sm font-bold text-green-600">
                  {totalGeral.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Receitas por Tipo - {meses[selectedMonth]}
          </h3>
          <div className="space-y-3">
            {['producao', 'aplicacao', 'outras', 'material'].map(tipo => {
              const fontesDoTipo = fontesRenda.filter(f => f.tipo === tipo);
              const totalTipo = fontesDoTipo.reduce((sum, fonte) => sum + fonte.valores[selectedMonth], 0);
              const percentual = totalMesAtual > 0 ? (totalTipo / totalMesAtual * 100).toFixed(1) : 0;
              
              if (totalTipo === 0) return null;
              
              return (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${
                      tipo === 'producao' ? 'bg-green-600' :
                      tipo === 'aplicacao' ? 'bg-yellow-600' :
                      tipo === 'outras' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}></div>
                    <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tipo}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      R$ {totalTipo.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">{percentual}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Evolução Mensal
          </h3>
          <div className="space-y-3">
            {meses.slice(0, 6).map((mes, idx) => {
              const totalMes = fontesRenda.reduce((sum, fonte) => sum + fonte.valores[idx], 0);
              const isCurrentMonth = idx === selectedMonth;
              
              return (
                <div key={mes} className={`flex items-center justify-between p-2 rounded ${isCurrentMonth ? 'bg-blue-100' : ''}`}>
                  <span className={`text-sm font-medium ${isCurrentMonth ? 'text-blue-800' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {mes}/2025
                  </span>
                  <span className={`text-sm font-bold ${isCurrentMonth ? 'text-blue-600' : 'text-green-600'}`}>
                    R$ {totalMes.toLocaleString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontesRenda;
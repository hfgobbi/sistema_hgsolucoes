import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';

const RelatoriosMensais = ({ isDarkMode }) => {
  const [anoSelecionado, setAnoSelecionado] = useState(2025);
  const [mesSelecionado, setMesSelecionado] = useState(6); // Junho

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  // Dados reais baseados na planilha - Receitas
  const receitasMensais = {
    'PRODUÇÃO (UAUTELAS)': [50941, 74572, 56241, 19320, 23679, 7121, 0, 0, 0, 0, 0, 0],
    'HG APLICAÇÃO ACUMULADO': [0, 0, 0, 0, 720, 0, 0, 0, 0, 0, 0, 0],
    'HG (OUTRAS RENDAS)': [360, 0, 350, 178, 542, 316, 0, 0, 0, 0, 0, 0],
    'PRODUÇÃO (HG TELAS)': [2640, 974, 0, 7078, 917, 400, 0, 0, 0, 0, 0, 0],
    'UAUTELAS (MATERIAL)': [0, 0, 2907, 1738, 5297, 2186, 0, 0, 0, 0, 0, 0]
  };

  // Dados reais baseados na planilha - Despesas
  const despesasMensais = {
    MATERIAL: [14730, 13500, 12800, 11200, 10500, 8900, 0, 0, 0, 0, 0, 0],
    SERVIÇOS: [7675, 9296, 8227, 5435, 5050, 2085, 0, 0, 0, 0, 0, 0],
    ADM: [2827, 1505, 1303, 1528, 1305, 1331, 0, 0, 0, 0, 0, 0],
    CARRO: [3420, 5603, 4541, 4582, 3087, 650, 0, 0, 0, 0, 0, 0],
    MKT: [2304, 3790, 2558, 2503, 1479, 415, 0, 0, 0, 0, 0, 0],
    DESP_CASA: [8956, 7234, 9187, 8642, 7894, 5123, 0, 0, 0, 0, 0, 0]
  };

  // Metas por categoria
  const metas = {
    MATERIAL: 35000,
    SERVIÇOS: 15000,
    ADM: 8000,
    CARRO: 5000,
    MKT: 6000,
    DESP_CASA: 12000
  };

  const calcularTotalReceitas = (mes) => {
    return Object.values(receitasMensais).reduce((sum, valores) => sum + valores[mes], 0);
  };

  const calcularTotalDespesas = (mes) => {
    return Object.values(despesasMensais).reduce((sum, valores) => sum + valores[mes], 0);
  };

  const calcularSaldo = (mes) => {
    return calcularTotalReceitas(mes) - calcularTotalDespesas(mes);
  };

  const totalReceitasAno = Array.from({length: 12}, (_, i) => calcularTotalReceitas(i)).reduce((sum, val) => sum + val, 0);
  const totalDespesasAno = Array.from({length: 12}, (_, i) => calcularTotalDespesas(i)).reduce((sum, val) => sum + val, 0);
  const saldoAno = totalReceitasAno - totalDespesasAno;

  const calcularPercentualMeta = (valor, meta) => ((valor / meta) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Relatórios Mensais
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Análise comparativa de 12 meses
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
            className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {meses.map((mes, idx) => (
              <option key={idx} value={idx + 1}>{mes}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs do Ano */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receitas {anoSelecionado}</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalReceitasAno.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Jan-Jun</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Despesas {anoSelecionado}</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalDespesasAno.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Jan-Jun</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Saldo {anoSelecionado}</p>
              <p className={`text-2xl font-bold ${saldoAno >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoAno.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Jan-Jun</p>
            </div>
            <BarChart3 className={`w-8 h-8 ${saldoAno >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mês Atual</p>
              <p className="text-2xl font-bold text-blue-600">
                {meses[mesSelecionado - 1]}
              </p>
              <p className="text-xs text-gray-500">
                Saldo: R$ {calcularSaldo(mesSelecionado - 1).toLocaleString('pt-BR')}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Relatório Comparativo Anual - Estilo Planilha */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Relatório Anual Completo - Receitas vs Despesas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoria
                </th>
                {meses.map((mes, idx) => (
                  <th key={mes} className={`px-3 py-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${idx === mesSelecionado - 1 ? 'bg-blue-600 text-white' : ''}`}>
                    {mes}
                  </th>
                ))}
                <th className={`px-3 py-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Seção de Receitas */}
              <tr className={`${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <td colSpan={14} className={`px-4 py-2 font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  RECEITAS
                </td>
              </tr>
              
              {Object.entries(receitasMensais).map(([fonte, valores]) => (
                <tr key={fonte} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {fonte}
                  </td>
                  {valores.map((valor, idx) => (
                    <td key={idx} className={`px-3 py-3 text-center font-medium text-green-600 ${idx === mesSelecionado - 1 ? 'bg-blue-50' : ''}`}>
                      {valor > 0 ? valor.toLocaleString('pt-BR') : '-'}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center font-bold text-green-600">
                    {valores.reduce((sum, val) => sum + val, 0).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              
              {/* Total de Receitas */}
              <tr className={`${isDarkMode ? 'bg-green-900/40' : 'bg-green-100'} font-bold`}>
                <td className={`px-4 py-3 font-bold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                  TOTAL RECEITAS
                </td>
                {Array.from({length: 12}, (_, idx) => {
                  const total = calcularTotalReceitas(idx);
                  return (
                    <td key={idx} className={`px-3 py-3 text-center font-bold text-green-600 ${idx === mesSelecionado - 1 ? 'bg-blue-200' : ''}`}>
                      {total > 0 ? total.toLocaleString('pt-BR') : '-'}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center font-bold text-green-600">
                  {totalReceitasAno.toLocaleString('pt-BR')}
                </td>
              </tr>

              {/* Seção de Despesas */}
              <tr className={`${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <td colSpan={14} className={`px-4 py-2 font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  DESPESAS POR CATEGORIA
                </td>
              </tr>

              {Object.entries(despesasMensais).map(([categoria, valores]) => (
                <tr key={categoria} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{categoria}</span>
                      <span className="text-xs text-gray-500">
                        Meta: R$ {metas[categoria]?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  {valores.map((valor, idx) => {
                    const meta = metas[categoria];
                    const percentual = meta ? (valor / meta) * 100 : 0;
                    return (
                      <td key={idx} className={`px-3 py-3 text-center font-medium ${idx === mesSelecionado - 1 ? 'bg-blue-50' : ''}`}>
                        <div className={`${percentual > 100 ? 'text-red-600' : percentual > 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {valor > 0 ? valor.toLocaleString('pt-BR') : '-'}
                        </div>
                        {valor > 0 && meta && (
                          <div className="text-xs text-gray-500">
                            {percentual.toFixed(0)}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center font-bold text-red-600">
                    {valores.reduce((sum, val) => sum + val, 0).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}

              {/* Total de Despesas */}
              <tr className={`${isDarkMode ? 'bg-red-900/40' : 'bg-red-100'} font-bold`}>
                <td className={`px-4 py-3 font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                  TOTAL DESPESAS
                </td>
                {Array.from({length: 12}, (_, idx) => {
                  const total = calcularTotalDespesas(idx);
                  return (
                    <td key={idx} className={`px-3 py-3 text-center font-bold text-red-600 ${idx === mesSelecionado - 1 ? 'bg-blue-200' : ''}`}>
                      {total > 0 ? total.toLocaleString('pt-BR') : '-'}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center font-bold text-red-600">
                  {totalDespesasAno.toLocaleString('pt-BR')}
                </td>
              </tr>

              {/* Saldo Mensal */}
              <tr className={`${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'} font-bold`}>
                <td className={`px-4 py-3 font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  SALDO MENSAL
                </td>
                {Array.from({length: 12}, (_, idx) => {
                  const saldo = calcularSaldo(idx);
                  return (
                    <td key={idx} className={`px-3 py-3 text-center font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'} ${idx === mesSelecionado - 1 ? 'bg-blue-200' : ''}`}>
                      {saldo !== 0 ? saldo.toLocaleString('pt-BR') : '-'}
                    </td>
                  );
                })}
                <td className={`px-3 py-3 text-center font-bold ${saldoAno >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {saldoAno.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Análises do Mês Selecionado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance das Metas - {meses[mesSelecionado - 1]}/{anoSelecionado}
          </h3>
          <div className="space-y-4">
            {Object.entries(despesasMensais).map(([categoria, valores]) => {
              const valor = valores[mesSelecionado - 1];
              const meta = metas[categoria];
              const percentual = meta ? parseFloat(calcularPercentualMeta(valor, meta)) : 0;
              
              if (valor === 0) return null;
              
              return (
                <div key={categoria} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {categoria}
                    </span>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        percentual > 100 ? 'text-red-600' : percentual > 90 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {percentual}%
                      </span>
                      <div className="text-xs text-gray-500">
                        R$ {valor.toLocaleString('pt-BR')}
                      </div>
                    </div>
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
              );
            })}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Evolução dos Últimos 6 Meses
          </h3>
          <div className="space-y-3">
            {Array.from({length: 6}, (_, i) => {
              const receitas = calcularTotalReceitas(i);
              const despesas = calcularTotalDespesas(i);
              const saldo = receitas - despesas;
              const isCurrentMonth = i === mesSelecionado - 1;
              
              return (
                <div key={i} className={`p-3 rounded ${isCurrentMonth ? 'bg-blue-100 border-2 border-blue-300' : isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${isCurrentMonth ? 'text-blue-800' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {meses[i]}/{anoSelecionado}
                    </span>
                    <span className={`font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {saldo.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Receitas: </span>
                      <span className="text-green-600 font-medium">R$ {receitas.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Despesas: </span>
                      <span className="text-red-600 font-medium">R$ {despesas.toLocaleString('pt-BR')}</span>
                    </div>
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

export default RelatoriosMensais;
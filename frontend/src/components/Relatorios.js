import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { relatoriosService } from '../services/api';

const Relatorios = ({ isDarkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  useEffect(() => {
    carregarRelatorio();
  }, [currentMonth, currentYear]);

  const carregarRelatorio = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await relatoriosService.getRelatorioMensal(currentYear, currentMonth + 1);
      setRelatorio(response);
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setError('Não foi possível carregar os dados do relatório. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const mudarMes = (delta) => {
    let novoMes = currentMonth + delta;
    let novoAno = currentYear;
    
    if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    } else if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    }
    
    setCurrentMonth(novoMes);
    setCurrentYear(novoAno);
  };

  const baixarRelatorio = async () => {
    try {
      await relatoriosService.baixarRelatorio(currentYear, currentMonth + 1);
      alert('Relatório baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao baixar relatório:', err);
      alert('Erro ao baixar relatório. Tente novamente mais tarde.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando relatório...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Relatório Financeiro
        </h2>
        <button onClick={baixarRelatorio} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <Download className="w-4 h-4 inline mr-2" />
          Baixar Relatório
        </button>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={() => mudarMes(-1)} 
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <ArrowUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
        <div className={`px-6 py-2 font-bold text-lg rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-300'}`}>
          {meses[currentMonth]} / {currentYear}
        </div>
        <button 
          onClick={() => mudarMes(1)} 
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <ArrowDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
      </div>

      {relatorio ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo financeiro */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumo Financeiro</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receitas Totais:</span>
                <span className="font-medium text-green-600">
                  R$ {relatorio.receitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Despesas Totais:</span>
                <span className="font-medium text-red-600">
                  R$ {relatorio.despesas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <hr className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              
              <div className="flex justify-between">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Saldo:</span>
                <span className={`font-medium ${relatorio.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {relatorio.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Economia:</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {relatorio.porcentagemEconomia?.toFixed(1)}% da receita
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${relatorio.porcentagemEconomia >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.max(0, Math.min(100, relatorio.porcentagemEconomia || 0))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Comparativo com mês anterior */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Comparativo Mensal</h3>
            
            {relatorio.comparativo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receitas:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {relatorio.comparativo.variacaoReceitas >= 0 ? '+' : ''}
                      {relatorio.comparativo.variacaoReceitas?.toFixed(1)}%
                    </span>
                    {relatorio.comparativo.variacaoReceitas > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : relatorio.comparativo.variacaoReceitas < 0 ? (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    ) : null}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Despesas:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {relatorio.comparativo.variacaoDespesas >= 0 ? '+' : ''}
                      {relatorio.comparativo.variacaoDespesas?.toFixed(1)}%
                    </span>
                    {relatorio.comparativo.variacaoDespesas > 0 ? (
                      <ArrowUp className="w-4 h-4 text-red-600" />
                    ) : relatorio.comparativo.variacaoDespesas < 0 ? (
                      <ArrowDown className="w-4 h-4 text-green-600" />
                    ) : null}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Saldo:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {relatorio.comparativo.variacaoSaldo >= 0 ? '+' : ''}
                      {relatorio.comparativo.variacaoSaldo?.toFixed(1)}%
                    </span>
                    {relatorio.comparativo.variacaoSaldo > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : relatorio.comparativo.variacaoSaldo < 0 ? (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Não há dados comparativos disponíveis para o mês anterior.
              </p>
            )}
          </div>
          
          {/* Estatísticas por categoria */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} lg:col-span-2`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Despesas por Categoria</h3>
            
            {relatorio.categorias && relatorio.categorias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {relatorio.categorias.map((categoria, idx) => {
                    const cores = [
                      'bg-green-500', 'bg-blue-500', 'bg-purple-500', 
                      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
                    ];
                    const cor = cores[idx % cores.length];
                    const percentual = Math.round((categoria.valor / relatorio.despesas) * 100);
                    
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${cor}`}></div>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {categoria.nome}
                            </span>
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {percentual}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={cor}
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-4">
                  {relatorio.categorias.map((categoria, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {categoria.nome}:
                      </span>
                      <span className="font-medium text-red-600">
                        R$ {categoria.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Não há dados de categorias disponíveis para este mês.
              </p>
            )}
          </div>
          
          {/* Análise de tendências */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} lg:col-span-2`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Análise de Tendências</h3>
            
            {relatorio.tendencias ? (
              <div className="space-y-4">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Maiores gastos:</strong> {relatorio.tendencias.maioresGastos}
                </p>
                
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Recomendações:</strong> {relatorio.tendencias.recomendacoes}
                </p>
                
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Previsão para o próximo mês:</strong> {relatorio.tendencias.previsao}
                </p>
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Não há análise de tendências disponível para este mês.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'} text-center`}>
          Não há relatório disponível para {meses[currentMonth]} de {currentYear}.
        </div>
      )}
    </div>
  );
};

export default Relatorios;

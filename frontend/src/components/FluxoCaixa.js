import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { dashboardService } from '../services/api';

const FluxoCaixa = ({ isDarkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  useEffect(() => {
    const carregarFluxoCaixa = async () => {
      setLoading(true);
      setError('');
      try {
        // Usar o serviço correto para fluxo de caixa diário
        const response = await dashboardService.getFluxoDiario(currentYear, currentMonth + 1);
        
        if (response && response.fluxoDiario) {
          // Processar registros diários
          const registrosDiarios = response.fluxoDiario.map(dia => {
            const dataObj = new Date(dia.data);
            const diaFormatado = dataObj.getDate().toString().padStart(2, '0');
            
            return {
              data: dataObj,
              descricao: `Movimentação do dia ${diaFormatado}`,
              entrada: dia.receitas,
              saida: dia.despesas,
              saldo: dia.saldo
            };
          });
          
          setFluxoCaixa(registrosDiarios);
          
          // Configurar saldos inicial e final
          const saldoTotalFinal = response.resumo?.saldoFinal || 0;
          setSaldoInicial(0);
          setSaldoFinal(saldoTotalFinal);
          
          console.log('Fluxo de caixa diário processado:', registrosDiarios);
        } else {
          // Caso a resposta não venha no formato esperado
          setFluxoCaixa([]);
          setSaldoInicial(0);
          setSaldoFinal(0);
          console.error('Formato de resposta da API de fluxo diário inválido:', response);
        }
      } catch (err) {
        console.error('Erro ao carregar fluxo de caixa:', err);
        setError('Não foi possível carregar os dados do fluxo de caixa. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarFluxoCaixa();
  }, [currentMonth, currentYear]);

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

  const formatarData = (data) => {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando dados de fluxo...</span>
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
          Fluxo de Caixa
        </h2>
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

      <div className={`overflow-hidden rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Entradas</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Saídas</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`} colSpan="2">
                  Saldo Inicial
                </td>
                <td className="px-4 py-3 text-center text-sm"></td>
                <td className="px-4 py-3 text-center text-sm"></td>
                <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                  R$ {saldoInicial?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {fluxoCaixa.length > 0 ? (
                fluxoCaixa.map((registro, idx) => (
                  <tr key={idx} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatarData(registro.data)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {registro.descricao}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-green-600">
                      {registro.entrada > 0 ? `R$ ${registro.entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-red-600">
                      {registro.saida > 0 ? `R$ ${registro.saida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                      R$ {registro.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum registro de fluxo de caixa encontrado para este mês.
                  </td>
                </tr>
              )}

              <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`} colSpan="2">
                  Saldo Final
                </td>
                <td className="px-4 py-3 text-center text-sm"></td>
                <td className="px-4 py-3 text-center text-sm"></td>
                <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                  R$ {saldoFinal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixa;

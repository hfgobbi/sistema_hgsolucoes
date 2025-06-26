import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import { dashboardService, lancamentosService } from '../services/api';

const Dashboard = ({ isDarkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [kpis, setKpis] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [fontesRenda, setFontesRenda] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      setError('');
      try {
        console.log(`Carregando dados do dashboard para ${currentYear}/${currentMonth + 1}`);
        
        // Carregar KPIs - nova estrutura
        const kpisResponse = await dashboardService.getKPIs(currentYear, currentMonth + 1);
        console.log('Dados de KPI recebidos:', kpisResponse);
        
        // Formatar os dados conforme a nova estrutura da API
        const dadosFormatados = {
          receitas: kpisResponse.receitas || 0, 
          despesas: kpisResponse.despesas || 0,
          saldo: kpisResponse.saldo || 0
        };
        
        // Atualizar o estado com os dados recebidos
        setKpis(dadosFormatados);
        
        // Definir fontes de renda se disponíveis nos detalhes
        if (kpisResponse.detalhes?.receitasPorCategoria?.length > 0) {
          // Formatar dados para o formato esperado pelo componente
          const fontesFormatadas = kpisResponse.detalhes.receitasPorCategoria.map(item => ({
            nome: item.categoria,
            descricao: item.categoria,
            valor: item.valor
          }));
          
          setFontesRenda(fontesFormatadas);
        } else {
          // Se não houver dados de receitas, inicializar array vazio
          setFontesRenda([]);
          
          // Tentar buscar do fluxo mensal como alternativa
          try {
            const fontesRendaResponse = await dashboardService.getFluxoMensal(currentYear);
            
            // Filtrar dados apenas do mês atual se vier o ano todo
            if (Array.isArray(fontesRendaResponse)) {
              const fontesDoMes = fontesRendaResponse.filter(fonte => {
                const dataFonte = new Date(fonte.data);
                return dataFonte.getMonth() === currentMonth;
              });
              
              setFontesRenda(fontesDoMes);
            }
          } catch (err) {
            console.warn('Erro ao carregar fontes alternativas:', err);
          }
        }
        
        // Definir categorias de despesas se disponíveis
        if (kpisResponse.detalhes?.despesasPorCategoria?.length > 0) {
          // Formatar dados para o formato esperado pelo componente
          const despesasFormatadas = kpisResponse.detalhes.despesasPorCategoria.map(item => ({
            categoria: item.categoria,
            total: item.valor
          }));
          
          setCategoriasDespesas(despesasFormatadas);
        } else {
          // Se não houver nas novas KPIs, tentar buscar do endpoint original
          try {
            const categoriasResponse = await lancamentosService.getResumoCategorias(currentYear, currentMonth + 1);
            setCategoriasDespesas(categoriasResponse);
          } catch (err) {
            console.warn('Erro ao carregar categorias alternativas:', err);
            setCategoriasDespesas([]);
          }
        }
        
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [currentMonth, currentYear]);

  // Componente Card de Métrica
  const CardMetrica = ({ titulo, valor, icon: Icon, cor, subtitulo }) => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{titulo}</p>
          <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
          {subtitulo && <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitulo}</p>}
        </div>
        <Icon className={`w-8 h-8 ${cor}`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando dados...</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardMetrica 
          titulo="Receitas do Mês"
          valor={`R$ ${kpis.receitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          icon={TrendingUp}
          cor="text-green-600"
          subtitulo={meses[currentMonth]}
        />
        <CardMetrica 
          titulo="Despesas do Mês"
          valor={`R$ ${kpis.despesas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          icon={CreditCard}
          cor="text-red-600"
          subtitulo={meses[currentMonth]}
        />
        <CardMetrica 
          titulo="Saldo do Mês"
          valor={`R$ ${kpis.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          icon={DollarSign}
          cor={kpis.saldo >= 0 ? "text-green-600" : "text-red-600"}
          subtitulo={meses[currentMonth]}
        />
      </div>

      <div className="flex justify-center">
        <div className="flex gap-2 overflow-x-auto">
          {meses.slice(0, 12).map((mes, idx) => (
            <button
              key={mes}
              onClick={() => setCurrentMonth(idx)}
              className={`px-4 py-2 rounded font-medium ${
                idx === currentMonth
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Receitas por Fonte - {meses[currentMonth]}</h3>
          {fontesRenda.length > 0 ? (
            <div className="space-y-3">
              {fontesRenda.map((fonte, idx) => {
                // Cores alternadas para as fontes de renda
                const cores = ['bg-green-600', 'bg-yellow-600', 'bg-blue-600', 'bg-purple-600', 'bg-green-500'];
                const cor = cores[idx % cores.length];
                
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${cor}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {fonte.descricao || fonte.nome}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        R$ {fonte.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {kpis.receitas > 0 ? ((fonte.valor / kpis.receitas) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Não há dados de receitas para este mês.
            </p>
          )}
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Despesas por Categoria - {meses[currentMonth]}</h3>
          {categoriasDespesas.length > 0 ? (
            <div className="space-y-3">
              {categoriasDespesas.map((categoria, idx) => {
                const cores = [
                  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 
                  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
                ];
                const cor = cores[idx % cores.length];
                
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${cor}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {categoria.categoria}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        R$ {categoria.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {kpis.despesas > 0 ? ((categoria.total / kpis.despesas) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Não há dados de despesas para este mês.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { contasPagarService, lancamentosService } from '../services/api';

const Despesas = ({ isDarkMode }) => {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    categoria: '',
    status: 'PENDENTE'
  });

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const statusOptions = [
    { valor: 'PENDENTE', nome: 'Pendente' },
    { valor: 'PAGO', nome: 'Pago' },
    { valor: 'ATRASADO', nome: 'Atrasado' }
  ];

  useEffect(() => {
    carregarDados();
  }, [currentMonth, currentYear]);

  const carregarDados = async () => {
    setLoading(true);
    setError('');
    try {
      // Carregar categorias de despesa
      // Como não temos um serviço específico para categorias, vamos usar categorias padrão
      setCategorias([
        { id: 1, nome: 'Alimentação' },
        { id: 2, nome: 'Transporte' },
        { id: 3, nome: 'Moradia' },
        { id: 4, nome: 'Lazer' },
        { id: 5, nome: 'Saúde' },
        { id: 6, nome: 'Educação' },
        { id: 7, nome: 'Outros' }
      ]);

      // Carregar despesas do mês/ano atual
      const despesasResponse = await contasPagarService.getAll({ 
        ano: currentYear, 
        mes: currentMonth + 1 
      });
      setDespesas(Array.isArray(despesasResponse) ? despesasResponse : []);
    } catch (err) {
      console.error('Erro ao carregar dados de despesas:', err);
      setError('Não foi possível carregar as despesas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'valor' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.descricao || !formData.valor || !formData.dataVencimento || !formData.categoria) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Garantir que o valor seja um número
      let valorNumerico = typeof formData.valor === 'string' ? 
        parseFloat(formData.valor.replace(',', '.')) : 
        parseFloat(formData.valor);
      
      // Garantir que a data está em formato ISO para o backend
      const dataVencimento = new Date(formData.dataVencimento);
      const dataFormatada = dataVencimento.toISOString();

      const dadosParaSalvar = {
        descricao: formData.descricao,
        valor: valorNumerico,
        vencimento: dataFormatada, // Garantir formato ISO
        categoria: formData.categoria, // Campo que o backend espera
        status: formData.status,
        observacoes: formData.observacoes || ''
      };
      
      // Log detalhado para ajudar na depuração
      console.log('Dados sendo enviados para o backend:', { 
        ...dadosParaSalvar,
        valorOriginal: formData.valor,
        valorConvertido: valorNumerico,
        dataOriginal: formData.dataVencimento,
        dataConvertida: dataFormatada
      });
      
      if (despesaSelecionada) {
        // Atualização
        await contasPagarService.update(despesaSelecionada.id, dadosParaSalvar);
      } else {
        // Nova despesa
        await contasPagarService.create(dadosParaSalvar);
      }
      
      // Limpar formulário e recarregar dados
      limparFormulario();
      carregarDados();
      setMostrarForm(false);
    } catch (err) {
      console.error('Erro ao salvar despesa:', err);
      setError('Ocorreu um erro ao salvar a despesa. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const editarDespesa = (despesa) => {
    setDespesaSelecionada(despesa);
    setFormData({
      descricao: despesa.descricao,
      valor: despesa.valor,
      dataVencimento: formatarDataParaInput(despesa.dataVencimento),
      categoria: despesa.categoria?.id || despesa.categoriaId,
      status: despesa.status
    });
    setMostrarForm(true);
  };

  const excluirDespesa = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await contasPagarService.delete(id);
      carregarDados();
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      setError('Não foi possível excluir a despesa. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setFormData({
      descricao: '',
      valor: '',
      dataVencimento: '',
      categoria: '',
      status: 'PENDENTE'
    });
    setDespesaSelecionada(null);
  };

  const cancelarEdicao = () => {
    limparFormulario();
    setMostrarForm(false);
  };

  const formatarDataParaExibicao = (data) => {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  };

  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toISOString().split('T')[0];
  };

  const calcularTotal = () => {
    return despesas.reduce((total, despesa) => total + (despesa.valor || 0), 0);
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

  const getStatusClassName = (status) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800';
      case 'ATRASADO':
        return 'bg-red-100 text-red-800';
      case 'PENDENTE':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading && despesas.length === 0 && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando despesas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Despesas - {meses[currentMonth]} / {currentYear}
        </h2>
        
        {!mostrarForm ? (
          <button 
            onClick={() => setMostrarForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nova Despesa
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={cancelarEdicao}
              className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80`}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Navegador de meses */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <button 
            onClick={() => mudarMes(-1)} 
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80`}
          >
            Anterior
          </button>
          <div className={`px-6 py-2 font-medium rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
            {meses[currentMonth]} / {currentYear}
          </div>
          <button 
            onClick={() => mudarMes(1)} 
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80`}
          >
            Próximo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Formulário para nova despesa ou edição */}
      {mostrarForm && (
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {despesaSelecionada ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Descrição*
                </label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Aluguel, Conta de Luz, etc."
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Valor (R$)*
                </label>
                <input
                  type="number"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Data de Vencimento*
                </label>
                <input
                  type="date"
                  name="dataVencimento"
                  value={formData.dataVencimento}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Categoria*
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.valor} value={option.valor}>
                      {option.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1`}
              >
                {loading ? 
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : 
                  <></>
                }
                {despesaSelecionada ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de despesas */}
      <div className={`overflow-hidden rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Categoria</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vencimento</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`px-4 py-3 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valor</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {despesas.length > 0 ? (
                despesas.map((despesa) => (
                  <tr 
                    key={despesa.id} 
                    className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {despesa.descricao}
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {despesa.categoria?.nome || '-'}
                    </td>
                    <td className={`px-4 py-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatarDataParaExibicao(despesa.dataVencimento)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusClassName(despesa.status)}`}>
                        {despesa.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium text-red-600`}>
                      R$ {despesa.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => editarDespesa(despesa)}
                          className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </button>
                        <button 
                          onClick={() => excluirDespesa(despesa.id)}
                          className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma despesa encontrada para o mês selecionado.
                  </td>
                </tr>
              )}
              
              {/* Linha de Total */}
              {despesas.length > 0 && (
                <tr className={`font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td colSpan="4" className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Despesas;

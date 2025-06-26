import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { fontesRendaService } from '../services/api';

const FontesRenda = ({ isDarkMode }) => {
  const [fontesRenda, setFontesRenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [fonteSelecionada, setFonteSelecionada] = useState(null);
  // Estados para paginação de itens
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Estados para navegação de mês/ano
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valorMensal: '',
    cor: '#10b981' // Verde padrão
  });

  const cores = [
    { valor: '#10b981', nome: 'Verde' },
    { valor: '#3b82f6', nome: 'Azul' },
    { valor: '#8b5cf6', nome: 'Roxo' },
    { valor: '#f59e0b', nome: 'Amarelo' },
    { valor: '#ef4444', nome: 'Vermelho' }
  ];

  // Array com nomes dos meses
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Carregar fontes de renda na montagem do componente e quando mês/ano mudar
  useEffect(() => {
    carregarFontesRenda();
  }, [currentMonth, currentYear]);

  const carregarFontesRenda = async () => {
    setLoading(true);
    setError('');
    try {
      // Incluir parâmetros de mês e ano na chamada
      const params = {
        mes: currentMonth + 1, // Ajustando para formato 1-12 (API espera mês começando em 1)
        ano: currentYear
      };
      
      const response = await fontesRendaService.listarFontesRenda(params);
      setFontesRenda(Array.isArray(response) ? response : []);
      
      // Resetar para página 1 ao mudar mês/ano
      setCurrentPage(1);
    } catch (err) {
      console.error('Erro ao carregar fontes de renda:', err);
      setError('Não foi possível carregar as fontes de renda. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'valorMensal' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!formData.nome || !formData.valorMensal) {
      setError('Por favor, preencha pelo menos o nome e o valor mensal.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Garantir que o valor mensal seja um número válido
      let valorMensalNumerico = typeof formData.valorMensal === 'string' ? 
        parseFloat(formData.valorMensal.replace(',', '.')) : 
        parseFloat(formData.valorMensal);

      if (isNaN(valorMensalNumerico)) {
        valorMensalNumerico = 0; // Valor padrão para evitar erro no backend
      }

      const dadosParaSalvar = {
        nome: formData.nome,
        descricao: formData.descricao || formData.nome,
        valorMensal: valorMensalNumerico,
        tipo: 'OUTRAS', // Adicionar tipo padrão conforme esperado pelo backend
        cor: formData.cor
      };

      // Log detalhado para ajudar na depuração
      console.log('Dados sendo enviados para o backend (fonte de renda):', {
        ...dadosParaSalvar,
        valorOriginal: formData.valorMensal,
        valorConvertido: valorMensalNumerico
      });
      
      if (fonteSelecionada) {
        // Atualização
        try {
          setError('');
          const resposta = await fontesRendaService.update(fonteSelecionada.id, dadosParaSalvar);
          console.log('Fonte de renda atualizada com sucesso:', resposta);
          
          if (setSuccessMessage) {
            setSuccessMessage('Fonte de renda atualizada com sucesso!');
            
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => {
              setSuccessMessage('');
            }, 3000);
          }
          
          resetForm();
          setMostrarForm(false);
          
          // Usar timeout para evitar sobrecarga de requisições
          setTimeout(() => {
            carregarFontesRenda();
          }, 1000);
          
          return; // Sair da função aqui para evitar o código abaixo
        } catch (erro) {
          console.error('Erro detalhado ao atualizar fonte de renda:', erro);
          setError(`Erro ao atualizar fonte de renda: ${erro.message || JSON.stringify(erro)}`);
          return; // Sair da função para evitar executar o código abaixo
        }
      } else {
        // Criação
        try {
          setError('');
          const resposta = await fontesRendaService.create(dadosParaSalvar);
          console.log('Fonte de renda criada com sucesso:', resposta);
          
          if (setSuccessMessage) {
            setSuccessMessage('Fonte de renda criada com sucesso!');
            
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => {
              setSuccessMessage('');
            }, 3000);
          }
          
          resetForm();
          setMostrarForm(false); // Fechar o formulário
          
          // Atualizar a lista com mais intervalos para evitar sobrecarga
          setTimeout(() => {
            carregarFontesRenda();
          }, 1000); 
        } catch (erro) {
          console.error('Erro detalhado ao criar fonte de renda:', erro);
          setError(`Erro ao criar fonte de renda: ${erro.message || JSON.stringify(erro)}`);
        }
      }
      
      // Limpar formulário e recarregar dados
      limparFormulario();
      carregarFontesRenda();
      setMostrarForm(false);
    } catch (err) {
      console.error('Erro ao salvar fonte de renda:', err);
      setError('Ocorreu um erro ao salvar a fonte de renda. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const editarFonte = (fonte) => {
    setFonteSelecionada(fonte);
    setFormData({
      nome: fonte.nome,
      descricao: fonte.descricao || '',
      valorMensal: fonte.valorMensal,
      cor: fonte.cor || '#10b981'
    });
    setMostrarForm(true);
  };

  const handleExcluir = async (fonteId) => {
    if (window.confirm('Tem certeza que deseja excluir esta fonte de renda?')) {
      try {
        setError(''); // Limpar mensagens de erro anteriores
        setLoading(true);
        console.log('Tentando excluir fonte de renda com ID:', fonteId);
        const resposta = await fontesRendaService.delete(fonteId);
        console.log('Fonte de renda excluída com sucesso:', resposta);
        setSuccessMessage('Fonte de renda excluída com sucesso!');
        await carregarFontesRenda(); // Aguardar o carregamento dos dados atualizados
        
        // Limpar a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (erro) {
        console.error('Erro detalhado ao excluir fonte de renda:', erro);
        setError(`Erro ao excluir fonte de renda: ${erro.message || JSON.stringify(erro)}`);
        setSuccessMessage(''); // Limpar mensagem de sucesso em caso de erro
      } finally {
        setLoading(false);
      }
    }
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      descricao: '',
      valorMensal: '',
      cor: '#10b981'
    });
    setFonteSelecionada(null);
  };

  const cancelarEdicao = () => {
    limparFormulario();
    setMostrarForm(false);
  };

  const calcularTotal = () => {
    return fontesRenda.reduce((acc, fonte) => acc + Number(fonte.valorMensal || 0), 0);
  };

  // Função para formatar valores monetários (garantir 2 casas decimais)
  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Função para navegar entre os meses
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

  if (loading && fontesRenda.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Carregando fontes de renda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Receitas</h2>
        
        {!mostrarForm ? (
          <button 
            onClick={() => setMostrarForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nova Fonte
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Formulário para nova fonte ou edição */}
      {mostrarForm && (
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {fonteSelecionada ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Nome*
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Salário, Freelance, etc."
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Valor Mensal (R$)*
                </label>
                <input
                  type="number"
                  name="valorMensal"
                  value={formData.valorMensal}
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
                  Descrição
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
                  placeholder="Descrição detalhada (opcional)"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Cor
                </label>
                <select
                  name="cor"
                  value={formData.cor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  {cores.map((cor) => (
                    <option key={cor.valor} value={cor.valor}>
                      {cor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1`}
              >
                {loading ? 
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : 
                  <></>
                }
                {fonteSelecionada ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navegador de meses */}
      <div className="flex justify-center mb-4">
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
      
      {/* Tabela de fontes de renda */}
      <div className={`overflow-hidden rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</th>
                <th className={`px-4 py-3 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valor Mensal</th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {fontesRenda.length > 0 ? (
                // Aplicar paginação - mostrar apenas os itens da página atual
                fontesRenda
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((fonte) => (
                  <tr 
                    key={fonte.id} 
                    className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded`} style={{backgroundColor: fonte.cor || '#10b981'}}></div>
                        <span>{fonte.nome}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {fonte.descricao || '-'}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium text-green-600`}>
                      R$ {formatarMoeda(fonte.valorMensal)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => editarFonte(fonte)}
                          className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(fonte.id)}
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
                  <td colSpan="4" className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma fonte de renda cadastrada. Adicione sua primeira fonte!
                  </td>
                </tr>
              )}
              
              {/* Linha de Total */}
              {fontesRenda.length > 0 && (
                <tr className={`font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td colSpan="2" className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    R$ {formatarMoeda(calcularTotal())}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Controles de paginação */}
          {fontesRenda.length > itemsPerPage && (
            <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, fontesRenda.length)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, fontesRenda.length)}</span> de <span className="font-medium">{fontesRenda.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Anterior</span>
                    &larr;
                  </button>
                  
                  {/* Botões de página */}
                  {Array.from({ length: Math.ceil(fontesRenda.length / itemsPerPage) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} ${currentPage === idx + 1 ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600') : (isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50')}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(fontesRenda.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(fontesRenda.length / itemsPerPage)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} ${currentPage === Math.ceil(fontesRenda.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Próximo</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontesRenda;

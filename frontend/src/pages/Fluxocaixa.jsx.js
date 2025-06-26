import React, { useState } from 'react';
import { useFluxoCaixa, useFluxoCaixaMutations } from '../hooks/useApi';
import { Calendar, Plus, Save, RefreshCw, Download, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const FluxoCaixa = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingRow, setEditingRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Hooks para dados e mutações
  const { data: fluxoData, isLoading, refetch } = useFluxoCaixa({
    ano: currentYear,
    mes: currentMonth
  });
  
  const { criarFluxoDiario, atualizarFluxoDiario } = useFluxoCaixaMutations();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Campos do fluxo de caixa (baseados na planilha real)
  const camposFluxo = [
    { key: 'hgProd', label: 'HG Prod', group: 'receitas', color: 'bg-green-600' },
    { key: 'outrasRendas', label: 'Outras Rendas', group: 'receitas', color: 'bg-green-600' },
    { key: 'uautelas', label: 'Uautelas', group: 'receitas', color: 'bg-purple-600' },
    { key: 'matProd', label: 'Mat. Prod', group: 'receitas', color: 'bg-purple-600' },
    { key: 'gasCarro', label: 'Gas. Carro', group: 'despesas', color: 'bg-yellow-600' },
    { key: 'uberOutros', label: 'Uber Outros', group: 'despesas', color: 'bg-yellow-600' },
    { key: 'googleAds', label: 'Google Ads', group: 'despesas', color: 'bg-yellow-600' },
    { key: 'metaAds', label: 'Meta Ads', group: 'despesas', color: 'bg-yellow-600' },
    { key: 'cafeAlmoco', label: 'Café/Almoço', group: 'despesas', color: 'bg-orange-600' },
    { key: 'carroManut', label: 'Carro Manut.', group: 'despesas', color: 'bg-orange-600' },
    { key: 'everton', label: 'Everton', group: 'servicos', color: 'bg-blue-600' },
    { key: 'outros', label: 'Outros', group: 'servicos', color: 'bg-blue-600' },
    { key: 'gabriel', label: 'Gabriel', group: 'servicos', color: 'bg-blue-600' },
    { key: 'felipe', label: 'Felipe', group: 'servicos', color: 'bg-blue-600' },
    { key: 'juber', label: 'Juber', group: 'servicos', color: 'bg-blue-600' }
  ];

  const formatCurrency = (value) => {
    if (!value || value === 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSaveFluxo = async (data) => {
    try {
      const fluxoData = {
        data: data.data || formatDateInput(new Date()),
        ...Object.keys(data).reduce((acc, key) => {
          if (camposFluxo.find(campo => campo.key === key)) {
            acc[key] = parseFloat(data[key]) || 0;
          }
          return acc;
        }, {}),
        observacoes: data.observacoes || ''
      };

      if (editingRow) {
        await atualizarFluxoDiario.mutateAsync({
          id: editingRow,
          dados: fluxoData
        });
        toast.success('Fluxo de caixa atualizado!');
      } else {
        await criarFluxoDiario.mutateAsync(fluxoData);
        toast.success('Fluxo de caixa criado!');
      }

      reset();
      setEditingRow(null);
      refetch();
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
    }
  };

  const handleEditRow = (fluxo) => {
    setEditingRow(fluxo.id);
    
    // Preencher formulário com dados existentes
    setValue('data', formatDateInput(new Date(fluxo.data)));
    camposFluxo.forEach(campo => {
      setValue(campo.key, fluxo[campo.key] || 0);
    });
    setValue('observacoes', fluxo.observacoes || '');
  };

  const calcularTotais = (fluxo) => {
    const receitas = camposFluxo
      .filter(campo => campo.group === 'receitas')
      .reduce((sum, campo) => sum + (parseFloat(fluxo[campo.key]) || 0), 0);
    
    const despesas = camposFluxo
      .filter(campo => campo.group === 'despesas')
      .reduce((sum, campo) => sum + (parseFloat(fluxo[campo.key]) || 0), 0);
    
    const servicos = camposFluxo
      .filter(campo => campo.group === 'servicos')
      .reduce((sum, campo) => sum + (parseFloat(fluxo[campo.key]) || 0), 0);

    return {
      receitas,
      despesas,
      servicos,
      saldo: receitas - (despesas + servicos)
    };
  };

  const exportarExcel = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fluxo de Caixa Diário</h1>
          <p className="text-gray-400">
            Lançamentos diários - {meses[currentMonth - 1]} {currentYear}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <input
            type="month"
            value={`${currentYear}-${currentMonth.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
            }}
            className="form-input w-auto"
          />
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          
          <button
            onClick={exportarExcel}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
          
          <button
            onClick={() => refetch()}
            className="btn-outline"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Formulário de Lançamento */}
      <div className="card-planilha">
        <div className="card-planilha-header">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            {editingRow ? 'Editar Lançamento' : 'Novo Lançamento Diário'}
          </h3>
        </div>
        <div className="card-planilha-content">
          <form onSubmit={handleSubmit(handleSaveFluxo)} className="space-y-6">
            {/* Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Data</label>
                <input
                  type="date"
                  {...register('data')}
                  className="form-input"
                  defaultValue={formatDateInput(new Date())}
                />
              </div>
            </div>

            {/* Campos por Grupo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Receitas */}
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                  RECEITAS
                </h4>
                <div className="space-y-3">
                  {camposFluxo.filter(campo => campo.group === 'receitas').map(campo => (
                    <div key={campo.key}>
                      <label className="form-label text-xs">{campo.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(campo.key)}
                        className="form-input text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Despesas */}
              <div>
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded mr-2"></div>
                  DESPESAS
                </h4>
                <div className="space-y-3">
                  {camposFluxo.filter(campo => campo.group === 'despesas').map(campo => (
                    <div key={campo.key}>
                      <label className="form-label text-xs">{campo.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(campo.key)}
                        className="form-input text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Serviços */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  SERVIÇOS
                </h4>
                <div className="space-y-3">
                  {camposFluxo.filter(campo => campo.group === 'servicos').map(campo => (
                    <div key={campo.key}>
                      <label className="form-label text-xs">{campo.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(campo.key)}
                        className="form-input text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="form-label">Observações</label>
              <textarea
                {...register('observacoes')}
                className="form-input"
                rows="2"
                placeholder="Observações sobre o dia..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              {editingRow && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRow(null);
                    reset();
                  }}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="btn-success"
                disabled={criarFluxoDiario.isLoading || atualizarFluxoDiario.isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingRow ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabela de Fluxo de Caixa */}
      <div className="card-planilha">
        <div className="card-planilha-header">
          <h3 className="text-lg font-semibold text-white">
            Lançamentos do Mês
          </h3>
        </div>
        <div className="card-planilha-content p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton h-12 w-full"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-excel">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-gray-700 z-10">Data</th>
                    {/* Headers de Receitas */}
                    {camposFluxo.filter(c => c.group === 'receitas').map(campo => (
                      <th key={campo.key} className="text-center min-w-20">
                        <div className={`px-2 py-1 rounded text-xs text-white ${campo.color}`}>
                          {campo.label}
                        </div>
                      </th>
                    ))}
                    {/* Headers de Despesas */}
                    {camposFluxo.filter(c => c.group === 'despesas').map(campo => (
                      <th key={campo.key} className="text-center min-w-20">
                        <div className={`px-2 py-1 rounded text-xs text-white ${campo.color}`}>
                          {campo.label}
                        </div>
                      </th>
                    ))}
                    {/* Headers de Serviços */}
                    {camposFluxo.filter(c => c.group === 'servicos').map(campo => (
                      <th key={campo.key} className="text-center min-w-20">
                        <div className={`px-2 py-1 rounded text-xs text-white ${campo.color}`}>
                          {campo.label}
                        </div>
                      </th>
                    ))}
                    <th className="text-center">Saldo Dia</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fluxoData?.fluxos?.length > 0 ? (
                    fluxoData.fluxos.map((fluxo) => {
                      const totais = calcularTotais(fluxo);
                      return (
                        <tr key={fluxo.id} className="hover:bg-gray-800">
                          <td className="sticky left-0 bg-gray-900 font-medium">
                            {new Date(fluxo.data).toLocaleDateString('pt-BR')}
                          </td>
                          
                          {/* Valores de Receitas */}
                          {camposFluxo.filter(c => c.group === 'receitas').map(campo => (
                            <td key={campo.key} className="text-center text-green-400">
                              {formatCurrency(fluxo[campo.key])}
                            </td>
                          ))}
                          
                          {/* Valores de Despesas */}
                          {camposFluxo.filter(c => c.group === 'despesas').map(campo => (
                            <td key={campo.key} className="text-center text-yellow-400">
                              {formatCurrency(fluxo[campo.key])}
                            </td>
                          ))}
                          
                          {/* Valores de Serviços */}
                          {camposFluxo.filter(c => c.group === 'servicos').map(campo => (
                            <td key={campo.key} className="text-center text-blue-400">
                              {formatCurrency(fluxo[campo.key])}
                            </td>
                          ))}
                          
                          <td className={`text-center font-medium ${
                            totais.saldo >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(totais.saldo)}
                          </td>
                          
                          <td className="text-center">
                            <button
                              onClick={() => handleEditRow(fluxo)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={camposFluxo.length + 3} className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                        Nenhum lançamento encontrado para este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Resumo do Período */}
      {fluxoData?.resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-planilha">
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Total Receitas</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(fluxoData.resumo.totalReceitas)}
              </p>
            </div>
          </div>
          
          <div className="card-planilha">
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Total Despesas</p>
              <p className="text-xl font-bold text-red-400">
                {formatCurrency(fluxoData.resumo.totalDespesas)}
              </p>
            </div>
          </div>
          
          <div className="card-planilha">
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Total Serviços</p>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(fluxoData.resumo.totalServicos)}
              </p>
            </div>
          </div>
          
          <div className="card-planilha">
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Saldo Período</p>
              <p className={`text-xl font-bold ${
                fluxoData.resumo.saldoPeriodo >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(fluxoData.resumo.saldoPeriodo)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluxoCaixa;
import React, { useState } from 'react';
import { useCartoes, useCartaoMutations, useExtratoCartao } from '../hooks/useApi';
import { CreditCard, Plus, Edit, Trash2, Eye, Calendar, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Cartoes = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCartao, setEditingCartao] = useState(null);
  const [selectedCartao, setSelectedCartao] = useState(null);
  const [showExtrato, setShowExtrato] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  // Hooks para dados e mutações
  const { data: cartoesData, isLoading, refetch } = useCartoes();
  const { data: extratoData, isLoading: loadingExtrato } = useExtratoCartao(
    selectedCartao?.id,
    showExtrato ? currentYear : null
  );
  const { criarCartao, atualizarCartao, desativarCartao } = useCartaoMutations();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critico': return 'bg-red-600';
      case 'alerta': return 'bg-yellow-600';
      case 'normal': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getVencimentoColor = (codigoVencimento) => {
    const dia = parseInt(codigoVencimento?.replace('D', '') || '0');
    if (dia <= 10) return 'text-red-400';
    if (dia <= 20) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleSaveCartao = async (data) => {
    try {
      const cartaoData = {
        ...data,
        limiteCredito: parseFloat(data.limiteCredito) || null,
        vencimentoDia: parseInt(data.vencimentoDia) || null
      };

      if (editingCartao) {
        await atualizarCartao.mutateAsync({
          id: editingCartao.id,
          dados: cartaoData
        });
      } else {
        await criarCartao.mutateAsync(cartaoData);
      }

      setShowModal(false);
      setEditingCartao(null);
      reset();
      refetch();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const handleEditCartao = (cartao) => {
    setEditingCartao(cartao);
    reset(cartao);
    setShowModal(true);
  };

  const handleDeleteCartao = async (cartao) => {
    if (window.confirm(`Tem certeza que deseja desativar o cartão ${cartao.nome}?`)) {
      try {
        await desativarCartao.mutateAsync(cartao.id);
        refetch();
      } catch (error) {
        console.error('Erro ao desativar cartão:', error);
      }
    }
  };

  const handleViewExtrato = (cartao) => {
    setSelectedCartao(cartao);
    setShowExtrato(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCartao(null);
    reset();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Cartões</h1>
          <p className="text-gray-400">
            Controle de cartões de crédito e contas bancárias
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => refetch()}
            className="btn-outline"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cartão
          </button>
        </div>
      </div>

      {/* Cards dos Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card-planilha">
              <div className="p-6">
                <div className="skeleton h-4 w-24 mb-4"></div>
                <div className="skeleton h-6 w-32 mb-2"></div>
                <div className="skeleton h-4 w-20 mb-4"></div>
                <div className="skeleton h-2 w-full mb-2"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            </div>
          ))
        ) : cartoesData?.cartoes?.length > 0 ? (
          cartoesData.cartoes.map((cartao) => (
            <div key={cartao.id} className="card-planilha hover:border-gray-600 transition-colors">
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">{cartao.nome}</h3>
                      <p className={`text-sm ${getVencimentoColor(cartao.codigoVencimento)}`}>
                        {cartao.codigoVencimento || 'S/V'}
                      </p>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(cartao.status)}`}></span>
                </div>

                {/* Valores */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Saldo Pendente:</span>
                    <span className="text-red-400 font-medium">
                      {formatCurrency(cartao.saldoPendente)}
                    </span>
                  </div>
                  
                  {cartao.limiteCredito && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Limite:</span>
                        <span className="text-gray-300">
                          {formatCurrency(cartao.limiteCredito)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Disponível:</span>
                        <span className="text-green-400 font-medium">
                          {formatCurrency(cartao.limiteDisponivel)}
                        </span>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Utilização</span>
                          <span className="text-xs text-gray-300">
                            {cartao.percentualUtilizado.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getStatusColor(cartao.status)}`}
                            style={{ width: `${Math.min(cartao.percentualUtilizado, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4
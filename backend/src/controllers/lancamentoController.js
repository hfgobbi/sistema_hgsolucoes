const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os lançamentos
exports.listarLancamentos = async (req, res) => {
  try {
    const lancamentos = await prisma.lancamento.findMany({
      include: {
        contaDebito: true,
        contaCredito: true,
        cartao: true
      },
      orderBy: {
        data: 'desc'
      }
    });
    res.json(lancamentos);
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    res.status(500).json({ error: 'Erro ao listar lançamentos' });
  }
};

// Obter um lançamento pelo ID
exports.obterLancamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lancamento = await prisma.lancamento.findUnique({
      where: {
        id: id
      },
      include: {
        contaDebito: true,
        contaCredito: true,
        cartao: true
      }
    });
    
    if (!lancamento) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    
    res.json(lancamento);
  } catch (error) {
    console.error('Erro ao obter lançamento:', error);
    res.status(500).json({ error: 'Erro ao obter lançamento' });
  }
};

// Criar um novo lançamento
exports.criarLancamento = async (req, res) => {
  try {
    const { 
      descricao, 
      valor, 
      data, 
      contaDebitoId, 
      contaCreditoId, 
      cartaoId, 
      parcelas, 
      observacao, 
      tipoLancamento,
      categoria 
    } = req.body;
    
    if (!descricao || !valor || !data) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios não preenchidos',
        requiredFields: ['descricao', 'valor', 'data']
      });
    }
    
    const novoLancamento = await prisma.lancamento.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        data: new Date(data),
        contaDebito: contaDebitoId ? {
          connect: { id: contaDebitoId }
        } : undefined,
        contaCredito: contaCreditoId ? {
          connect: { id: contaCreditoId }
        } : undefined,
        cartao: cartaoId ? {
          connect: { id: cartaoId }
        } : undefined,
        parcelas: parcelas || 1,
        observacao: observacao || null,
        tipoLancamento: tipoLancamento || 'despesa',
        categoria: categoria || 'OUTRAS'
      }
    });
    
    res.status(201).json(novoLancamento);
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    res.status(500).json({ error: 'Erro ao criar lançamento' });
  }
};

// Atualizar um lançamento
exports.atualizarLancamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      descricao, 
      valor, 
      data, 
      contaDebitoId, 
      contaCreditoId, 
      cartaoId, 
      parcelas, 
      observacao, 
      tipoLancamento,
      categoria 
    } = req.body;
    
    // Verificar se o lançamento existe
    const lancamentoExistente = await prisma.lancamento.findUnique({
      where: {
        id: id
      }
    });
    
    if (!lancamentoExistente) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    
    // Preparar os dados a serem atualizados
    const dadosAtualizacao = {
      descricao: descricao || lancamentoExistente.descricao,
      valor: valor !== undefined ? parseFloat(valor) : lancamentoExistente.valor,
      data: data ? new Date(data) : lancamentoExistente.data,
      parcelas: parcelas || lancamentoExistente.parcelas,
      observacao: observacao !== undefined ? observacao : lancamentoExistente.observacao,
      tipoLancamento: tipoLancamento || lancamentoExistente.tipoLancamento,
      categoria: categoria !== undefined ? categoria : lancamentoExistente.categoria,
      updatedAt: new Date()
    };

    // Adicionar relacionamentos apenas se forem fornecidos
    if (contaDebitoId) {
      dadosAtualizacao.contaDebito = {
        connect: { id: contaDebitoId }
      };
    }
    
    if (contaCreditoId) {
      dadosAtualizacao.contaCredito = {
        connect: { id: contaCreditoId }
      };
    }
    
    if (cartaoId) {
      dadosAtualizacao.cartao = {
        connect: { id: cartaoId }
      };
    }
    
    const lancamentoAtualizado = await prisma.lancamento.update({
      where: {
        id: id
      },
      data: dadosAtualizacao
    });
    
    res.json(lancamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar lançamento' });
  }
};

// Excluir um lançamento
exports.excluirLancamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o lançamento existe
    const lancamentoExistente = await prisma.lancamento.findUnique({
      where: {
        id: id
      }
    });
    
    if (!lancamentoExistente) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    
    await prisma.lancamento.delete({
      where: {
        id: id
      }
    });
    
    res.status(200).json({ message: 'Lançamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    res.status(500).json({ error: 'Erro ao excluir lançamento' });
  }
};

// Obter resumo de lançamentos por categoria
exports.obterResumoCategorias = async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    if (!ano || !mes) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios não fornecidos',
        requiredParams: ['ano', 'mes']
      });
    }

    // Converter para números
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    // Definir data de início e fim do mês
    const dataInicio = new Date(anoNum, mesNum - 1, 1);
    const dataFim = new Date(anoNum, mesNum, 0);
    
    // Obter lançamentos do período
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        contaDebito: true,
        contaCredito: true
      }
    });
    
    // Agrupar por categorias
    const categorias = {};
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    lancamentos.forEach(lancamento => {
      // Determinar a categoria baseada na conta débito ou crédito
      let categoria = 'SEM CATEGORIA';
      let tipo = 'despesa';
      
      if (lancamento.contaCredito && lancamento.contaCredito.categoria) {
        categoria = lancamento.contaCredito.categoria;
        if (lancamento.contaCredito.tipo === 'RECEITA') {
          tipo = 'receita';
        }
      } else if (lancamento.contaDebito && lancamento.contaDebito.categoria) {
        categoria = lancamento.contaDebito.categoria;
        if (lancamento.contaDebito.tipo === 'RECEITA') {
          tipo = 'receita';
        }
      }
      
      // Inicializar categoria se não existir
      if (!categorias[categoria]) {
        categorias[categoria] = { total: 0, tipo };
      }
      
      // Adicionar valor
      categorias[categoria].total += lancamento.valor;
      
      // Atualizar totais
      if (tipo === 'receita') {
        totalReceitas += lancamento.valor;
      } else {
        totalDespesas += lancamento.valor;
      }
    });
    
    // Converter para array para facilitar o uso no frontend
    const categoriasArray = Object.keys(categorias).map(nome => ({
      categoria: nome,
      valor: categorias[nome].total,
      tipo: categorias[nome].tipo
    }));
    
    res.json({
      kpis: {
        receitas: {
          total: totalReceitas,
          porCategoria: categoriasArray.filter(c => c.tipo === 'receita')
        },
        despesas: {
          total: totalDespesas,
          porCategoria: categoriasArray.filter(c => c.tipo === 'despesa')
        },
        saldo: totalReceitas - totalDespesas
      }
    });
  } catch (error) {
    console.error('Erro ao obter resumo de categorias:', error);
    res.status(500).json({ error: 'Erro ao obter resumo de categorias' });
  }
};

// Obter extrato diário
exports.obterExtratoDiario = async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    if (!ano || !mes) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios não fornecidos',
        requiredParams: ['ano', 'mes']
      });
    }

    // Converter para números
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    // Definir data de início e fim do mês
    const dataInicio = new Date(anoNum, mesNum - 1, 1);
    const dataFim = new Date(anoNum, mesNum, 0);
    
    // Obter lançamentos do período
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        contaDebito: true,
        contaCredito: true,
        cartao: true
      },
      orderBy: {
        data: 'asc'
      }
    });
    
    // Organizar por data
    const extratoPorDia = {};
    let saldoAnterior = 0; // Em um sistema real, seria calculado
    let saldoAtual = saldoAnterior;
    
    // Obter todos os dias do mês
    const diasNoMes = new Date(anoNum, mesNum, 0).getDate();
    
    // Inicializar todos os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataStr = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      extratoPorDia[dataStr] = {
        data: dataStr,
        lancamentos: [],
        totalEntradas: 0,
        totalSaidas: 0,
        saldoDia: 0,
        saldoAcumulado: saldoAtual
      };
    }
    
    // Adicionar lançamentos aos respectivos dias
    lancamentos.forEach(lancamento => {
      const dataObj = new Date(lancamento.data);
      const dataStr = dataObj.toISOString().split('T')[0];
      
      // Determinar se é entrada ou saída
      const isEntrada = lancamento.contaCredito?.tipo === 'RECEITA' || 
                       lancamento.contaDebito?.tipo === 'RECEITA';
      
      if (extratoPorDia[dataStr]) {
        // Adicionar lançamento ao dia
        extratoPorDia[dataStr].lancamentos.push({
          id: lancamento.id,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          tipo: isEntrada ? 'entrada' : 'saida',
          categoria: lancamento.contaCredito?.categoria || lancamento.contaDebito?.categoria || 'Sem categoria'
        });
        
        // Atualizar totais do dia
        if (isEntrada) {
          extratoPorDia[dataStr].totalEntradas += lancamento.valor;
          saldoAtual += lancamento.valor;
        } else {
          extratoPorDia[dataStr].totalSaidas += lancamento.valor;
          saldoAtual -= lancamento.valor;
        }
        
        extratoPorDia[dataStr].saldoDia = extratoPorDia[dataStr].totalEntradas - extratoPorDia[dataStr].totalSaidas;
        extratoPorDia[dataStr].saldoAcumulado = saldoAtual;
      }
    });
    
    // Converter para array
    const extratoArray = Object.values(extratoPorDia);
    
    res.json({
      extrato: extratoArray,
      resumo: {
        saldoInicial: saldoAnterior,
        totalEntradas: extratoArray.reduce((sum, dia) => sum + dia.totalEntradas, 0),
        totalSaidas: extratoArray.reduce((sum, dia) => sum + dia.totalSaidas, 0),
        saldoFinal: saldoAtual
      }
    });
  } catch (error) {
    console.error('Erro ao obter extrato diário:', error);
    res.status(500).json({ error: 'Erro ao obter extrato diário' });
  }
};

// Obter balancete mensal
exports.obterBalancete = async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    if (!ano || !mes) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios não fornecidos',
        requiredParams: ['ano', 'mes']
      });
    }

    // Converter para números
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    // Definir data de início e fim do mês
    const dataInicio = new Date(anoNum, mesNum - 1, 1);
    const dataFim = new Date(anoNum, mesNum, 0);
    
    // Obter lançamentos do período
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        contaDebito: true,
        contaCredito: true
      }
    });
    
    // Obter todas as contas
    const contas = await prisma.conta.findMany();
    const contasPorId = {};
    contas.forEach(conta => {
      contasPorId[conta.id] = conta;
    });
    
    // Calcular saldos por conta
    const saldosPorConta = {};
    
    contas.forEach(conta => {
      saldosPorConta[conta.id] = {
        id: conta.id,
        nome: conta.nome,
        saldoInicial: conta.saldoInicial || 0,
        debitos: 0,
        creditos: 0,
        saldoFinal: conta.saldoInicial || 0,
        tipo: conta.tipo
      };
    });
    
    // Processar lançamentos
    lancamentos.forEach(lancamento => {
      if (lancamento.contaDebitoId && saldosPorConta[lancamento.contaDebitoId]) {
        saldosPorConta[lancamento.contaDebitoId].debitos += lancamento.valor;
        saldosPorConta[lancamento.contaDebitoId].saldoFinal -= lancamento.valor;
      }
      
      if (lancamento.contaCreditoId && saldosPorConta[lancamento.contaCreditoId]) {
        saldosPorConta[lancamento.contaCreditoId].creditos += lancamento.valor;
        saldosPorConta[lancamento.contaCreditoId].saldoFinal += lancamento.valor;
      }
    });
    
    // Converter para array
    const balancete = Object.values(saldosPorConta);
    
    // Calcular totais
    const totais = {
      saldoInicial: balancete.reduce((sum, conta) => sum + conta.saldoInicial, 0),
      debitos: balancete.reduce((sum, conta) => sum + conta.debitos, 0),
      creditos: balancete.reduce((sum, conta) => sum + conta.creditos, 0),
      saldoFinal: balancete.reduce((sum, conta) => sum + conta.saldoFinal, 0)
    };
    
    res.json({
      balancete,
      totais
    });
  } catch (error) {
    console.error('Erro ao obter balancete:', error);
    res.status(500).json({ error: 'Erro ao obter balancete' });
  }
};

// Criar múltiplos lançamentos em lote
exports.criarLancamentosEmLote = async (req, res) => {
  try {
    const { lancamentos } = req.body;
    
    if (!lancamentos || !Array.isArray(lancamentos) || lancamentos.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum lançamento válido fornecido',
        requiredFields: ['lancamentos (array)'] 
      });
    }
    
    const resultados = [];
    
    // Usar transação para garantir atomicidade
    await prisma.$transaction(async (prisma) => {
      for (const item of lancamentos) {
        const { 
          descricao, 
          valor, 
          dataLancamento, 
          contaDebitoId, 
          contaCreditoId, 
          cartaoId, 
          parcelas, 
          observacao, 
          tipoLancamento,
          categoria 
        } = item;
        
        if (!descricao || !valor || !dataLancamento) {
          throw new Error('Campos obrigatórios não preenchidos');
        }
        
        const novoLancamento = await prisma.lancamento.create({
          data: {
            descricao,
            valor: parseFloat(valor),
            data: new Date(dataLancamento),
            contaDebito: contaDebitoId ? {
              connect: { id: contaDebitoId }
            } : undefined,
            contaCredito: contaCreditoId ? {
              connect: { id: contaCreditoId }
            } : undefined,
            cartao: cartaoId ? {
              connect: { id: cartaoId }
            } : undefined,
            parcelas: parcelas || 1,
            observacao: observacao || null,
            tipoLancamento: tipoLancamento || 'despesa',
            categoria: categoria || 'OUTRAS'
          }
        });
        
        resultados.push(novoLancamento);
      }
    });
    
    res.status(201).json({
      success: true,
      message: `${resultados.length} lançamentos criados com sucesso`,
      lancamentos: resultados
    });
  } catch (error) {
    console.error('Erro ao criar lançamentos em lote:', error);
    res.status(500).json({ error: 'Erro ao criar lançamentos em lote' });
  }
};

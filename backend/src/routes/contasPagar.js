const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obter todas as contas a pagar
router.get("/", async (req, res) => {
  try {
    const { mes, ano, status } = req.query;
    
    // Construir filtros
    let where = {};
    
    if (mes && ano) {
      const mesFiltro = parseInt(mes);
      const anoFiltro = parseInt(ano);
      
      const dataInicio = new Date(anoFiltro, mesFiltro - 1, 1);
      const dataFim = new Date(anoFiltro, mesFiltro, 0, 23, 59, 59);
      
      where.vencimento = {
        gte: dataInicio,
        lte: dataFim
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    // Verificar se há contas a pagar no banco
    const contasPagar = await prisma.contaPagar.findMany({
      where,
      orderBy: {
        vencimento: 'asc'
      }
    });
    
    // Se não houver registros e não há filtros específicos, retornar dados mock
    if (contasPagar.length === 0 && !status && !mes && !ano) {
      // Dados mock para demonstração
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();
      const mesAtual = dataAtual.getMonth() + 1;
      
      const contasMock = [
        {
          id: 'mock-1',
          descricao: 'Aluguel Comercial',
          valor: 2500.00,
          vencimento: new Date(anoAtual, mesAtual - 1, 10),
          dataPagamento: null,
          status: 'PENDENTE',
          observacoes: 'Pagamento mensal',
          categoria: 'Aluguel'
        },
        {
          id: 'mock-2',
          descricao: 'Conta de Luz',
          valor: 487.35,
          vencimento: new Date(anoAtual, mesAtual - 1, 15),
          dataPagamento: new Date(anoAtual, mesAtual - 1, 14),
          status: 'PAGO',
          observacoes: 'Consumo mensal',
          categoria: 'Utilidades'
        },
        {
          id: 'mock-3',
          descricao: 'Serviços de Internet',
          valor: 199.90,
          vencimento: new Date(anoAtual, mesAtual - 1, 20),
          dataPagamento: null,
          status: 'PENDENTE',
          observacoes: 'Internet fibra óptica',
          categoria: 'Utilidades'
        }
      ];
      
      return res.json(contasMock);
    }
    
    res.json(contasPagar);
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
});

// Obter uma conta a pagar específica
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const contaPagar = await prisma.contaPagar.findUnique({
      where: { id }
    });
    
    if (!contaPagar) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }
    
    res.json(contaPagar);
  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error);
    res.status(500).json({ error: 'Erro ao buscar conta a pagar' });
  }
});

// Criar nova conta a pagar
router.post("/", async (req, res) => {
  try {
    console.log('Dados recebidos na rota POST /contas-pagar:', req.body);
    
    const { 
      descricao, valor, vencimento, dataPagamento, 
      status, observacoes, categoria, cartaoContaId, contaId 
    } = req.body;
    
    // Validações básicas
    if (!descricao || !valor || !vencimento) {
      console.log('Validação falhou:', { descricao, valor, vencimento });
      return res.status(400).json({ 
        error: 'Dados incompletos',
        message: 'Descrição, valor e data de vencimento são obrigatórios'
      });
    }
    
    const novaConta = await prisma.contaPagar.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        vencimento: new Date(vencimento),
        dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
        status: status || 'pendente',
        observacoes,
        categoria,
        cartaoContaId,
        contaId
      }
    });
    
    res.status(201).json(novaConta);
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    res.status(500).json({ 
      error: 'Erro ao criar conta a pagar',
      message: error.message,
      details: error.stack
    });
  }
});

// Atualizar conta a pagar existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      descricao, valor, vencimento, dataPagamento, 
      status, observacoes, categoria, cartaoContaId, contaId, valorPago 
    } = req.body;
    
    // Verificar se a conta existe
    const contaExistente = await prisma.contaPagar.findUnique({where: { id }});
    if (!contaExistente) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }
    
    const contaAtualizada = await prisma.contaPagar.update({
      where: { id },
      data: {
        descricao: descricao !== undefined ? descricao : undefined,
        valor: valor !== undefined ? parseFloat(valor) : undefined,
        vencimento: vencimento !== undefined ? new Date(vencimento) : undefined,
        dataPagamento: dataPagamento !== undefined ? new Date(dataPagamento) : undefined,
        valorPago: valorPago !== undefined ? parseFloat(valorPago) : undefined,
        status: status !== undefined ? status : undefined,
        observacoes: observacoes !== undefined ? observacoes : undefined,
        categoria: categoria !== undefined ? categoria : undefined,
        cartaoContaId: cartaoContaId !== undefined ? cartaoContaId : undefined,
        contaId: contaId !== undefined ? contaId : undefined
      }
    });
    
    res.json(contaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
  }
});

// Excluir conta a pagar
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a conta existe
    const contaExistente = await prisma.contaPagar.findUnique({where: { id }});
    if (!contaExistente) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }
    
    await prisma.contaPagar.delete({
      where: { id }
    });
    
    res.json({ message: 'Conta a pagar excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta a pagar:', error);
    res.status(500).json({ error: 'Erro ao excluir conta a pagar' });
  }
});

module.exports = router;

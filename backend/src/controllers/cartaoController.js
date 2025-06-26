const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os cartões
exports.listarCartoes = async (req, res) => {
  try {
    const cartoes = await prisma.cartaoContas.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(cartoes);
  } catch (error) {
    console.error('Erro ao listar cartões:', error);
    res.status(500).json({ error: 'Erro ao listar cartões' });
  }
};

// Obter um cartão pelo ID
exports.obterCartaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cartao = await prisma.cartaoContas.findUnique({
      where: {
        id: id
      }
    });
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    
    res.json(cartao);
  } catch (error) {
    console.error('Erro ao obter cartão:', error);
    res.status(500).json({ error: 'Erro ao obter cartão' });
  }
};

// Criar um novo cartão
exports.criarCartao = async (req, res) => {
  try {
    const { nome, tipo, limiteCredito, vencimento, bandeiraCartao, contaPrincipal } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const novoCartao = await prisma.cartaoContas.create({
      data: {
        nome,
        tipo: tipo || 'CARTAO',
        limiteCredito: limiteCredito ? parseFloat(limiteCredito) : null,
        vencimento: vencimento || null,
        bandeiraCartao: bandeiraCartao || null,
        contaPrincipal: contaPrincipal || false
      }
    });
    
    res.status(201).json(novoCartao);
  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    res.status(500).json({ error: 'Erro ao criar cartão' });
  }
};

// Atualizar um cartão
exports.atualizarCartao = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, limiteCredito, vencimento, bandeiraCartao, contaPrincipal } = req.body;
    
    // Verificar se o cartão existe
    const cartaoExistente = await prisma.cartaoContas.findUnique({
      where: {
        id: id
      }
    });
    
    if (!cartaoExistente) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    
    const cartaoAtualizado = await prisma.cartaoContas.update({
      where: {
        id: id
      },
      data: {
        nome: nome || cartaoExistente.nome,
        tipo: tipo || cartaoExistente.tipo,
        limiteCredito: limiteCredito !== undefined ? parseFloat(limiteCredito) : cartaoExistente.limiteCredito,
        vencimento: vencimento !== undefined ? vencimento : cartaoExistente.vencimento,
        bandeiraCartao: bandeiraCartao !== undefined ? bandeiraCartao : cartaoExistente.bandeiraCartao,
        contaPrincipal: contaPrincipal !== undefined ? contaPrincipal : cartaoExistente.contaPrincipal,
        updatedAt: new Date()
      }
    });
    
    res.json(cartaoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    res.status(500).json({ error: 'Erro ao atualizar cartão' });
  }
};

// Excluir um cartão
exports.excluirCartao = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o cartão existe
    const cartaoExistente = await prisma.cartaoContas.findUnique({
      where: {
        id: id
      }
    });
    
    if (!cartaoExistente) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    
    await prisma.cartaoContas.delete({
      where: {
        id: id
      }
    });
    
    res.status(200).json({ message: 'Cartão excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cartão:', error);
    res.status(500).json({ error: 'Erro ao excluir cartão' });
  }
};

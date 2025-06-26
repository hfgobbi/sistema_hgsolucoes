const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as fontes de renda
exports.listarFontesRenda = async (req, res) => {
  try {
    // Extrair parâmetros de consulta
    const { mes, ano } = req.query;
    
    // Log para facilitar debug
    console.log('Filtros de busca para fontes de renda:', { mes, ano });
    
    // Encontrar todas as fontes de renda (não implementamos filtragem por mês/ano aqui 
    // porque as fontes são persistentes - mas adicionamos o suporte para a API ser consistente)
    const fontesRenda = await prisma.fonteRenda.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    
    res.json(fontesRenda);
  } catch (error) {
    console.error('Erro ao listar fontes de renda:', error);
    res.status(500).json({ error: 'Erro ao listar fontes de renda' });
  }
};

// Obter uma fonte de renda pelo ID
exports.obterFonteRendaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fonteRenda = await prisma.fonteRenda.findUnique({
      where: {
        id: id
      }
    });
    
    if (!fonteRenda) {
      return res.status(404).json({ error: 'Fonte de renda não encontrada' });
    }
    
    res.json(fonteRenda);
  } catch (error) {
    console.error('Erro ao obter fonte de renda:', error);
    res.status(500).json({ error: 'Erro ao obter fonte de renda' });
  }
};

// Criar uma nova fonte de renda
exports.criarFonteRenda = async (req, res) => {
  try {
    const { nome, descricao, tipo, valorMensal, cor, ativo } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'O nome da fonte de renda é obrigatório' });
    }
    
    const novaFonteRenda = await prisma.fonteRenda.create({
      data: {
        nome,
        descricao: descricao || nome,
        tipo: tipo || 'OUTRAS',
        valorMensal: valorMensal ? parseFloat(valorMensal) : 0,
        cor: cor || null,
        ativo: ativo !== undefined ? ativo : true
      }
    });
    
    res.status(201).json(novaFonteRenda);
  } catch (error) {
    console.error('Erro ao criar fonte de renda:', error);
    res.status(500).json({
      error: 'Erro ao criar fonte de renda',
      message: error.message,
      details: error.stack,
      data: req.body
    });
  }
};

// Atualizar uma fonte de renda
exports.atualizarFonteRenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, valorMensal, descricao, cor, ativo } = req.body;
    
    console.log('Dados recebidos para atualizar fonte de renda:', req.body);
    
    // Verificar se a fonte de renda existe
    const fonteRendaExistente = await prisma.fonteRenda.findUnique({
      where: {
        id: id
      }
    });
    
    if (!fonteRendaExistente) {
      return res.status(404).json({ error: 'Fonte de renda não encontrada' });
    }
    
    const fonteRendaAtualizada = await prisma.fonteRenda.update({
      where: {
        id: id
      },
      data: {
        nome: nome || fonteRendaExistente.nome,
        descricao: descricao || fonteRendaExistente.descricao,
        tipo: tipo || fonteRendaExistente.tipo,
        valorMensal: valorMensal !== undefined ? parseFloat(valorMensal) : fonteRendaExistente.valorMensal,
        cor: cor !== undefined ? cor : fonteRendaExistente.cor,
        ativo: ativo !== undefined ? ativo : fonteRendaExistente.ativo,
        updatedAt: new Date()
      }
    });
    
    res.json(fonteRendaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar fonte de renda:', error);
    res.status(500).json({
      error: 'Erro ao atualizar fonte de renda',
      message: error.message,
      details: error.stack,
      id: req.params.id,
      data: req.body
    });
  }
};

// Excluir uma fonte de renda
exports.excluirFonteRenda = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a fonte de renda existe
    const fonteRendaExistente = await prisma.fonteRenda.findUnique({
      where: {
        id: id
      }
    });
    
    if (!fonteRendaExistente) {
      return res.status(404).json({ error: 'Fonte de renda não encontrada' });
    }
    
    await prisma.fonteRenda.delete({
      where: {
        id: id
      }
    });
    
    res.status(200).json({ message: 'Fonte de renda excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fonte de renda:', error);
    res.status(500).json({ error: 'Erro ao excluir fonte de renda' });
  }
};

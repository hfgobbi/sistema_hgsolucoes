const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obter todos os registros de fluxo de caixa
router.get("/", async (req, res) => {
  try {
    const { ano, mes, dia } = req.query;
    
    // Montar filtros
    const filtros = {};
    
    if (ano && mes) {
      const anoNum = parseInt(ano);
      const mesNum = parseInt(mes);
      
      // Definir data de início e fim do mês
      let dataInicio, dataFim;
      
      if (dia) {
        const diaNum = parseInt(dia);
        dataInicio = new Date(anoNum, mesNum - 1, diaNum, 0, 0, 0);
        dataFim = new Date(anoNum, mesNum - 1, diaNum, 23, 59, 59);
      } else {
        dataInicio = new Date(anoNum, mesNum - 1, 1);
        dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59);
      }
      
      filtros.data = {
        gte: dataInicio,
        lte: dataFim
      };
    }
    
    // Verificar se há registros reais no banco de dados
    const fluxoReal = await prisma.fluxoCaixaDiario.findMany({
      where: filtros,
      orderBy: {
        data: 'asc'
      }
    });
    
    // Se não houver registros, retornar dados simulados
    if (fluxoReal.length === 0) {
      // Criar dados simulados de fluxo de caixa
      const anoNum = parseInt(ano) || new Date().getFullYear();
      const mesNum = parseInt(mes) || new Date().getMonth() + 1;
      const diasNoMes = new Date(anoNum, mesNum, 0).getDate();
      
      const fluxoSimulado = [];
      let saldoAcumulado = 10000; // Saldo inicial simulado
      
      for (let dia = 1; dia <= diasNoMes; dia++) {
        const entradas = 1000 + Math.random() * 1000;
        const saidas = 800 + Math.random() * 700;
        const saldoDia = entradas - saidas;
        saldoAcumulado += saldoDia;
        
        fluxoSimulado.push({
          id: `simulado-${dia}`,
          data: new Date(anoNum, mesNum - 1, dia),
          entradas: parseFloat(entradas.toFixed(2)),
          saidas: parseFloat(saidas.toFixed(2)),
          saldoDia: parseFloat(saldoDia.toFixed(2)),
          saldoAcumulado: parseFloat(saldoAcumulado.toFixed(2)),
          observacao: 'Dados simulados para demonstração'
        });
      }
      
      return res.json({
        fluxo: fluxoSimulado,
        meta: {
          totalEntradas: fluxoSimulado.reduce((sum, item) => sum + item.entradas, 0),
          totalSaidas: fluxoSimulado.reduce((sum, item) => sum + item.saidas, 0),
          saldoFinal: saldoAcumulado,
          simulado: true
        }
      });
    }
    
    // Calcular saldos acumulados para dados reais
    let saldoAcumulado = 0;
    const fluxoProcessado = fluxoReal.map((registro) => {
      const saldoDia = registro.entradas - registro.saidas;
      saldoAcumulado += saldoDia;
      
      return {
        ...registro,
        saldoDia,
        saldoAcumulado
      };
    });
    
    res.json({
      fluxo: fluxoProcessado,
      meta: {
        totalEntradas: fluxoProcessado.reduce((sum, item) => sum + item.entradas, 0),
        totalSaidas: fluxoProcessado.reduce((sum, item) => sum + item.saidas, 0),
        saldoFinal: saldoAcumulado,
        simulado: false
      }
    });
  } catch (error) {
    console.error('Erro ao obter fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao obter fluxo de caixa' });
  }
});

// Obter um registro específico de fluxo de caixa
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const fluxoCaixa = await prisma.fluxoCaixaDiario.findUnique({
      where: { id }
    });
    
    if (!fluxoCaixa) {
      return res.status(404).json({ error: 'Registro de fluxo de caixa não encontrado' });
    }
    
    res.json(fluxoCaixa);
  } catch (error) {
    console.error('Erro ao obter registro de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao obter registro de fluxo de caixa' });
  }
});

// Criar um novo registro de fluxo de caixa
router.post("/", async (req, res) => {
  try {
    const { data, entradas, saidas, observacao } = req.body;
    
    if (!data || entradas === undefined || saidas === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios não preenchidos',
        requiredFields: ['data', 'entradas', 'saidas']
      });
    }
    
    const novoFluxo = await prisma.fluxoCaixaDiario.create({
      data: {
        data: new Date(data),
        entradas: parseFloat(entradas),
        saidas: parseFloat(saidas),
        observacao: observacao || ''
      }
    });
    
    res.status(201).json(novoFluxo);
  } catch (error) {
    console.error('Erro ao criar registro de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao criar registro de fluxo de caixa' });
  }
});

// Atualizar um registro de fluxo de caixa
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, entradas, saidas, observacao } = req.body;
    
    // Verificar se o registro existe
    const fluxoExistente = await prisma.fluxoCaixaDiario.findUnique({
      where: { id }
    });
    
    if (!fluxoExistente) {
      return res.status(404).json({ error: 'Registro de fluxo de caixa não encontrado' });
    }
    
    // Atualizar o registro
    const fluxoAtualizado = await prisma.fluxoCaixaDiario.update({
      where: { id },
      data: {
        data: data ? new Date(data) : undefined,
        entradas: entradas !== undefined ? parseFloat(entradas) : undefined,
        saidas: saidas !== undefined ? parseFloat(saidas) : undefined,
        observacao: observacao !== undefined ? observacao : undefined
      }
    });
    
    res.json(fluxoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar registro de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao atualizar registro de fluxo de caixa' });
  }
});

// Excluir um registro de fluxo de caixa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o registro existe
    const fluxoExistente = await prisma.fluxoCaixaDiario.findUnique({
      where: { id }
    });
    
    if (!fluxoExistente) {
      return res.status(404).json({ error: 'Registro de fluxo de caixa não encontrado' });
    }
    
    // Excluir o registro
    await prisma.fluxoCaixaDiario.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Registro de fluxo de caixa excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir registro de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao excluir registro de fluxo de caixa' });
  }
});

module.exports = router;

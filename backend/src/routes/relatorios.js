const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Relatório anual
router.get("/anual", async (req, res) => {
  try {
    const { ano } = req.query;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é um parâmetro obrigatório' });
    }
    
    // Relatório anual básico com dados de exemplo
    const relatorioAnual = {
      ano: parseInt(ano),
      receitas: 120000.00,
      despesas: 95000.00,
      lucro: 25000.00,
      mesesDestaque: [
        { mes: 3, valor: 12500.00, descricao: 'Melhor mês em receitas' },
        { mes: 7, valor: 11200.00, descricao: 'Segundo melhor mês' },
        { mes: 9, valor: 10800.00, descricao: 'Terceiro melhor mês' }
      ],
      destaques: {
        maiorReceita: {
          valor: 15000.00,
          descricao: 'Projeto de consultoria'
        },
        maiorDespesa: {
          valor: 8500.00,
          descricao: 'Compra de equipamentos'
        }
      },
      comparativoAnoAnterior: {
        crescimentoReceitas: 8.5,
        crescimentoDespesas: 5.2,
        crescimentoLucro: 12.3
      }
    };
    
    res.json(relatorioAnual);
  } catch (error) {
    console.error('Erro ao gerar relatório anual:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório anual' });
  }
});

// Relatório mensal
router.get("/mensal", async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    if (!ano || !mes) {
      return res.status(400).json({ error: 'Ano e mês são parâmetros obrigatórios' });
    }
    
    // Criar dados simulados para o relatório mensal
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    // Dados simulados de fluxo de caixa mensal
    const saldoInicial = 15000.00 + (mesNum * 1000);
    const totalReceitas = 25000.00 + (mesNum * 500);
    const totalDespesas = 18000.00 + (mesNum * 300);
    const saldoFinal = saldoInicial + totalReceitas - totalDespesas;
    
    // Lista de categorias com valores simulados
    const categorias = [
      { nome: 'Serviços', valor: 5000.00 + (mesNum * 100) },
      { nome: 'Produtos', valor: 4000.00 + (mesNum * 80) },
      { nome: 'Consultoria', valor: 6000.00 + (mesNum * 120) },
      { nome: 'Infraestrutura', valor: 3000.00 + (mesNum * 60) }
    ];
    
    // Análise de tendências
    const tendencias = {
      maioresGastos: 'Consultoria e Serviços representaram 60% dos gastos deste mês.',
      recomendacoes: 'Considere reduzir gastos em Infraestrutura em 10% para o próximo mês.',
      previsao: `Previsão de aumento de 5% nas receitas para ${mesNum === 12 ? 'Janeiro' : mesNum + 1}/${mesNum === 12 ? anoNum + 1 : anoNum}.`
    };
    
    const relatorioMensal = {
      ano: anoNum,
      mes: mesNum,
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro: totalReceitas - totalDespesas,
      saldoInicial,
      saldoFinal,
      categorias,
      tendencias,
      detalhamento: {
        receitasPorFonte: [
          { fonte: 'Cliente A', valor: totalReceitas * 0.3 },
          { fonte: 'Cliente B', valor: totalReceitas * 0.25 },
          { fonte: 'Cliente C', valor: totalReceitas * 0.2 },
          { fonte: 'Outros', valor: totalReceitas * 0.25 }
        ],
        despesasPorCategoria: [
          { categoria: 'Pessoal', valor: totalDespesas * 0.4 },
          { categoria: 'Operacional', valor: totalDespesas * 0.3 },
          { categoria: 'Marketing', valor: totalDespesas * 0.1 },
          { categoria: 'Outros', valor: totalDespesas * 0.2 }
        ]
      }
    };
    
    res.json(relatorioMensal);
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório mensal' });
  }
});

// Download de relatório mensal
router.get("/mensal/download", (req, res) => {
  try {
    // Em uma implementação real, este endpoint geraria um PDF
    // Para esta simulação, vamos apenas enviar um texto
    const { ano, mes } = req.query;
    
    if (!ano || !mes) {
      return res.status(400).json({ error: 'Ano e mês são parâmetros obrigatórios' });
    }
    
    // Criar texto simulando um relatório PDF
    const relatorioTexto = `Relatório Financeiro - ${mes}/${ano}\n\n`+
                          `Receitas: R$ 25.000,00\n`+
                          `Despesas: R$ 18.000,00\n`+
                          `Lucro: R$ 7.000,00\n\n`+
                          `Este é um arquivo de exemplo para download.`;
    
    // Enviar como um arquivo para download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${mes}-${ano}.txt`);
    res.send(relatorioTexto);
  } catch (error) {
    console.error('Erro ao gerar arquivo de relatório mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar arquivo de relatório mensal' });
  }
});

// Relatório de fluxo de caixa
router.get("/fluxo-caixa", async (req, res) => {
  try {
    const { ano } = req.query;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é um parâmetro obrigatório' });
    }
    
    // Dados simulados para fluxo de caixa anual por mês
    const anoNum = parseInt(ano);
    const fluxoCaixa = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      const receitas = 20000 + (mes * 500) + (Math.random() * 1000);
      const despesas = 15000 + (mes * 300) + (Math.random() * 800);
      const saldo = receitas - despesas;
      
      fluxoCaixa.push({
        mes,
        receitas: parseFloat(receitas.toFixed(2)),
        despesas: parseFloat(despesas.toFixed(2)),
        saldo: parseFloat(saldo.toFixed(2))
      });
    }
    
    const totalReceitas = fluxoCaixa.reduce((sum, item) => sum + item.receitas, 0);
    const totalDespesas = fluxoCaixa.reduce((sum, item) => sum + item.despesas, 0);
    const saldoTotal = totalReceitas - totalDespesas;
    
    res.json({
      ano: anoNum,
      fluxoMensal: fluxoCaixa,
      totais: {
        receitas: parseFloat(totalReceitas.toFixed(2)),
        despesas: parseFloat(totalDespesas.toFixed(2)),
        saldo: parseFloat(saldoTotal.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de fluxo de caixa' });
  }
});

// Relatório de extrato de cartões
router.get("/cartoes-extrato", async (req, res) => {
  try {
    const { ano } = req.query;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é um parâmetro obrigatório' });
    }
    
    // Dados simulados para extrato de cartões
    const cartoes = [
      { id: '1', nome: 'Cartão Empresarial', limite: 15000, fechamento: 5 },
      { id: '2', nome: 'Cartão Executivo', limite: 10000, fechamento: 15 }
    ];
    
    const extratos = cartoes.map(cartao => ({
      cartaoId: cartao.id,
      cartaoNome: cartao.nome,
      limite: cartao.limite,
      meses: Array.from({ length: 12 }, (_, i) => {
        const valor = 2000 + (Math.random() * 3000);
        return {
          mes: i + 1,
          valor: parseFloat(valor.toFixed(2)),
          percentualLimite: parseFloat(((valor / cartao.limite) * 100).toFixed(1))
        };
      })
    }));
    
    res.json({
      ano: parseInt(ano),
      extratos
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de extrato de cartões:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de extrato de cartões' });
  }
});

// Relatório de metas e performance
router.get("/metas-performance", async (req, res) => {
  try {
    const { ano } = req.query;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é um parâmetro obrigatório' });
    }
    
    // Dados simulados para metas e performance
    const metas = [
      { categoria: 'Receitas', meta: 300000, realizado: 325000 },
      { categoria: 'Despesas', meta: 240000, realizado: 230000 },
      { categoria: 'Novos Clientes', meta: 50, realizado: 43 },
      { categoria: 'Retenção', meta: 90, realizado: 95 }
    ];
    
    res.json({
      ano: parseInt(ano),
      metas,
      avaliacaoGeral: 'Boa performance no ano, com superação das metas financeiras. Oportunidade de melhoria na aquisição de novos clientes.'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de metas e performance:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de metas e performance' });
  }
});

// Relatório de fornecedores
router.get("/fornecedores", async (req, res) => {
  try {
    const { ano, categoria } = req.query;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é um parâmetro obrigatório' });
    }
    
    // Dados simulados para fornecedores
    const fornecedores = [
      { nome: 'Fornecedor A', total: 45000, categoria: 'Serviços' },
      { nome: 'Fornecedor B', total: 38000, categoria: 'Produtos' },
      { nome: 'Fornecedor C', total: 27500, categoria: 'Serviços' },
      { nome: 'Fornecedor D', total: 19800, categoria: 'Infraestrutura' },
      { nome: 'Fornecedor E', total: 12500, categoria: 'Produtos' }
    ];
    
    let fornecedoresFiltrados = fornecedores;
    if (categoria) {
      fornecedoresFiltrados = fornecedores.filter(f => f.categoria === categoria);
    }
    
    res.json({
      ano: parseInt(ano),
      categoria: categoria || 'Todos',
      fornecedores: fornecedoresFiltrados,
      total: fornecedoresFiltrados.reduce((sum, f) => sum + f.total, 0)
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de fornecedores:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de fornecedores' });
  }
});

module.exports = router;

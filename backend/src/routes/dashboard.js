const express = require("express");
const router = express.Router();

// KPIs gerais do dashboard - Agora com dados reais do banco
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get("/kpis", async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    // Converter para números
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    // Validar parâmetros
    if (!anoNum || isNaN(anoNum) || anoNum < 2000 || anoNum > 2100) {
      return res.status(400).json({
        error: 'Ano inválido',
        mensagem: 'Forneça um ano válido entre 2000 e 2100'
      });
    }
    
    if (!mesNum || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        error: 'Mês inválido',
        mensagem: 'Forneça um mês válido entre 1 e 12'
      });
    }
    
    // Definir período de consulta (início e fim do mês)
    const inicioPeriodo = new Date(anoNum, mesNum - 1, 1);
    const fimPeriodo = new Date(anoNum, mesNum, 0); // Último dia do mês
    
    console.log(`Buscando KPIs para período: ${inicioPeriodo.toISOString()} até ${fimPeriodo.toISOString()}`);
    
    // Realizar consultas em paralelo para melhorar performance
    const [
      receitasContasRecebidas,
      receitasLancamentos,
      despesasResult,
      contagemTotal
    ] = await Promise.all([
      // 1. Buscar receitas do mês a partir das contas recebidas no período (apenas campos necessários)
      prisma.contaReceber.findMany({
        where: {
          dataRecebimento: {
            gte: inicioPeriodo,
            lte: fimPeriodo
          },
          status: 'recebido'
        },
        select: {
          id: true,
          descricao: true,
          valorRecebido: true,
          fonteRenda: {
            select: {
              id: true, 
              nome: true,
              tipo: true
            }
          }
        }
      }),
      
      // 2. Buscar receitas do mês a partir dos lançamentos de tipo "receita" (apenas campos necessários)
      prisma.lancamento.findMany({
        where: {
          data: {
            gte: inicioPeriodo,
            lte: fimPeriodo
          },
          tipoLancamento: 'receita'
        },
        select: {
          id: true,
          descricao: true,
          valor: true,
          categoria: true,
          observacoes: true,
          fonteRenda: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      }),
      
      // 3. Buscar despesas do mês (junto com as outras consultas)
      prisma.lancamento.findMany({
        where: {
          data: {
            gte: inicioPeriodo,
            lte: fimPeriodo
          },
          tipoLancamento: 'despesa'
        },
        select: {
          id: true,
          descricao: true,
          valor: true,
          categoria: true
        }
      }),
      
      // 4. Contar total de registros para monitoramento de performance
      prisma.lancamento.count({
        where: {
          data: {
            gte: new Date(anoNum, 0, 1),  // Início do ano
            lte: new Date(anoNum, 11, 31) // Fim do ano
          }
        }
      })
    ]);
    
    // Combinar resultados das duas fontes
    const receitasResult = [
      ...receitasLancamentos.map(item => ({
        id: item.id,
        nome: item.descricao,
        descricao: item.observacoes || '',
        valor: item.valor,
        tipo: item.categoria || (item.fonteRenda?.tipo || 'OUTRAS')
      })),
      ...receitasContasRecebidas.map(item => ({
        id: item.id,
        nome: item.descricao,
        descricao: item.descricao,
        valor: item.valorRecebido || 0,
        tipo: item.fonteRenda?.tipo || 'OUTRAS'
      }))
    ];
    
    // 3. Calcular os totais
    const totalReceitas = receitasResult.reduce((acc, item) => acc + Number(item.valor), 0);
    const totalDespesas = despesasResult.reduce((acc, item) => acc + Number(item.valor), 0);
    const saldoMes = totalReceitas - totalDespesas;
    
    // 4. Agrupar por categoria
    const receitasPorCategoria = [];
    const despesasPorCategoria = [];
    
    // Processar receitas por categoria
    const receitasCategorizadas = receitasResult.reduce((acc, item) => {
      const categoria = item.tipo || 'OUTRAS';
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += Number(item.valor);
      return acc;
    }, {});
    
    // Converter em array
    Object.entries(receitasCategorizadas).forEach(([categoria, valor]) => {
      receitasPorCategoria.push({ categoria, valor });
    });
    
    // Processar despesas por categoria
    const despesasCategorizadas = despesasResult.reduce((acc, item) => {
      const categoria = item.categoria || 'OUTRAS';
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += Number(item.valor);
      return acc;
    }, {});
    
    // Converter em array
    Object.entries(despesasCategorizadas).forEach(([categoria, valor]) => {
      despesasPorCategoria.push({ categoria, valor });
    });
    
    // 5. Formatar resposta final com dados reais
    res.json({
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: saldoMes,
      detalhes: {
        receitasPorCategoria,
        despesasPorCategoria
      },
      periodoConsulta: {
        inicio: inicioPeriodo,
        fim: fimPeriodo,
        ano: anoNum,
        mes: mesNum
      }
    });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({
      error: 'Erro ao buscar KPIs',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Fluxo mensal para o ano
router.get("/fluxo-mensal", async (req, res) => {
  try {
    const { ano } = req.query;
    const anoNum = parseInt(ano);
    
    if (!anoNum || isNaN(anoNum)) {
      return res.status(400).json({ error: 'Ano válido é obrigatório' });
    }
    
    // Array para armazenar resultados mensais
    const resultado = [];
    
    // Para cada mês do ano
    for (let mes = 1; mes <= 12; mes++) {
      // Definir período de consulta (início e fim do mês)
      const inicioPeriodo = new Date(anoNum, mes - 1, 1);
      const fimPeriodo = new Date(anoNum, mes, 0); // Último dia do mês
      
      // Buscar receitas: combinando contas recebidas e lançamentos
      const [receitasContasRecebidas, receitasLancamentos] = await Promise.all([
        prisma.contaReceber.findMany({
          where: {
            dataRecebimento: {
              gte: inicioPeriodo,
              lte: fimPeriodo
            },
            status: 'recebido'
          },
          select: {
            valorRecebido: true
          }
        }),
        
        prisma.lancamento.findMany({
          where: {
            data: {
              gte: inicioPeriodo,
              lte: fimPeriodo
            },
            tipoLancamento: 'receita'
          },
          select: {
            valor: true
          }
        })
      ]);
      
      // Buscar despesas
      const despesas = await prisma.lancamento.findMany({
        where: {
          data: {
            gte: inicioPeriodo,
            lte: fimPeriodo
          },
          tipoLancamento: 'despesa'
        },
        select: {
          valor: true
        }
      });
      
      // Calcular totais
      const totalReceitas = 
        receitasLancamentos.reduce((acc, item) => acc + Number(item.valor), 0) +
        receitasContasRecebidas.reduce((acc, item) => acc + Number(item.valorRecebido || 0), 0);
      
      const totalDespesas = despesas.reduce((acc, item) => acc + Number(item.valor), 0);
      const saldoMes = totalReceitas - totalDespesas;
      
      // Adicionar ao resultado
      resultado.push({
        mes,
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: saldoMes
      });
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar fluxo mensal:', error);
    res.status(500).json({
      error: 'Erro ao buscar fluxo mensal',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Resumo de cartões
router.get("/cartoes-resumo", async (req, res) => {
  try {
    // Buscar todos os cartões ativos
    const cartoes = await prisma.cartaoContas.findMany({
      where: {
        tipo: 'cartao',
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        limiteCredito: true
      }
    });
    
    // Para cada cartão, buscar o total pendente (lançamentos futuros)
    const resultado = await Promise.all(cartoes.map(async (cartao) => {
      // Obter data atual sem considerar o horário
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      // Buscar soma de lançamentos futuros para este cartão
      const totalPendente = await prisma.lancamento.aggregate({
        where: {
          cartaoContaId: cartao.id,
          data: {
            gte: hoje
          },
          tipoLancamento: 'despesa'
        },
        _sum: {
          valor: true
        }
      });
      
      const valorPendente = totalPendente._sum.valor || 0;
      const limiteCredito = Number(cartao.limiteCredito || 0);
      const percentualUtilizado = limiteCredito > 0 
        ? Math.round((valorPendente / limiteCredito) * 100) 
        : 0;
      
      return {
        id: cartao.id,
        nome: cartao.nome,
        limite: limiteCredito,
        totalPendente: valorPendente,
        percentualUtilizado
      };
    }));
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar resumo de cartões:', error);
    res.status(500).json({
      error: 'Erro ao buscar resumo de cartões',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Metas vs Realizado
router.get("/metas-vs-realizado", async (req, res) => {
  try {
    const { ano, mes } = req.query;
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    if (!anoNum || isNaN(anoNum) || !mesNum || isNaN(mesNum)) {
      return res.status(400).json({ error: 'Ano e mês válidos são obrigatórios' });
    }
    
    // Definir período de consulta (início e fim do mês)
    const inicioPeriodo = new Date(anoNum, mesNum - 1, 1);
    const fimPeriodo = new Date(anoNum, mesNum, 0); // Último dia do mês
    
    // Buscar metas cadastradas para o período
    const metas = await prisma.metaMensal.findMany({
      where: {
        ano: anoNum,
        mes: mesNum
      }
    });
    
    // Buscar despesas realizadas agrupadas por categoria
    const lancamentosPorCategoria = await prisma.lancamento.groupBy({
      by: ['categoria'],
      where: {
        data: {
          gte: inicioPeriodo,
          lte: fimPeriodo
        },
        tipoLancamento: 'despesa',
        categoria: {
          not: null
        }
      },
      _sum: {
        valor: true
      }
    });
    
    // Mapeamento dos valores realizados por categoria
    const realizadoPorCategoria = lancamentosPorCategoria.reduce((acc, item) => {
      acc[item.categoria] = Number(item._sum.valor || 0);
      return acc;
    }, {});
    
    // Combinar metas com valores realizados
    const resultado = metas.map(meta => {
      const realizado = realizadoPorCategoria[meta.categoria] || 0;
      const valorMeta = Number(meta.valorMeta || 0);
      const percentual = valorMeta > 0 ? Math.round((realizado / valorMeta) * 100) : 0;
      
      return {
        categoria: meta.categoria,
        meta: valorMeta,
        realizado,
        percentual
      };
    });
    
    // Adicionar categorias que têm despesas mas não têm meta
    Object.entries(realizadoPorCategoria).forEach(([categoria, realizado]) => {
      // Verificar se esta categoria já está no resultado
      const categoriaExistente = resultado.find(item => item.categoria === categoria);
      
      // Se não existir, adicionar
      if (!categoriaExistente) {
        resultado.push({
          categoria,
          meta: 0,
          realizado,
          percentual: 0 // Não há meta, então não há percentual
        });
      }
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar metas vs realizado:', error);
    res.status(500).json({
      error: 'Erro ao buscar metas vs realizado',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Próximos vencimentos
router.get("/proximos-vencimentos", async (req, res) => {
  try {
    const { dias = '7' } = req.query;
    const diasNum = parseInt(dias);
    
    if (isNaN(diasNum) || diasNum <= 0) {
      return res.status(400).json({ error: 'Número de dias deve ser um valor positivo' });
    }
    
    // Obter data atual sem considerar o horário
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Data limite para vencimento
    const dataLimite = new Date(hoje);
    dataLimite.setDate(hoje.getDate() + diasNum);
    
    // Buscar contas a pagar que vencem nos próximos dias
    const contasAVencer = await prisma.contaPagar.findMany({
      where: {
        vencimento: {
          gte: hoje,
          lte: dataLimite
        },
        status: {
          not: 'pago'
        }
      },
      select: {
        id: true,
        descricao: true,
        categoria: true,
        valor: true,
        vencimento: true
      },
      orderBy: {
        vencimento: 'asc'
      }
    });
    
    // Calcular dias para vencimento e formatar o resultado
    const contasFormatadas = contasAVencer.map(conta => {
      // Calcular dias até o vencimento
      const vencimentoDate = new Date(conta.vencimento);
      const diferencaEmDias = Math.floor((vencimentoDate - hoje) / (1000 * 60 * 60 * 24));
      
      return {
        id: conta.id,
        descricao: conta.descricao,
        categoria: conta.categoria,
        valor: Number(conta.valor),
        diasParaVencimento: diferencaEmDias
      };
    });
    
    // Calcular resumo
    const valorTotal = contasFormatadas.reduce((sum, conta) => sum + conta.valor, 0);
    
    res.json({
      resumo: {
        quantidadeAVencer: contasFormatadas.length,
        valorTotal
      },
      contasAVencer: contasFormatadas
    });
  } catch (error) {
    console.error('Erro ao buscar próximos vencimentos:', error);
    res.status(500).json({
      error: 'Erro ao buscar próximos vencimentos',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Fluxo de caixa diário
router.get("/fluxo-diario", async (req, res) => {
  try {
    const { ano, mes } = req.query;
    
    // Validar parâmetros
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    
    if (!anoNum || isNaN(anoNum) || anoNum < 2000 || anoNum > 2100) {
      return res.status(400).json({
        error: 'Ano inválido',
        mensagem: 'Forneça um ano válido entre 2000 e 2100'
      });
    }
    
    if (!mesNum || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        error: 'Mês inválido',
        mensagem: 'Forneça um mês válido entre 1 e 12'
      });
    }
    
    // Definir período de consulta (início e fim do mês)
    const inicioPeriodo = new Date(anoNum, mesNum - 1, 1);
    const fimPeriodo = new Date(anoNum, mesNum, 0); // Último dia do mês
    
    // Buscar todos os lançamentos do período (tanto receitas quanto despesas)
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        data: {
          gte: inicioPeriodo,
          lte: fimPeriodo
        }
      },
      select: {
        data: true,
        valor: true,
        tipoLancamento: true
      },
      orderBy: {
        data: 'asc'
      }
    });
    
    // Buscar contas recebidas no período
    const contasRecebidas = await prisma.contaReceber.findMany({
      where: {
        dataRecebimento: {
          gte: inicioPeriodo,
          lte: fimPeriodo
        },
        status: 'recebido'
      },
      select: {
        dataRecebimento: true,
        valorRecebido: true
      },
      orderBy: {
        dataRecebimento: 'asc'
      }
    });
    
    // Mapear todos os dias do mês
    const diasDoMes = {};
    let dataAtual = new Date(inicioPeriodo);
    
    while (dataAtual <= fimPeriodo) {
      const dataFormatada = dataAtual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      diasDoMes[dataFormatada] = {
        data: dataFormatada,
        receitas: 0,
        despesas: 0,
        saldo: 0
      };
      
      // Avançar para o próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    // Processar lançamentos
    lancamentos.forEach(lancamento => {
      const dataFormatada = lancamento.data.toISOString().split('T')[0];
      
      if (lancamento.tipoLancamento === 'receita') {
        diasDoMes[dataFormatada].receitas += Number(lancamento.valor);
      } else if (lancamento.tipoLancamento === 'despesa') {
        diasDoMes[dataFormatada].despesas += Number(lancamento.valor);
      }
    });
    
    // Processar contas recebidas
    contasRecebidas.forEach(conta => {
      const dataFormatada = conta.dataRecebimento.toISOString().split('T')[0];
      diasDoMes[dataFormatada].receitas += Number(conta.valorRecebido || 0);
    });
    
    // Calcular saldo para cada dia e converter para array
    const fluxoDiario = Object.values(diasDoMes).map(dia => {
      dia.saldo = dia.receitas - dia.despesas;
      return dia;
    });
    
    // Calcular totais gerais
    const totalReceitas = fluxoDiario.reduce((sum, dia) => sum + dia.receitas, 0);
    const totalDespesas = fluxoDiario.reduce((sum, dia) => sum + dia.despesas, 0);
    const saldoFinal = totalReceitas - totalDespesas;
    
    res.json({
      fluxoDiario,
      resumo: {
        totalReceitas,
        totalDespesas,
        saldoFinal
      }
    });
  } catch (error) {
    console.error('Erro ao gerar fluxo de caixa diário:', error);
    res.status(500).json({
      error: 'Erro ao gerar fluxo de caixa diário',
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota de teste para verificar a conexão com o banco de dados
router.get("/teste-conexao", async (req, res) => {
  try {
    // Tenta realizar uma operação simples de contagem para verificar a conexão
    const contagem = await prisma.usuario.count();
    
    // Verificar a versão do Prisma
    const versionInfo = {
      nodeVersion: process.version,
      prismaVersion: require('@prisma/client/package.json').version,
      databaseConnected: true,
      registrosUsuario: contagem,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      status: 'sucesso',
      mensagem: 'Conexão com o banco de dados estabelecida com sucesso',
      info: versionInfo
    });
  } catch (error) {
    console.error('Erro ao testar conexão com o banco:', error);
    res.status(500).json({
      status: 'erro',
      mensagem: 'Falha na conexão com o banco de dados',
      erro: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

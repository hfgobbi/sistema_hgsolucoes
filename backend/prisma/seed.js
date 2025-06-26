const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Dados REAIS extraídos das planilhas fornecidas
const dadosReais = {
  // Dados de cartões baseados na planilha "Fluxo de Caixa"
  cartoes: [
    { nome: 'SICOOB CHEQUE ESPECIAL', vencimento: 30, codigo: 'D30', valores: [-692, -252, 9, -3400, -4220, 0] },
    { nome: 'NEON', vencimento: 5, codigo: 'D5', valores: [0, 0, 233, 295, 289, 289] },
    { nome: 'SANTANDER', vencimento: 15, codigo: 'D15', valores: [696, 1215, 2530, 120, 780, 3493] },
    { nome: 'SICOOBCRED', vencimento: 11, codigo: 'D11', valores: [1450, 1830, 3136, 2987, 3607, 0] },
    { nome: 'BRASILCARD', vencimento: 20, codigo: 'D20', valores: [1395, 2811, 1740, 2078, 1129, 1931] },
    { nome: 'FORTBRASIL', vencimento: 25, codigo: 'D25', valores: [702, 368, 1436, 0, 996, 252] },
    { nome: 'SAMSCLLUB', vencimento: 26, codigo: 'D26', valores: [388, 799, 817, 218, 361, 95] },
    { nome: 'Bradesco C.BAHIA', vencimento: 25, codigo: 'D25', valores: [0, 551, 512, 957, 568, 201] },
    { nome: 'MELIUS', vencimento: 25, codigo: 'D25', valores: [0, 0, 0, 517, 1448, 1568] },
    { nome: 'Bradesco AMAZON', vencimento: 28, codigo: 'D28', valores: [528, 684, 152, 1189, 992, 227] },
    { nome: 'Tomasine', vencimento: 10, codigo: 'D10', valores: [755, 2009, 1284, 462, 172, 0] }
  ],

  // Fontes de renda baseadas na planilha
  fontesRenda: [
    { nome: 'PRODUÇÃO (UAUTELAS)', tipo: 'producao', valores: [50941, 74572, 56241, 19320, 23679, 7121] },
    { nome: 'HG APLICACAO ACUMULADO (HG TELAS)', tipo: 'aplicacao', valores: [0, 0, 0, 0, 720, 0] },
    { nome: 'HG (OUTRAS RENDAS)', tipo: 'outras', valores: [360, 0, 350, 178, 542, 316] },
    { nome: 'PRODUCAO (HG TELAS)', tipo: 'producao', valores: [2640, 974, 0, 7078, 917, 400] },
    { nome: 'UAUTELAS (MATERIAL)', tipo: 'material', valores: [0, 0, 2907, 1738, 5297, 2186] }
  ],

  // Despesas por categoria (valores reais da planilha)
  despesasPorCategoria: {
    MATERIAL: [14730, 13500, 12800, 11200, 10500, 8900],
    SERVIÇOS: [7675, 9296, 8227, 5435, 5050, 2085],
    ADM: [2827, 1505, 1303, 1528, 1305, 1331],
    CARRO: [3420, 5603, 4541, 4582, 3087, 650],
    MKT: [2304, 3790, 2558, 2503, 1479, 415],
    DESP_CASA: [8956, 7234, 9187, 8642, 7894, 5123]
  },

  // Fornecedores específicos da planilha META
  fornecedores: [
    { nome: 'METALURGICA VERDADEIRA', categoria: 'MATERIAL', valores: [0, 0, 0, 0, 693, 583] },
    { nome: 'Contelas (*Cordas) (tela mosq galvanizada)', categoria: 'MATERIAL', valores: [73, 50, 180, 0, 0, 0] },
    { nome: 'Casa do Construtor (*ESCADA; Andaime)', categoria: 'MATERIAL', valores: [105, 456, 240, 0, 0, 0] },
    { nome: 'DEYU D5 (1824,00) (*Redes/Telas Mosq)', categoria: 'MATERIAL', valores: [3575, 5345, 1824, 1824, 1824, 1824] },
    { nome: 'TEXTIL (*Redes/Cordas)', categoria: 'MATERIAL', valores: [0, 3070, 8205, 548, 0, 0] },
    { nome: 'ALUMETAL (*Aluminio / Telas Mosq)', categoria: 'MATERIAL', valores: [5947, 4872, 5420, 1583, 1594, 1121] },
    { nome: 'PIX PROGRAMADO - Shopee D25 (*Materiais/Oculus)', categoria: 'MATERIAL', valores: [347, 410, 89, 248, 50, 29] },
    { nome: 'Amazon (*ColaPU) outros', categoria: 'MATERIAL', valores: [0, 0, 0, 2663, 667, 150] },
    
    // Serviços
    { nome: 'Serviços externos (Felipe) + Almoço e Deslocamento', categoria: 'SERVIÇOS', valores: [5825, 6068, 4507, 3300, 3235, 1095] },
    { nome: 'Serviços externos (Everton) + Almoço e Deslocamento', categoria: 'SERVIÇOS', valores: [850, 2615, 2320, 235, 135, 0] },
    { nome: 'Serviços externos (Outros/ JOSE/ GABRIEL) + Almoço e Deslocamento', categoria: 'SERVIÇOS', valores: [0, 513, 1900, 1900, 1690, 990] },
    
    // ADM
    { nome: 'Café / Outros Lanche / Almoço / Confraternização', categoria: 'ADM', valores: [601, 377, 382, 532, 435, 665] },
    { nome: 'PlanoCel Empresarial- 67998741634 @uautelas', categoria: 'ADM', valores: [51, 51, 51, 50, 51, 51] },
    { nome: 'Uber', categoria: 'ADM', valores: [143, 165, 297, 186, 0, 215] },
    { nome: 'MEI - Uautelas CNPJ', categoria: 'ADM', valores: [270, 52, 52, 276, 279, 50] },
    
    // CARRO
    { nome: 'Carro - Reparos e Manutenção / Chaveiro *TROCA PNEU', categoria: 'CARRO', valores: [0, 130, 1873, 2602, 1367, 0] },
    { nome: 'Carro - Combustível', categoria: 'CARRO', valores: [1891, 3844, 1794, 1400, 1405, 650] },
    { nome: 'Carro - Seguro D15 6/6', categoria: 'CARRO', valores: [630, 630, 632, 0, 0, 0] },
    { nome: 'DOC CARRO (ANUAL)', categoria: 'CARRO', valores: [0, 829, 282, 282, 282, 0] },
    
    // MKT
    { nome: 'Marketing Digital - Google ADS', categoria: 'MKT', valores: [1654, 3519, 1699, 1390, 848, 120] },
    { nome: 'Marketing Digital - Facebook ADS', categoria: 'MKT', valores: [273, 124, 220, 430, 260, 53] },
    { nome: 'HOSPEDAGEM HOSTINGER - 100 SITES', categoria: 'MKT', valores: [180, 0, 0, 112, 0, 0] },
    { nome: 'GOOGLE ADS - HG REDES', categoria: 'MKT', valores: [0, 0, 450, 320, 130, 0] }
  ]
};

async function main() {
  console.log('🌱 Iniciando seed com dados REAIS da HG Soluções...');

  try {
    // 1. Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await prisma.relatorioMensal.deleteMany();
    await prisma.fluxoCaixaDiario.deleteMany();
    await prisma.metaMensal.deleteMany();
    await prisma.contaReceber.deleteMany();
    await prisma.contaPagar.deleteMany();
    await prisma.lancamento.deleteMany();
    await prisma.fonteRenda.deleteMany();
    await prisma.cartaoContas.deleteMany();
    await prisma.planoContas.deleteMany();
    await prisma.usuario.deleteMany();

    // 2. Criar usuário admin
    console.log('👤 Criando usuário administrador...');
    const senhaHash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        email: 'admin@hgsolucoes.com',
        nome: 'Administrador HG',
        senha: senhaHash,
        role: 'admin'
      }
    });

    // 3. Criar plano de contas baseado nos dados reais
    console.log('📊 Criando plano de contas...');
    
    // Contas de Receita
    const contasReceita = await Promise.all([
      prisma.planoContas.create({
        data: { codigo: 'R001', nome: 'PRODUÇÃO (UAUTELAS)', natureza: 'C', grupo: 'RECEITAS', tipo: 'producao' }
      }),
      prisma.planoContas.create({
        data: { codigo: 'R002', nome: 'HG APLICAÇÃO ACUMULADO', natureza: 'C', grupo: 'RECEITAS', tipo: 'aplicacao' }
      }),
      prisma.planoContas.create({
        data: { codigo: 'R003', nome: 'HG (OUTRAS RENDAS)', natureza: 'C', grupo: 'RECEITAS', tipo: 'outras' }
      }),
      prisma.planoContas.create({
        data: { codigo: 'R004', nome: 'PRODUÇÃO (HG TELAS)', natureza: 'C', grupo: 'RECEITAS', tipo: 'producao' }
      }),
      prisma.planoContas.create({
        data: { codigo: 'R005', nome: 'UAUTELAS (MATERIAL)', natureza: 'C', grupo: 'RECEITAS', tipo: 'material' }
      })
    ]);

    // Contas de Despesa por categoria
    const contasDespesa = [];
    let contadorConta = 1;
    
    for (const fornecedor of dadosReais.fornecedores) {
      const conta = await prisma.planoContas.create({
        data: {
          codigo: `D${contadorConta.toString().padStart(3, '0')}`,
          nome: fornecedor.nome,
          natureza: 'D',
          grupo: fornecedor.categoria,
          tipo: 'fornecedor'
        }
      });
      contasDespesa.push(conta);
      contadorConta++;
    }

    // 4. Criar cartões baseados nos dados reais
    console.log('💳 Criando cartões e contas...');
    const cartoesCriados = [];
    for (const cartao of dadosReais.cartoes) {
      const cartaoCriado = await prisma.cartaoContas.create({
        data: {
          nome: cartao.nome,
          tipo: cartao.nome.includes('CHEQUE') ? 'conta_corrente' : 'cartao',
          vencimentoDia: cartao.vencimento,
          codigoVencimento: cartao.codigo,
          limiteCredito: cartao.nome.includes('CHEQUE') ? 10000 : 5000
        }
      });
      cartoesCriados.push({ ...cartaoCriado, valores: cartao.valores });
    }

    // 5. Criar fontes de renda
    console.log('💰 Criando fontes de renda...');
    const fontesRendaCriadas = [];
    for (const fonte of dadosReais.fontesRenda) {
      const fonteCriada = await prisma.fonteRenda.create({
        data: {
          nome: fonte.nome,
          tipo: fonte.tipo
        }
      });
      fontesRendaCriadas.push({ ...fonteCriada, valores: fonte.valores });
    }

    // 6. Criar metas mensais (baseado nos valores da planilha)
    console.log('🎯 Criando metas mensais...');
    const metas = [
      { categoria: 'MATERIAL', meta: 35000 },
      { categoria: 'SERVIÇOS', meta: 15000 },
      { categoria: 'ADM', meta: 8000 },
      { categoria: 'CARRO', meta: 5000 },
      { categoria: 'MKT', meta: 6000 },
      { categoria: 'DESP_CASA', meta: 12000 }
    ];

    for (let mes = 1; mes <= 12; mes++) {
      for (const meta of metas) {
        await prisma.metaMensal.create({
          data: {
            ano: 2025,
            mes: mes,
            categoria: meta.categoria,
            valorMeta: meta.meta
          }
        });
      }
    }

    // 7. Criar lançamentos de receita baseados nos dados reais (JAN-JUN 2025)
    console.log('📈 Criando lançamentos de receita...');
    const meses = ['01', '02', '03', '04', '05', '06'];
    
    for (let mesIdx = 0; mesIdx < 6; mesIdx++) {
      const dataLancamento = new Date(`2025-${meses[mesIdx]}-15`);
      
      // Lançamentos de receita para cada fonte
      for (let fonteIdx = 0; fonteIdx < fontesRendaCriadas.length; fonteIdx++) {
        const fonte = fontesRendaCriadas[fonteIdx];
        const valor = fonte.valores[mesIdx];
        
        if (valor > 0) {
          await prisma.lancamento.create({
            data: {
              data: dataLancamento,
              descricao: `Receita ${fonte.nome} - ${meses[mesIdx]}/2025`,
              valor: valor,
              fonteRendaId: fonte.id,
              tipoLancamento: 'receita',
              categoria: 'RECEITAS'
            }
          });
        }
      }
    }

    // 8. Criar contas a pagar baseadas nos cartões
    console.log('💸 Criando contas a pagar...');
    for (let mesIdx = 0; mesIdx < 6; mesIdx++) {
      const dataVencimento = new Date(`2025-${meses[mesIdx]}-${cartoesCriados[0]?.vencimentoDia || 15}`);
      
      for (const cartao of cartoesCriados) {
        const valor = cartao.valores[mesIdx];
        
        if (valor > 0) {
          await prisma.contaPagar.create({
            data: {
              descricao: `Fatura ${cartao.nome} - ${meses[mesIdx]}/2025`,
              categoria: 'FINANCEIRO',
              valor: valor,
              vencimento: new Date(`2025-${meses[mesIdx]}-${cartao.vencimentoDia}`),
              cartaoContaId: cartao.id,
              status: mesIdx < 4 ? 'pago' : 'pendente',
              dataPagamento: mesIdx < 4 ? new Date(`2025-${meses[mesIdx]}-${cartao.vencimentoDia}`) : null,
              valorPago: mesIdx < 4 ? valor : null
            }
          });
        }
      }
    }

    // 9. Criar lançamentos de despesa por categoria
    console.log('📉 Criando lançamentos de despesa...');
    for (let mesIdx = 0; mesIdx < 6; mesIdx++) {
      const dataLancamento = new Date(`2025-${meses[mesIdx]}-20`);
      
      // Criar despesas baseadas nos valores reais da planilha
      for (const [categoria, valores] of Object.entries(dadosReais.despesasPorCategoria)) {
        const valor = valores[mesIdx];
        
        if (valor > 0) {
          await prisma.lancamento.create({
            data: {
              data: dataLancamento,
              descricao: `Despesas ${categoria} - ${meses[mesIdx]}/2025`,
              valor: valor,
              tipoLancamento: 'despesa',
              categoria: categoria
            }
          });
        }
      }
    }

    // 10. Criar fornecedores específicos com valores
    console.log('🏭 Criando lançamentos de fornecedores...');
    for (let mesIdx = 0; mesIdx < 6; mesIdx++) {
      const dataLancamento = new Date(`2025-${meses[mesIdx]}-25`);
      
      for (const fornecedor of dadosReais.fornecedores) {
        const valor = fornecedor.valores[mesIdx];
        
        if (valor > 0) {
          const conta = contasDespesa.find(c => c.nome === fornecedor.nome);
          
          await prisma.lancamento.create({
            data: {
              data: dataLancamento,
              descricao: `Pagamento ${fornecedor.nome} - ${meses[mesIdx]}/2025`,
              valor: valor,
              contaDebitoId: conta?.id,
              tipoLancamento: 'despesa',
              categoria: fornecedor.categoria
            }
          });
        }
      }
    }

    // 11. Criar fluxo de caixa diário para junho (exemplos)
    console.log('📅 Criando fluxo de caixa diário...');
    const diasJunho = [
      { dia: 2, uautelas: 1402.2, gasCarro: 100, felipe: 150, juber: 35 },
      { dia: 3, uautelas: 840, outros: 50, felipe: 120 },
      { dia: 4, uautelas: 353, matProd: 112.6, cafeAlmoco: 20, felipe: 100, juber: 35 },
      { dia: 5, uautelas: 215, gasCarro: 50, felipe: 130 },
      { dia: 6, matProd: 1508, gasCarro: 100, uberOutros: 122.12, metaAds: 18, cafeAlmoco: 140 },
      { dia: 7, matProd: 265, cafeAlmoco: 249 },
      { dia: 9, matProd: 300, gasCarro: 100, gabriel: 70 },
      { dia: 10, outrasRendas: 316, uautelas: 501, uberOutros: 9.69, gabriel: 100, juber: 35 },
      { dia: 11, uautelas: 1554, gasCarro: 50, uberOutros: 16.78, cafeAlmoco: 41.8, gabriel: 100, juber: 35 },
      { dia: 12, uautelas: 1390, gasCarro: 50, cafeAlmoco: 100, gabriel: 150, juber: 35 },
      { dia: 13, gasCarro: 50 },
      { dia: 14, hgProd: 400, gasCarro: 100, metaAds: 35 },
      { dia: 16, uautelas: 866, uberOutros: 37, googleAds: 120, cafeAlmoco: 51.2, gabriel: 140, felipe: 100, juber: 35 },
      { dia: 17, gasCarro: 50, gabriel: 135, felipe: 150, juber: 35 }
    ];

    for (const dia of diasJunho) {
      await prisma.fluxoCaixaDiario.create({
        data: {
          data: new Date(`2025-06-${dia.dia.toString().padStart(2, '0')}`),
          hgProd: dia.hgProd || 0,
          outrasRendas: dia.outrasRendas || 0,
          uautelas: dia.uautelas || 0,
          matProd: dia.matProd || 0,
          gasCarro: dia.gasCarro || 0,
          uberOutros: dia.uberOutros || 0,
          googleAds: dia.googleAds || 0,
          metaAds: dia.metaAds || 0,
          cafeAlmoco: dia.cafeAlmoco || 0,
          everton: dia.everton || 0,
          outros: dia.outros || 0,
          gabriel: dia.gabriel || 0,
          felipe: dia.felipe || 0,
          juber: dia.juber || 0
        }
      });
    }

    // 12. Criar relatórios mensais consolidados
    console.log('📊 Criando relatórios mensais...');
    for (let mesIdx = 0; mesIdx < 6; mesIdx++) {
      for (const [categoria, valores] of Object.entries(dadosReais.despesasPorCategoria)) {
        const valorRealizado = valores[mesIdx];
        const meta = metas.find(m => m.categoria === categoria);
        const percentualMeta = meta ? (valorRealizado / meta.meta) * 100 : 0;
        
        await prisma.relatorioMensal.create({
          data: {
            ano: 2025,
            mes: mesIdx + 1,
            categoria: categoria,
            valorRealizado: valorRealizado,
            valorMeta: meta?.meta || 0,
            percentualMeta: percentualMeta
          }
        });
      }
      
      // Relatório de receitas
      const totalReceitas = fontesRendaCriadas.reduce((sum, fonte) => sum + fonte.valores[mesIdx], 0);
      await prisma.relatorioMensal.create({
        data: {
          ano: 2025,
          mes: mesIdx + 1,
          categoria: 'RECEITAS',
          valorRealizado: totalReceitas,
          valorMeta: 0,
          percentualMeta: 0
        }
      });
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('📊 Dados inseridos:');
    console.log(`   • ${contasReceita.length} contas de receita`);
    console.log(`   • ${contasDespesa.length} contas de despesa`);
    console.log(`   • ${cartoesCriados.length} cartões/contas`);
    console.log(`   • ${fontesRendaCriadas.length} fontes de renda`);
    console.log(`   • ${metas.length * 12} metas mensais`);
    console.log(`   • ${diasJunho.length} dias de fluxo de caixa`);
    console.log('   • Lançamentos baseados nos dados REAIS das planilhas');
    console.log('');
    console.log('🔑 Usuário criado:');
    console.log('   Email: admin@hgsolucoes.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
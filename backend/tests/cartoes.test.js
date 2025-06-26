const request = require('supertest');
const { app, prisma } = require('../src/server');

describe('Testes da API de Cartões', () => {
  // Dados para teste
  const cartaoTeste = {
    nome: 'Cartão de Teste',
    tipo: 'CREDITO',
    limiteCredito: 5000.00,
    vencimento: 15,
    bandeiraCartao: 'VISA',
    contaPrincipal: false
  };
  
  let cartaoCriado;

  // Limpar dados após cada teste
  afterAll(async () => {
    // Limpar cartões de teste criados
    if (cartaoCriado?.id) {
      await prisma.cartaoContas.deleteMany({
        where: {
          id: cartaoCriado.id
        }
      });
    }
  });
  
  // Teste para criação de cartão
  test('Deve criar um novo cartão', async () => {
    const response = await request(app)
      .post('/api/cartoes')
      .send(cartaoTeste);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe(cartaoTeste.nome);
    
    // Armazenar o cartão criado para uso nos próximos testes
    cartaoCriado = response.body;
  });
  
  // Teste para listar cartões
  test('Deve listar todos os cartões', async () => {
    const response = await request(app)
      .get('/api/cartoes');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificar se o cartão que criamos está na lista
    if (cartaoCriado) {
      const cartaoEncontrado = response.body.find(c => c.id === cartaoCriado.id);
      expect(cartaoEncontrado).toBeTruthy();
    }
  });
  
  // Teste para obter um cartão específico
  test('Deve retornar um cartão específico pelo ID', async () => {
    if (!cartaoCriado) {
      throw new Error('Cartão não foi criado no teste anterior');
    }
    
    const response = await request(app)
      .get(`/api/cartoes/${cartaoCriado.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', cartaoCriado.id);
    expect(response.body.nome).toBe(cartaoTeste.nome);
  });
  
  // Teste para atualizar um cartão
  test('Deve atualizar um cartão existente', async () => {
    if (!cartaoCriado) {
      throw new Error('Cartão não foi criado no teste anterior');
    }
    
    const dadosAtualizados = {
      nome: 'Cartão Atualizado',
      limiteCredito: 7000.00
    };
    
    const response = await request(app)
      .put(`/api/cartoes/${cartaoCriado.id}`)
      .send(dadosAtualizados);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', cartaoCriado.id);
    expect(response.body.nome).toBe(dadosAtualizados.nome);
    expect(parseFloat(response.body.limiteCredito)).toBe(dadosAtualizados.limiteCredito);
    
    // Atualizar o cartão criado com os novos dados
    cartaoCriado = response.body;
  });
  
  // Teste para excluir um cartão
  test('Deve excluir um cartão existente', async () => {
    if (!cartaoCriado) {
      throw new Error('Cartão não foi criado no teste anterior');
    }
    
    const response = await request(app)
      .delete(`/api/cartoes/${cartaoCriado.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    
    // Verificar se o cartão foi realmente excluído
    const getResponse = await request(app)
      .get(`/api/cartoes/${cartaoCriado.id}`);
    
    expect(getResponse.status).toBe(404);
  });
  
  // Teste para lidar com ID inexistente
  test('Deve retornar 404 para um ID de cartão inexistente', async () => {
    const idInexistente = 'id_inexistente_123';
    
    const response = await request(app)
      .get(`/api/cartoes/${idInexistente}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

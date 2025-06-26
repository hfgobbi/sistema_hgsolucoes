const request = require('supertest');
const { app, prisma } = require('../src/server');

describe('Testes da API de Lançamentos', () => {
  // Dados para teste
  const lancamentoTeste = {
    descricao: 'Lançamento de Teste',
    valor: 1500.00,
    dataLancamento: new Date().toISOString().split('T')[0],
    parcelas: 1,
    observacao: 'Observação de teste',
    tipo: 'NORMAL'
  };
  
  let lancamentoCriado;
  
  // Limpar dados após cada teste
  afterAll(async () => {
    // Limpar lançamentos de teste criados
    if (lancamentoCriado?.id) {
      await prisma.lancamento.deleteMany({
        where: {
          id: lancamentoCriado.id
        }
      });
    }
  });
  
  // Teste para criação de lançamento
  test('Deve criar um novo lançamento', async () => {
    const response = await request(app)
      .post('/api/lancamentos')
      .send(lancamentoTeste);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.descricao).toBe(lancamentoTeste.descricao);
    
    // Armazenar o lançamento criado para uso nos próximos testes
    lancamentoCriado = response.body;
  });
  
  // Teste para listar lançamentos
  test('Deve listar todos os lançamentos', async () => {
    const response = await request(app)
      .get('/api/lancamentos');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificar se o lançamento que criamos está na lista
    if (lancamentoCriado) {
      const lancamentoEncontrado = response.body.find(l => l.id === lancamentoCriado.id);
      expect(lancamentoEncontrado).toBeTruthy();
    }
  });
  
  // Teste para obter um lançamento específico
  test('Deve retornar um lançamento específico pelo ID', async () => {
    if (!lancamentoCriado) {
      throw new Error('Lançamento não foi criado no teste anterior');
    }
    
    const response = await request(app)
      .get(`/api/lancamentos/${lancamentoCriado.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', lancamentoCriado.id);
    expect(response.body.descricao).toBe(lancamentoTeste.descricao);
  });
  
  // Teste para atualizar um lançamento
  test('Deve atualizar um lançamento existente', async () => {
    if (!lancamentoCriado) {
      throw new Error('Lançamento não foi criado no teste anterior');
    }
    
    const dadosAtualizados = {
      descricao: 'Lançamento Atualizado',
      valor: 2000.00
    };
    
    const response = await request(app)
      .put(`/api/lancamentos/${lancamentoCriado.id}`)
      .send(dadosAtualizados);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', lancamentoCriado.id);
    expect(response.body.descricao).toBe(dadosAtualizados.descricao);
    expect(parseFloat(response.body.valor)).toBe(dadosAtualizados.valor);
    
    // Atualizar o lançamento criado com os novos dados
    lancamentoCriado = response.body;
  });
  
  // Teste para excluir um lançamento
  test('Deve excluir um lançamento existente', async () => {
    if (!lancamentoCriado) {
      throw new Error('Lançamento não foi criado no teste anterior');
    }
    
    const response = await request(app)
      .delete(`/api/lancamentos/${lancamentoCriado.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    
    // Verificar se o lançamento foi realmente excluído
    const getResponse = await request(app)
      .get(`/api/lancamentos/${lancamentoCriado.id}`);
    
    expect(getResponse.status).toBe(404);
  });
  
  // Teste para lidar com campo obrigatório não preenchido
  test('Deve retornar erro 400 quando campos obrigatórios não estiverem preenchidos', async () => {
    const lancamentoIncompleto = {
      // Sem descrição
      valor: 1000.00,
      // Sem data
    };
    
    const response = await request(app)
      .post('/api/lancamentos')
      .send(lancamentoIncompleto);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('requiredFields');
  });
  
  // Teste para lidar com ID inexistente
  test('Deve retornar 404 para um ID de lançamento inexistente', async () => {
    const idInexistente = 'id_inexistente_123';
    
    const response = await request(app)
      .get(`/api/lancamentos/${idInexistente}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

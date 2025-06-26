const request = require('supertest');
const { app, prisma } = require('../src/server');

describe('Testes da API de Fontes de Renda', () => {
  // Dados para teste
  const fonteRendaTeste = {
    nome: 'Fonte de Renda Teste',
    tipo: 'PRODUCAO',
    valorMensal: 3000.00,
    cor: 'bg-green-600',
    ativo: true
  };
  
  let fonteRendaCriada;

  // Limpar dados após cada teste
  afterAll(async () => {
    // Limpar fontes de renda de teste criadas
    if (fonteRendaCriada?.id) {
      await prisma.fonteRenda.deleteMany({
        where: {
          id: fonteRendaCriada.id
        }
      });
    }
  });
  
  // Teste para criação de fonte de renda
  test('Deve criar uma nova fonte de renda', async () => {
    const response = await request(app)
      .post('/api/fontes-renda')
      .send(fonteRendaTeste);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe(fonteRendaTeste.nome);
    
    // Armazenar a fonte de renda criada para uso nos próximos testes
    fonteRendaCriada = response.body;
  });
  
  // Teste para listar fontes de renda
  test('Deve listar todas as fontes de renda', async () => {
    const response = await request(app)
      .get('/api/fontes-renda');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificar se a fonte de renda que criamos está na lista
    if (fonteRendaCriada) {
      const fonteEncontrada = response.body.find(f => f.id === fonteRendaCriada.id);
      expect(fonteEncontrada).toBeTruthy();
    }
  });
  
  // Teste para obter uma fonte de renda específica
  test('Deve retornar uma fonte de renda específica pelo ID', async () => {
    if (!fonteRendaCriada) {
      throw new Error('Fonte de renda não foi criada no teste anterior');
    }
    
    const response = await request(app)
      .get(`/api/fontes-renda/${fonteRendaCriada.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', fonteRendaCriada.id);
    expect(response.body.nome).toBe(fonteRendaTeste.nome);
  });
  
  // Teste para atualizar uma fonte de renda
  test('Deve atualizar uma fonte de renda existente', async () => {
    if (!fonteRendaCriada) {
      throw new Error('Fonte de renda não foi criada no teste anterior');
    }
    
    const dadosAtualizados = {
      nome: 'Fonte de Renda Atualizada',
      valorMensal: 4500.00
    };
    
    const response = await request(app)
      .put(`/api/fontes-renda/${fonteRendaCriada.id}`)
      .send(dadosAtualizados);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', fonteRendaCriada.id);
    expect(response.body.nome).toBe(dadosAtualizados.nome);
    expect(parseFloat(response.body.valorMensal)).toBe(dadosAtualizados.valorMensal);
    
    // Atualizar a fonte de renda criada com os novos dados
    fonteRendaCriada = response.body;
  });
  
  // Teste para excluir uma fonte de renda
  test('Deve excluir uma fonte de renda existente', async () => {
    if (!fonteRendaCriada) {
      throw new Error('Fonte de renda não foi criada no teste anterior');
    }
    
    const response = await request(app)
      .delete(`/api/fontes-renda/${fonteRendaCriada.id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    
    // Verificar se a fonte de renda foi realmente excluída
    const getResponse = await request(app)
      .get(`/api/fontes-renda/${fonteRendaCriada.id}`);
    
    expect(getResponse.status).toBe(404);
  });
  
  // Teste para lidar com ID inexistente
  test('Deve retornar 404 para um ID de fonte de renda inexistente', async () => {
    const idInexistente = 'id_inexistente_123';
    
    const response = await request(app)
      .get(`/api/fontes-renda/${idInexistente}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

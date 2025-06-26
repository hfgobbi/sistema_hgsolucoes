const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuração do ambiente de teste
beforeAll(async () => {
  // Conectar ao banco de dados de teste
  await prisma.$connect();
});

// Limpar bancos de teste entre execuções
afterEach(async () => {
  // Usar transações para garantir que cada teste é isolado
  await prisma.$transaction([
    // Adicione aqui as tabelas que precisam ser limpas após cada teste
    // Exemplo: prisma.lancamento.deleteMany(),
  ]);
});

afterAll(async () => {
  // Desconectar do banco de dados
  await prisma.$disconnect();
});

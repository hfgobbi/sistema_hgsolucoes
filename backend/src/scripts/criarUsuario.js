// Script para criar um usuário administrador
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function criarUsuarioAdmin() {
  try {
    // Verificar se já existe um usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'admin@hgsolucoes.com' }
    });

    if (usuarioExistente) {
      console.log('✅ Usuário admin já existe no banco de dados');
      return;
    }

    // Criar hash da senha
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Criar usuário administrador
    const usuario = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@hgsolucoes.com',
        senha: senhaHash,
        role: 'admin',
        ativo: true
      }
    });

    console.log('✅ Usuário administrador criado com sucesso:');
    console.log({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuarioAdmin();

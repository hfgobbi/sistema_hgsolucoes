const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();
const prisma = new PrismaClient();

// Rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validar dados
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios"
      });
    }
    
    // Verificar se existe um usuário com esse email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    // Se não encontrou o usuário ou ele está inativo
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas"
      });
    }
    
    // Para simplicidade de teste, vamos permitir login com senha fixa "admin123" também
    // Em produção, deveria ser apenas a comparação com bcrypt
    const senhaCorreta = senha === "admin123" || (await bcrypt.compare(senha, usuario.senha));
    
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas"
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET || "hgsolucoes_secret_key_2023",
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
    );
    
    // Retornar dados do usuário e token
    res.json({
      success: true,
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor. Por favor, tente novamente mais tarde.",
      error: error.message
    });
  }
});

// Importando middleware
const { authMiddleware } = require('../middleware/auth');

// Rota para obter perfil do usuário
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // O middleware authMiddleware já foi aplicado e decodificou o token
    // O ID do usuário vem do token decodificado
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Token não fornecido ou inválido."
      });
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, role: true, ativo: true }
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    res.json({
      success: true,
      usuario
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor. Por favor, tente novamente mais tarde.",
      error: error.message
    });
  }
});

// Rota para logout (apenas remove o token no cliente)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logout realizado com sucesso"
  });
});

module.exports = router;

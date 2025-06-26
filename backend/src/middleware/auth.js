const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: "Token de acesso requerido"
      });
    }

    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      error: "Token inválido"
    });
  }
};

module.exports = { authMiddleware };

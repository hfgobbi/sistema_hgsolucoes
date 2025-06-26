require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

// Importar rotas
const authRoutes = require('./routes/auth');
const cartaoRoutes = require('./routes/cartoes');
const fonteRendaRoutes = require('./routes/fontesRenda');

// Importar middleware de autenticação
const { authMiddleware } = require('./middleware/auth');
const lancamentoRoutes = require('./routes/lancamentos');
const contaPagarRoutes = require('./routes/contasPagar');
const contaReceberRoutes = require('./routes/contasReceber');
const relatorioRoutes = require('./routes/relatorios');
const fluxoCaixaRoutes = require('./routes/fluxoCaixa');
const dashboardRoutes = require('./routes/dashboard');

// Inicializar Prisma
const prisma = new PrismaClient();

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// ==============================================
// MIDDLEWARES DE SEGURANÇA
// ==============================================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por window
  message: {
    error: 'Muitas tentativas, tente novamente mais tarde',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ==============================================
// MIDDLEWARES GERAIS
// ==============================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Configurar Express para se integrar com o CORS de maneira mais robusta
// Usar o pacote cors configurado para desenvolvimento
app.use(cors({
  origin: '*', // Aceitar qualquer origem em desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  // Aumentar tempo de cache para evitar tantas requisições pre-flight
  maxAge: 86400 // 24 horas
}));

// 2. Garantir que os cabeçalhos CORS estejam em TODAS as respostas
// Middleware que adiciona cabeçalhos CORS em todas as requisições, até mesmo em erros
app.use((req, res, next) => {
  // Adicionar cabeçalhos CORS em todas as respostas
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder imediatamente às requisições OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Sobrescrever os métodos do res para garantir cabeçalhos CORS
  const originalSend = res.send;
  res.send = function(...args) {
    // Adicionar cabeçalhos CORS novamente antes de enviar
    res.header('Access-Control-Allow-Origin', '*');
    return originalSend.apply(res, args);
  };
  
  next();
});

// 3. Limitador de requisições mais inteligente
// Este limitador vai permitir picos de requisições durante o carregamento inicial
const requestLimiter = {
  limits: {},
  lastCleanup: Date.now(),
  // Configurar limites por endpoint para não interferir em fluxos normais de uso
  endpointLimits: {
    default: { count: 200, window: 10000 }, // Limite genérico (200 req em 10s)
    '/dashboard': { count: 20, window: 3000 },  // Rotas específicas com limites próprios
    '/fluxo-caixa': { count: 20, window: 3000 },
    '/fontes-renda': { count: 30, window: 5000 },
  }
};

// Middleware de controle de taxa para prevenir sobrecarga
app.use((req, res, next) => {
  // Não limitar requisições OPTIONS ou de recursos estáticos
  if (req.method === 'OPTIONS' || req.path.startsWith('/static/')) {
    return next();
  }
  
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const endpoint = Object.keys(requestLimiter.endpointLimits)
    .find(path => req.path.includes(path)) || 'default';
  const limit = requestLimiter.endpointLimits[endpoint];
  
  // Limpar entradas antigas a cada minuto
  if (now - requestLimiter.lastCleanup > 60000) {
    Object.keys(requestLimiter.limits).forEach(key => {
      if (now - requestLimiter.limits[key].timestamp > 30000) {
        delete requestLimiter.limits[key];
      }
    });
    requestLimiter.lastCleanup = now;
  }

  const key = `${ip}-${endpoint}`;
  if (!requestLimiter.limits[key]) {
    requestLimiter.limits[key] = { count: 1, timestamp: now };
  } else if (now - requestLimiter.limits[key].timestamp > limit.window) {
    // Se passou o tempo da janela, resetar contador
    requestLimiter.limits[key] = { count: 1, timestamp: now };
  } else {
    // Incrementar contador
    requestLimiter.limits[key].count++;
    
    // Verificar se excedeu o limite
    if (requestLimiter.limits[key].count > limit.count) {
      // Enviar resposta com TODOS os cabeçalhos CORS
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      return res.status(429).json({
        error: 'Muitas requisições para este endpoint. Tente novamente em alguns segundos.',
        retryAfter: Math.ceil(limit.window / 1000),
        path: req.path
      });
    }
  }
  
  next();
});

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ==============================================
// MIDDLEWARE DE HEALTH CHECK
// ==============================================
app.get('/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      database: 'Connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// ==============================================
// ROTAS DA API
// ==============================================
// Rota de autenticação (pública)
app.use('/api/auth', authRoutes);

// Rotas protegidas com autenticação
app.use('/api/cartoes', authMiddleware, cartaoRoutes);
app.use('/api/fontes-renda', authMiddleware, fonteRendaRoutes);
app.use('/api/lancamentos', authMiddleware, lancamentoRoutes);
app.use('/api/contas-pagar', authMiddleware, contaPagarRoutes);
app.use('/api/contas-receber', authMiddleware, contaReceberRoutes);
app.use('/api/relatorios', authMiddleware, relatorioRoutes);
app.use('/api/fluxo-caixa', authMiddleware, fluxoCaixaRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🏢 HG Soluções - Sistema Financeiro API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ==============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro na aplicação:', err);

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro do Prisma
  if (err.code && err.code.startsWith('P')) {
    let message = 'Erro no banco de dados';
    let status = 500;

    switch (err.code) {
      case 'P2002':
        message = 'Registro duplicado';
        status = 409;
        break;
      case 'P2025':
        message = 'Registro não encontrado';
        status = 404;
        break;
      case 'P2003':
        message = 'Violação de chave estrangeira';
        status = 400;
        break;
    }

    return res.status(status).json({
      error: message,
      code: err.code,
      field: err.meta?.target
    });
  }

  // Erro de CORS
  if (err.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      error: 'CORS: Origem não permitida',
      code: 'CORS_ERROR'
    });
  }

  // Erro genérico
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// ==============================================
// INICIALIZAÇÃO DO SERVIDOR
// ==============================================
async function startServer() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco PostgreSQL');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 ===================================');
      console.log('🏢 HG SOLUÇÕES - SISTEMA FINANCEIRO');
      console.log('🚀 ===================================');
      console.log(`📡 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log('🚀 ===================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  Recebido sinal ${signal}, iniciando shutdown graceful...`);
      
      server.close(async () => {
        console.log('✅ Servidor HTTP fechado');
        
        try {
          await prisma.$disconnect();
          console.log('✅ Conexão com banco fechada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro ao fechar conexão com banco:', error);
          process.exit(1);
        }
      });

      // Forçar shutdown após 30 segundos
      setTimeout(() => {
        console.error('❌ Shutdown forçado após timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, prisma };
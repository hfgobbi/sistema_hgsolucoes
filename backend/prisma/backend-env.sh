# ==============================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ==============================================
DATABASE_URL="postgresql://usuario:senha@localhost:5432/hg_solucoes?schema=public"

# Para desenvolvimento local (ajuste conforme necessário):
# DATABASE_URL="postgresql://postgres:123456@localhost:5432/hg_solucoes?schema=public"

# ==============================================
# CONFIGURAÇÕES DO SERVIDOR
# ==============================================
PORT=3001
NODE_ENV=development

# ==============================================
# CONFIGURAÇÕES DE AUTENTICAÇÃO
# ==============================================
JWT_SECRET="hg_solucoes_jwt_secret_2025_muito_seguro_#@!$%"
JWT_EXPIRES_IN="24h"

# ==============================================
# CONFIGURAÇÕES DE SEGURANÇA
# ==============================================
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==============================================
# CONFIGURAÇÕES DE CORS
# ==============================================
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# ==============================================
# CONFIGURAÇÕES DE LOG
# ==============================================
LOG_LEVEL=info

# ==============================================
# CONFIGURAÇÕES DE UPLOAD
# ==============================================
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"

# ==============================================
# CONFIGURAÇÕES DE EMAIL (futuro)
# ==============================================
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@hgsolucoes.com"

# ==============================================
# CONFIGURAÇÕES DE BACKUP
# ==============================================
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
# 🏢 Sistema Financeiro HG Soluções

Sistema financeiro completo baseado nas planilhas reais da HG Soluções, com controle de fluxo de caixa, cartões, receitas, despesas e relatórios detalhados.

## 📊 Funcionalidades

- ✅ **Dashboard interativo** com KPIs e métricas
- ✅ **Controle de cartões** com extratos mensais
- ✅ **Fontes de renda** por tipo (Produção, Aplicação, etc.)
- ✅ **Lançamentos contábeis** com débito/crédito
- ✅ **Contas a pagar/receber** com alertas de vencimento
- ✅ **Fluxo de caixa diário** estilo planilha
- ✅ **Relatórios mensais e anuais** comparativos
- ✅ **Metas por categoria** com % de atingimento
- ✅ **Interface visual** idêntica às planilhas atuais

## 🛠️ Tecnologias

- **Backend:** Node.js + Express + Prisma
- **Banco:** PostgreSQL
- **Frontend:** React + Tailwind CSS
- **Autenticação:** JWT + RBAC
- **Documentação:** API RESTful completa

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd sistema_hgsolucoes
```

### 2. Configure o Backend

```bash
cd backend
npm install

# Configure o banco PostgreSQL
cp .env.example .env
# Edite o .env com suas configurações do banco
```

### 3. Configure o Banco de Dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrações
npm run db:push

# Popular com dados iniciais (baseados nas planilhas reais)
npm run db:seed
```

### 4. Inicie o Backend

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O backend estará rodando em `http://localhost:3001`

### 5. Configure o Frontend

```bash
cd ../frontend
npm install
npm start
```

O
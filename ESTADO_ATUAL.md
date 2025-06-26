# Estado do Ambiente - Sistema Financeiro HG Soluções

Data da documentação: 18/06/2025

## Estrutura do Sistema

O sistema HG Soluções é composto por duas partes principais:
- **Backend**: API REST em Node.js/Express rodando na porta 3000
- **Frontend**: Aplicação React rodando na porta 3001

## Correções Implementadas

### 1. API de Relatórios
- Implementada rota `/api/relatorios/mensal`
- Implementada rota `/api/relatorios/anual`
- Implementada rota `/api/relatorios/mensal/download` 
- Implementada rota `/api/relatorios/fluxo-caixa`
- Implementada rota `/api/relatorios/cartoes-extrato`
- Implementada rota `/api/relatorios/metas-performance`
- Implementada rota `/api/relatorios/fornecedores`

### 2. API de Fluxo de Caixa
- Corrigida implementação da rota `/api/fluxo-caixa`
- Adicionada lógica para gerar dados simulados quando não há registros
- Implementadas rotas CRUD completas para fluxo de caixa

### 3. Serviços do Frontend
- Adicionado método `getRelatorioMensal` no serviço `relatoriosService`
- Adicionado método `baixarRelatorio` no serviço `relatoriosService`

### 4. Configuração de Portas
- Backend configurado para rodar na porta 3000 através do script `iniciar_sistema.sh`
- Frontend configurado para rodar na porta 3001

## Scripts de Inicialização

- **iniciar_sistema.sh**: Script principal na raiz do projeto que inicia backend e frontend
- **iniciar_backend.sh**: Script auxiliar na pasta backend para iniciar apenas o backend na porta 3000
- **liberar_porta.sh**: Script utilitário que libera portas específicas que estejam em uso

## Endpoints da API Principais

### Autenticação
- POST `/api/auth/login`: Login de usuário
- POST `/api/auth/refresh`: Refresh de token

### Lançamentos
- GET `/api/lancamentos`: Listar todos os lançamentos
- GET `/api/lancamentos/resumo/categorias`: Resumo de lançamentos por categorias
- GET `/api/lancamentos/extrato/diario`: Extrato diário
- GET `/api/lancamentos/balancete`: Balancete mensal
- POST `/api/lancamentos/lote`: Criar lançamentos em lote

### Fluxo de Caixa
- GET `/api/fluxo-caixa`: Obter fluxo de caixa (com suporte a filtros por ano/mês)
- GET `/api/fluxo-caixa/:id`: Obter registro específico
- POST `/api/fluxo-caixa`: Criar novo registro
- PUT `/api/fluxo-caixa/:id`: Atualizar registro
- DELETE `/api/fluxo-caixa/:id`: Excluir registro

### Relatórios
- GET `/api/relatorios/anual`: Relatório anual
- GET `/api/relatorios/mensal`: Relatório mensal
- GET `/api/relatorios/mensal/download`: Download de relatório mensal
- GET `/api/relatorios/fluxo-caixa`: Relatório de fluxo de caixa
- GET `/api/relatorios/cartoes-extrato`: Extrato de cartões
- GET `/api/relatorios/metas-performance`: Relatório de metas e performance
- GET `/api/relatorios/fornecedores`: Relatório de fornecedores

## Observações Importantes

1. O arquivo `.env` na pasta backend está configurado para usar a porta 3001, mas estamos sobrescrevendo essa configuração através da variável de ambiente PORT=3000 nos scripts de inicialização.

2. Os dados atualmente são simulados para demonstração. Para um ambiente de produção, será necessário conectar adequadamente ao banco de dados e preencher com dados reais.

3. Todos os problemas reportados foram corrigidos:
   - Erro no dashboard: "Erro ao obter resumo de categorias"
   - Erro no fluxo de caixa: "target must be an object"
   - Erro no relatório: "relatoriosService.getRelatorioMensal is not a function"

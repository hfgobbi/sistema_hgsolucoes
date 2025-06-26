#!/bin/bash

echo "==================================================="
echo "     INICIANDO SISTEMA HG SOLUÇÕES FINANCEIRO"
echo "==================================================="
echo ""

# Função para verificar e encerrar processos nas portas
encerrar_processo_na_porta() {
  local porta=$1
  echo "Verificando processo na porta $porta..."
  
  # Encontrar PID usando a porta
  local pid=$(netstat -tulpn 2>/dev/null | grep ":$porta " | awk '{print $7}' | cut -d'/' -f1)
  
  if [ -n "$pid" ]; then
    echo "Encerrando processo PID $pid na porta $porta..."
    kill $pid 2>/dev/null
    sleep 1
    # Força o encerramento se ainda estiver rodando
    if ps -p $pid > /dev/null; then
      echo "Força o encerramento do PID $pid..."
      kill -9 $pid 2>/dev/null
    fi
    echo "Porta $porta liberada!"
  else
    echo "Porta $porta já está livre!"
  fi
}

# Diretório raiz do projeto
DIR_RAIZ=$(pwd)

# Liberar portas que possam estar em uso
encerrar_processo_na_porta 3000
encerrar_processo_na_porta 3001

# Iniciar Backend (porta 3000)
echo ""
echo "==================================================="
echo "INICIANDO BACKEND NA PORTA 3000"
echo "==================================================="
cd "$DIR_RAIZ/backend"
echo "Entrando em $(pwd)"

# Exibir configuração do PORT
echo "Iniciando backend com PORT=3000..."

# Iniciar o backend em segundo plano
PORT=3000 npm run dev &
BACKEND_PID=$!

# Esperar um tempo para o servidor iniciar
echo "Aguardando inicialização do servidor backend..."
sleep 5
echo "Backend iniciado com PID: $BACKEND_PID"

# Iniciar Frontend (porta 3001)
echo ""
echo "==================================================="
echo "INICIANDO FRONTEND NA PORTA 3001"
echo "==================================================="
cd "$DIR_RAIZ/frontend"
echo "Entrando em $(pwd)"

# Explicitar que estamos usando PORT=3001
echo "Iniciando frontend com PORT=3001..."

# Iniciar o frontend em segundo plano
PORT=3001 npm start &
FRONTEND_PID=$!

# Voltar ao diretório raiz
cd "$DIR_RAIZ"

echo ""
echo "==================================================="
echo "SISTEMA INICIADO"
echo "==================================================="
echo "Backend rodando em: http://localhost:3000"
echo "Frontend rodando em: http://localhost:3001"
echo ""
echo "Para encerrar o sistema, pressione CTRL+C neste terminal"
echo "ou execute: kill $BACKEND_PID $FRONTEND_PID"
echo "==================================================="

# Esperar por sinal de interrupção para encerrar os processos
trap "echo -e '\n\nEncerrando sistema...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Sistema encerrado!'; exit" INT TERM

# Manter o script rodando
wait

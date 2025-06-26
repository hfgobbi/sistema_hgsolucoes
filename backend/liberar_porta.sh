#!/bin/bash

echo "Script para liberar porta 3001 e iniciar servidor backend"
echo "========================================================="

# Checar se há processo usando a porta 3001
echo "Verificando processos na porta 3001..."
PROCESSO=$(netstat -tulpn 2>/dev/null | grep ":3001" | awk '{print $7}' | cut -d'/' -f1)

if [ -z "$PROCESSO" ]; then
  echo "Nenhum processo encontrado usando a porta 3001."
else
  echo "Processo PID $PROCESSO está usando a porta 3001."
  read -p "Deseja encerrar este processo? (s/n): " resposta
  
  if [ "$resposta" = "s" ] || [ "$resposta" = "S" ]; then
    echo "Tentando encerrar o processo PID $PROCESSO..."
    kill $PROCESSO 2>/dev/null
    
    # Verificar se o processo foi encerrado
    sleep 2
    if ps -p $PROCESSO > /dev/null; then
      echo "O processo não foi encerrado. Tentando force kill..."
      read -p "Digite a senha sudo: " -s senha
      echo ""
      echo "$senha" | sudo -S kill -9 $PROCESSO
    else
      echo "Processo encerrado com sucesso."
    fi
  else
    echo "Operação cancelada pelo usuário."
    exit 1
  fi
fi

echo "Iniciando o servidor backend na porta 3000..."
npm run dev

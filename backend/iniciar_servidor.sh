#!/bin/bash

echo "Script para iniciar servidor backend sem interações"
echo "=================================================="

# Encerrar qualquer processo usando a porta 3001
echo "Tentando encerrar processos na porta 3001..."
PROCESSO_3001=$(netstat -tulpn 2>/dev/null | grep ":3001" | awk '{print $7}' | cut -d'/' -f1)
if [ -n "$PROCESSO_3001" ]; then
  echo "Encerrando processo PID $PROCESSO_3001 da porta 3001..."
  kill $PROCESSO_3001 2>/dev/null
  sleep 1
  kill -9 $PROCESSO_3001 2>/dev/null
fi

# Encerrar qualquer processo usando a porta 3000
echo "Tentando encerrar processos na porta 3000..."
PROCESSO_3000=$(netstat -tulpn 2>/dev/null | grep ":3000" | awk '{print $7}' | cut -d'/' -f1)
if [ -n "$PROCESSO_3000" ]; then
  echo "Encerrando processo PID $PROCESSO_3000 da porta 3000..."
  kill $PROCESSO_3000 2>/dev/null
  sleep 1
  kill -9 $PROCESSO_3000 2>/dev/null
fi

# Iniciar o servidor backend
echo "Iniciando o servidor backend na porta 3000..."
npm run dev

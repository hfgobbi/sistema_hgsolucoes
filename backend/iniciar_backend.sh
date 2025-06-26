#!/bin/bash

echo "Iniciando backend na porta 3000..."

# Forçar a porta 3000 sobrescrevendo a variável de ambiente
PORT=3000 npm run dev

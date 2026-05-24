#!/bin/bash

# Script para iniciar el Backend y el Frontend simultáneamente en macOS
# Este script abre dos ventanas nuevas de la Terminal para separar los logs.

# Obtener la ruta absoluta de la carpeta donde está el script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "------------------------------------------"
echo "Iniciando el proyecto PICUVIMU (macOS)..."
echo "------------------------------------------"

# 1. Iniciar Backend en una nueva ventana de Terminal
echo "[1/2] Iniciando Backend en una nueva ventana..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && ([ -d .venv ] && source .venv/bin/activate || [ -d venv ] && source venv/bin/activate) && uvicorn main:app --reload --port 8000\""

# 2. Iniciar Frontend en una nueva ventana de Terminal
echo "[2/2] Iniciando Frontend en una nueva ventana..."
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && npm run dev\""

echo ""
echo "¡Listo! Se han abierto dos nuevas ventanas de Terminal:"
echo "  - Una para el servidor FastAPI (Backend)"
echo "  - Otra para el servidor Vite (Frontend)"

@echo off
title PICUVIMU Starter
echo ------------------------------------------
echo Iniciando el proyecto PICUVIMU...
echo ------------------------------------------

:: Iniciar Backend
echo [1/2] Iniciando Backend...
start powershell -NoExit -Command "cd backend; if (Test-Path .venv) { .\.venv\Scripts\activate } elseif (Test-Path venv) { .\venv\Scripts\activate }; uvicorn main:app --reload --port 8000"

:: Iniciar Frontend
echo [2/2] Iniciando Frontend...
start powershell -NoExit -Command "cd frontend; npm run dev"

echo.
echo ¡Listo! Se han abierto dos ventanas nuevas para el Backend y el Frontend.
echo Puedes cerrar esta ventana.
timeout /t 5

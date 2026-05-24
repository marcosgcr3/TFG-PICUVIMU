# start.ps1
# Script para iniciar el Backend y el Frontend simultáneamente

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $PSScriptRoot

Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host "Iniciando el proyecto PICUVIMU..." -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

# 1. Iniciar Backend
Write-Host "[1/2] Iniciando Backend en una nueva ventana..." -ForegroundColor Green
$backendCommand = "cd backend; if (Test-Path .venv) { .\.venv\Scripts\activate } elseif (Test-Path venv) { .\venv\Scripts\activate }; uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$backendCommand"

# 2. Iniciar Frontend
Write-Host "[2/2] Iniciando Frontend en una nueva ventana..." -ForegroundColor Cyan
$frontendCommand = "cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$frontendCommand"

Write-Host ""
Write-Host "¡Listo! Se han abierto dos ventanas de PowerShell:" -ForegroundColor Magenta
Write-Host "  - Una ejecutando el servidor FastAPI (Backend)" -ForegroundColor Green
Write-Host "  - Otra ejecutando el servidor Vite (Frontend)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Puedes cerrar este script." -ForegroundColor Gray

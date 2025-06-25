@echo off
title Dashboard Mautic - Servidor Local
color 0A

echo.
echo ============================================
echo   🔥 DASHBOARD MAUTIC - SERVIDOR LOCAL
echo ============================================
echo.
echo ⚡ Iniciando servidor de desenvolvimento...
echo.

cd /d "C:\Users\Gabriel\Desktop\metricsmail-v2-main"

echo 📂 Diretorio: %cd%
echo.
echo ⏳ Aguarde... Iniciando npm run dev
echo.

npm run dev

echo.
echo ❌ Servidor encerrado.
echo.
pause
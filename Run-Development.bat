@echo off
title Yorukaze POS - Standalone Mode
color 0B

echo.
echo   ╔══════════════════════════════════════════╗
echo   ║     YORUKAZE POS - STANDALONE MODE      ║
echo   ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] Setting up environment...
set USE_SQLITE=true
set CORS_ORIGIN=http://localhost:5173
set NODE_ENV=development
set PORT=3001

echo [2/3] Starting backend server...
start "Yorukaze Backend" cmd /k "cd /d %~dp0backend && set USE_SQLITE=true&& set CORS_ORIGIN=http://localhost:5173&& node src/server.js"

echo [3/3] Starting frontend...
timeout /t 4 /nobreak >nul
start "Yorukaze Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ═══════════════════════════════════════════
echo   ✅ Yorukaze POS is starting!
echo   
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo   
echo   Login: admin / 12345
echo ═══════════════════════════════════════════
echo.
echo Keep both windows open while using the app
echo.
pause

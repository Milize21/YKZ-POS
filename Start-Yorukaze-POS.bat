@echo off
title Yorukaze POS - Standalone Application
color 0A

echo ========================================
echo    YORUKAZE POS SYSTEM - STARTING
echo ========================================
echo.
echo [*] Initializing application...
echo.

REM Set environment for SQLite
set USE_SQLITE=true
set NODE_ENV=production
set PORT=3001
set SQLITE_DB_PATH=%APPDATA%\YorukazePOS\database\ykz_pos.db
set UPLOAD_DIR=%APPDATA%\YorukazePOS\uploads
set JWT_SECRET=ykz_jwt_secret_key_2024_secure
set MAX_FILE_SIZE=629145600

REM Create data directories
if not exist "%APPDATA%\YorukazePOS\database" mkdir "%APPDATA%\YorukazePOS\database"
if not exist "%APPDATA%\YorukazePOS\uploads" mkdir "%APPDATA%\YorukazePOS\uploads"

echo [*] Starting backend server...
cd /d "%~dp0backend"
start /B node src/server.js

echo [*] Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [*] Opening application...
cd /d "%~dp0"
start "" "http://localhost:5173"

echo.
echo ========================================
echo    APPLICATION STARTED!
echo ========================================
echo.
echo Backend running on: http://localhost:3001
echo Frontend will open in browser...
echo.
echo Close this window to stop the application
echo ========================================
pause

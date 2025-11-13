@echo off
echo Starting YKZ POS System (Local Development Mode)
echo ================================================

echo.
echo Step 1: Starting PostgreSQL Database...
echo Please make sure PostgreSQL is installed and running on port 5432
echo Default database: ykz_pos
echo Default user: ykz_user  
echo Default password: ykz_password_2024

echo.
echo Step 2: Setting up Backend API...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo.
echo Step 3: Starting Backend Server...
set DATABASE_URL=postgresql://ykz_user:ykz_password_2024@localhost:5432/ykz_pos
set JWT_SECRET=ykz_jwt_secret_key_2024_secure
set NODE_ENV=development
set PORT=3001
set CORS_ORIGIN=http://localhost:8080

start "YKZ Backend API" cmd /k "echo Backend API running on http://localhost:3001 && npm run dev"

cd ..

echo.
echo Step 4: Starting Frontend Development Server...
timeout /t 3 >nul
start "YKZ Frontend" cmd /k "echo Frontend running on http://localhost:8080 && npm run dev"

echo.
echo ================================================
echo YKZ POS System is starting up!
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3001
echo.
echo Default Login:
echo Admin: admin / 12345
echo Cashier: cashier / 12345
echo ================================================

pause
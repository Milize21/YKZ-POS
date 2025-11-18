@echo off
echo ========================================
echo YKZ-POS Email Setup Wizard
echo ========================================
echo.

REM Check if .env exists
if exist backend\.env (
    echo .env file already exists!
    echo Do you want to overwrite it? [Y/N]
    set /p overwrite=
    if /i not "%overwrite%"=="Y" (
        echo Setup cancelled.
        pause
        exit /b
    )
)

echo.
echo Setting up email notifications for YKZ-POS...
echo.
echo Email will be sent to: yorukazeproduction@gmail.com
echo.
echo You need a Gmail App Password to continue.
echo.
echo Steps to get Gmail App Password:
echo 1. Go to https://myaccount.google.com/security
echo 2. Enable 2-Step Verification if not enabled
echo 3. Go to "App passwords" section
echo 4. Select "Mail" and "Windows Computer"
echo 5. Copy the 16-character password
echo.
pause
echo.

REM Get email credentials
echo Enter your Gmail address for SENDING emails:
echo (This is the account that will send notifications)
set /p EMAIL_USER=

echo.
echo Enter your Gmail App Password (16 characters):
set /p EMAIL_PASSWORD=

REM Create .env file
(
echo # Email Configuration
echo EMAIL_USER=%EMAIL_USER%
echo EMAIL_PASSWORD=%EMAIL_PASSWORD%
echo.
echo # Backend Configuration
echo PORT=3001
echo NODE_ENV=production
echo.
echo # Use SQLite for standalone mode
echo USE_SQLITE=true
) > backend\.env

echo.
echo ========================================
echo Email setup complete!
echo ========================================
echo.
echo Configuration saved to: backend\.env
echo.
echo Testing email configuration...
echo.

REM Start backend if not running
cd backend
call npm install nodemailer 2>nul
echo.
echo Starting backend server...
start /B npm start

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Test email
echo.
echo Sending test email...
curl -X POST http://localhost:3001/api/test-email

echo.
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo - Backend server started on port 3001
echo - Email notifications configured
echo - Test email sent (check spam folder)
echo.
echo Next steps:
echo 1. Check yorukazeproduction@gmail.com for test email
echo 2. Start your POS system: npm run dev
echo 3. Make a test sale to verify notifications
echo.
pause

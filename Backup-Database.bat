@echo off
setlocal enabledelayedexpansion

:: YKZ-POS Database Backup Script
:: Creates timestamped backup of database and uploads

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         YORUKAZE POS - DATABASE BACKUP                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Get current date and time for backup filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%-%datetime:~8,6%

:: Create backup directory if it doesn't exist
set BACKUP_DIR=backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Backup database
echo [1/2] Backing up database...
if exist "backend\database\ykz_pos.db" (
    copy "backend\database\ykz_pos.db" "%BACKUP_DIR%\ykz_pos_%BACKUP_DATE%.db" >nul
    echo       ✓ Database backed up: ykz_pos_%BACKUP_DATE%.db
) else (
    echo       ✗ Database file not found!
)

:: Backup uploads folder
echo.
echo [2/2] Backing up uploaded media files...
if exist "backend\uploads" (
    xcopy "backend\uploads" "%BACKUP_DIR%\uploads_%BACKUP_DATE%\" /E /I /Y /Q >nul
    echo       ✓ Media files backed up: uploads_%BACKUP_DATE%\
) else (
    echo       ✗ Uploads folder not found!
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  Backup completed successfully!                              ║
echo ║  Location: %CD%\%BACKUP_DIR%\                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit...
pause >nul

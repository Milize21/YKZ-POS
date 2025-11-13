@echo off
setlocal enabledelayedexpansion

:: YKZ-POS Database Restore Script

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         YORUKAZE POS - DATABASE RESTORE                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if backups folder exists
if not exist "backups" (
    echo ✗ No backups folder found!
    echo   Run Backup-Database.bat first to create backups.
    echo.
    pause
    exit /b
)

:: List available backups
echo Available backups:
echo ═════════════════════════════════════════════════════════════
dir /b "backups\ykz_pos_*.db" 2>nul
if errorlevel 1 (
    echo ✗ No database backups found!
    echo.
    pause
    exit /b
)

echo.
echo ═════════════════════════════════════════════════════════════
echo.
set /p BACKUP_FILE="Enter the backup filename to restore (e.g., ykz_pos_20251113-120000.db): "

if not exist "backups\%BACKUP_FILE%" (
    echo.
    echo ✗ Backup file not found: %BACKUP_FILE%
    echo.
    pause
    exit /b
)

:: Confirm restore
echo.
echo ⚠️  WARNING: This will OVERWRITE your current database!
echo    Current data will be lost unless you have another backup.
echo.
set /p CONFIRM="Are you sure you want to restore? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo.
    echo Restore cancelled.
    echo.
    pause
    exit /b
)

:: Create backup directory if it doesn't exist
if not exist "backend\database" mkdir "backend\database"

:: Restore database
echo.
echo Restoring database from backup...
copy "backups\%BACKUP_FILE%" "backend\database\ykz_pos.db" /Y >nul
if errorlevel 1 (
    echo ✗ Failed to restore database!
) else (
    echo ✓ Database restored successfully!
)

:: Extract date from backup filename for uploads restore
set BACKUP_DATE=%BACKUP_FILE:~8,15%
set UPLOADS_BACKUP=backups\uploads_%BACKUP_DATE%

if exist "%UPLOADS_BACKUP%" (
    echo.
    set /p RESTORE_UPLOADS="Restore media files too? (yes/no): "
    if /i "!RESTORE_UPLOADS!"=="yes" (
        echo Restoring media files...
        xcopy "%UPLOADS_BACKUP%" "backend\uploads\" /E /I /Y /Q >nul
        echo ✓ Media files restored!
    )
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  Restore completed!                                          ║
echo ║  Restart the application to use the restored database.       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause

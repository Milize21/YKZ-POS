@echo off
echo.
echo ============================================
echo   YORUKAZE POS - CUSTOM ICON SETUP
echo ============================================
echo.
echo This will help you set up a permanent custom icon for your shortcut.
echo.
echo.

echo Current Options:
echo.
echo 1. I have an icon file (.ico) ready
echo 2. I have a logo image (PNG/JPG) - needs conversion
echo 3. Use a built-in Windows icon (temporary)
echo 4. Download a free POS icon from the internet
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto hasicon
if "%choice%"=="2" goto needsconversion
if "%choice%"=="3" goto systemicon
if "%choice%"=="4" goto downloadicon

:hasicon
echo.
echo Great! Please follow these steps:
echo.
echo 1. Copy your icon.ico file
echo 2. Paste it into: C:\Users\binta\YKZ-POS\
echo 3. Make sure it's named exactly: icon.ico
echo.
echo Then press any key to create the shortcut...
pause >nul
powershell -ExecutionPolicy Bypass -File Create-Shortcut.ps1
goto end

:needsconversion
echo.
echo To convert your image to .ico format:
echo.
echo 1. Go to: https://convertio.co/png-ico/
echo 2. Upload your logo/image
echo 3. Download the converted icon.ico file
echo 4. Save it to: C:\Users\binta\YKZ-POS\icon.ico
echo 5. Run this script again and choose option 1
echo.
echo Opening converter website...
start https://convertio.co/png-ico/
goto end

:systemicon
echo.
echo Using system icon (temporary solution)
echo.
echo Available icons:
echo   - Store/Shop icon (current default)
echo   - Folder icon
echo   - Computer icon
echo   - Document icon
echo.
powershell -ExecutionPolicy Bypass -File Create-Shortcut.ps1
echo.
echo Note: For a professional look, create a custom .ico file
echo.
goto end

:downloadicon
echo.
echo Free icon websites:
echo.
echo 1. Flaticon: https://www.flaticon.com/search?word=pos
echo 2. Icons8: https://icons8.com/icons/set/pos
echo 3. Iconfinder: https://www.iconfinder.com/search?q=pos
echo.
echo Download an icon, save as icon.ico in YKZ-POS folder
echo.
echo Opening Flaticon...
start https://www.flaticon.com/search?word=pos
goto end

:end
echo.
echo ============================================
echo.
pause

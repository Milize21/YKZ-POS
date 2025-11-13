@echo off
:: Create Desktop Shortcut for Yorukaze POS
echo Creating desktop shortcut...

set SCRIPT_DIR=%~dp0
set SHORTCUT_NAME=Yorukaze POS.lnk
set TARGET_PATH=%SCRIPT_DIR%Run-Development.bat
set DESKTOP=%USERPROFILE%\Desktop

:: Create VBScript to generate shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%DESKTOP%\%SHORTCUT_NAME%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%TARGET_PATH%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "Start Yorukaze POS Application" >> CreateShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\SHELL32.dll,165" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

:: Run the VBScript
cscript CreateShortcut.vbs

:: Clean up
del CreateShortcut.vbs

echo.
echo =============================================
echo   Shortcut created on your Desktop!
echo =============================================
echo.
echo You can now double-click "Yorukaze POS" on
echo your desktop to start the application.
echo.
pause

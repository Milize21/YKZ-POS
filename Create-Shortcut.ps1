# PowerShell script to create a desktop shortcut for YKZ-POS

$WScriptShell = New-Object -ComObject WScript.Shell

# Try OneDrive Desktop first, fallback to regular Desktop
$OneDriveDesktop = "$env:USERPROFILE\OneDrive\Desktop"
$RegularDesktop = "$env:USERPROFILE\Desktop"

if (Test-Path $OneDriveDesktop) {
    $DesktopPath = $OneDriveDesktop
} else {
    $DesktopPath = $RegularDesktop
}

$ShortcutPath = Join-Path $DesktopPath "Yorukaze POS.lnk"

$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\binta\YKZ-POS\Start-YKZ-POS-Fast.vbs"
$Shortcut.WorkingDirectory = "C:\Users\binta\YKZ-POS"
$Shortcut.Description = "Start Yorukaze POS Application (Fast Mode)"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,21"
$Shortcut.Save()

Write-Host "Shortcut created successfully on Desktop!" -ForegroundColor Green
Write-Host "You can now double-click 'Yorukaze POS' on your desktop to start the application." -ForegroundColor Cyan

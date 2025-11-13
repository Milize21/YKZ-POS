Set WshShell = CreateObject("WScript.Shell")

' Kill node processes (backend)
WshShell.Run "taskkill /F /IM node.exe", 0, True

' Wait a moment
WScript.Sleep 1000

' Show notification
WshShell.Popup "Yorukaze POS has been stopped.", 2, "Yorukaze POS", 64

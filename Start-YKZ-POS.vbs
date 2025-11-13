Set WshShell = CreateObject("WScript.Shell")
Set objHTTP = CreateObject("MSXML2.ServerXMLHTTP.6.0")

' Get the directory where this script is located
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Set environment variables
WshShell.Environment("Process")("USE_SQLITE") = "true"
WshShell.Environment("Process")("CORS_ORIGIN") = "http://localhost:5173"

' Start backend (hidden)
WshShell.CurrentDirectory = scriptDir & "\backend"
WshShell.Run "cmd /c npm start", 0, False

' Wait for backend to be ready (check every 500ms, max 10 seconds)
backendReady = False
For i = 1 To 20
    WScript.Sleep 500
    On Error Resume Next
    objHTTP.Open "GET", "http://localhost:3001/api/health", False
    objHTTP.setRequestHeader "Content-Type", "application/json"
    objHTTP.Send
    If objHTTP.Status = 200 Then
        backendReady = True
        Exit For
    End If
    On Error GoTo 0
Next

' Start frontend (hidden)
WshShell.CurrentDirectory = scriptDir
WshShell.Run "cmd /c npm run dev", 0, False

' Wait for frontend to be ready (check every 500ms, max 10 seconds)
frontendReady = False
For i = 1 To 20
    WScript.Sleep 500
    On Error Resume Next
    objHTTP.Open "GET", "http://localhost:5173", False
    objHTTP.Send
    If objHTTP.Status = 200 Then
        frontendReady = True
        Exit For
    End If
    On Error GoTo 0
Next

' Open browser automatically
WshShell.Run "http://localhost:5173", 1, False

' Show quick notification
Set objShell = CreateObject("Wscript.Shell")
If backendReady And frontendReady Then
    objShell.Popup "Yorukaze POS is ready!", 2, "Yorukaze POS", 64
Else
    objShell.Popup "Yorukaze POS is starting..." & vbCrLf & "Please wait a moment.", 2, "Yorukaze POS", 48
End If

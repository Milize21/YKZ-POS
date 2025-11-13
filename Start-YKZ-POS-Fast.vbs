Set WshShell = CreateObject("WScript.Shell")
Set objHTTP = CreateObject("MSXML2.ServerXMLHTTP.6.0")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Set environment variables
WshShell.Environment("Process")("USE_SQLITE") = "true"
WshShell.Environment("Process")("CORS_ORIGIN") = "http://localhost:5173"

' Start BOTH servers in parallel (faster!)
WshShell.CurrentDirectory = scriptDir & "\backend"
WshShell.Run "cmd /c npm start", 0, False

WshShell.CurrentDirectory = scriptDir
WshShell.Run "cmd /c npm run dev", 0, False

' Wait for BOTH to be ready simultaneously (max 15 seconds total)
backendReady = False
frontendReady = False
maxAttempts = 30 ' 30 x 500ms = 15 seconds max

For i = 1 To maxAttempts
    WScript.Sleep 500
    
    ' Check backend if not ready yet
    If Not backendReady Then
        On Error Resume Next
        objHTTP.Open "GET", "http://localhost:3001/api/health", False
        objHTTP.setRequestHeader "Content-Type", "application/json"
        objHTTP.Send
        If objHTTP.Status = 200 Then
            backendReady = True
        End If
        On Error GoTo 0
    End If
    
    ' Check frontend if not ready yet
    If Not frontendReady Then
        On Error Resume Next
        objHTTP.Open "GET", "http://localhost:5173", False
        objHTTP.Send
        If objHTTP.Status = 200 Then
            frontendReady = True
        End If
        On Error GoTo 0
    End If
    
    ' Exit loop if both are ready
    If backendReady And frontendReady Then
        Exit For
    End If
Next

' Open browser
WshShell.Run "http://localhost:5173", 1, False

' Quick success notification
If backendReady And frontendReady Then
    WshShell.Popup "Ready in " & (i * 0.5) & " seconds!", 1, "Yorukaze POS", 64
End If

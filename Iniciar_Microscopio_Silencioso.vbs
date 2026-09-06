' ==============================================================================
' INICIADOR SILENCIOSO EN SEGUNDO PLANO - DR. CASTILLO
' Inicia el servidor puente de microscopio sin ventanas negras y abre el navegador
' ==============================================================================
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Liberar puerto 8085 de sesiones anteriores de forma totalmente silenciosa
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr "":8085"" ^| findstr ""LISTENING""') do taskkill /F /PID %a >nul 2>&1", 0, True

' 2. Iniciar el servidor de streaming de microscopio en segundo plano (Ventana Oculta = 0)
WshShell.CurrentDirectory = scriptDir
WshShell.Run "cmd /c python servidor_microscopio_bridge.py", 0, False

' 3. Pausa breve de 1.2 segundos para inicializar FastAPI
WScript.Sleep 1200

' 4. Abrir la aplicación de reportes en Google Chrome / Navegador Predeterminado
WshShell.Run "cmd /c start http://localhost:8085/reportes.html", 0, False

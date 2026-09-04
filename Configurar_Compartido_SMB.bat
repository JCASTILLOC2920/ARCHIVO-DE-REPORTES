@echo off
:: ============================================================================
:: CONFIGURADOR AUTOMÁTICO DE CARPETA COMPARTIDA SMB (1-CLIC)
:: ============================================================================
setlocal EnableDelayedExpansion

:: 1. Verificar y autoelevar a Administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Solicitando privilegios de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

title Configurando Carpeta Compartida SMB...
color 0B
cls
echo ===============================================================================
echo        CONFIGURACION DE CARPETA COMPARTIDA NATIVA DE RED (SMB)
echo ===============================================================================
echo.

set "SHARE_NAME=Buzon_Transferencia"
set "FOLDER_PATH=C:\%SHARE_NAME%"

:: 2. Crear carpeta si no existe
if not exist "%FOLDER_PATH%" (
    echo [*] Creando carpeta fisica: %FOLDER_PATH%
    mkdir "%FOLDER_PATH%" >nul 2>&1
) else (
    echo [*] La carpeta fisica %FOLDER_PATH% ya existe.
)

:: 3. Aplicar Permisos NTFS (Control Total a Todos / Everyone)
echo [*] Configurando permisos NTFS de seguridad...
icacls "%FOLDER_PATH%" /grant Everyone:(OI)(CI)F /q >nul 2>&1
icacls "%FOLDER_PATH%" /grant "Todos":(OI)(CI)F /q >nul 2>&1
icacls "%FOLDER_PATH%" /grant "Usuarios autentificados":(OI)(CI)F /q >nul 2>&1
icacls "%FOLDER_PATH%" /grant "Authenticated Users":(OI)(CI)F /q >nul 2>&1

:: 4. Configurar Recurso Compartido SMB
echo [*] Configurando recurso compartido de red SMB...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "if (Get-SmbShare -Name '%SHARE_NAME%' -ErrorAction SilentlyContinue) { Remove-SmbShare -Name '%SHARE_NAME%' -Force }; New-SmbShare -Name '%SHARE_NAME%' -Path '%FOLDER_PATH%' -FullAccess 'Everyone','Todos','Authenticated Users' -ErrorAction SilentlyContinue | Out-Null"

if %errorlevel% neq 0 (
    net share %SHARE_NAME%="%FOLDER_PATH%" /GRANT:Everyone,FULL /GRANT:Todos,FULL >nul 2>&1
)

:: 5. Abrir Reglas del Firewall de Windows (Compartir archivos e impresoras)
echo [*] Habilitando reglas del Firewall para SMB...
netsh advfirewall firewall set rule group="File and Printer Sharing" new enable=Yes >nul 2>&1
netsh advfirewall firewall set rule group="Archivos e impresoras compartidos" new enable=Yes >nul 2>&1

:: 6. Iniciar y configurar Servicios de Descubrimiento de Red
echo [*] Iniciando servicios de descubrimiento de red...
sc config FDResPub start= auto >nul 2>&1
sc start FDResPub >nul 2>&1
sc config FDPHost start= auto >nul 2>&1
sc start FDPHost >nul 2>&1

:: 7. Obtener IP Local y Nombre del Equipo
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.InterfaceAlias -notlike '*vEthernet*' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike '127.*' } | Select-Object -First 1).IPAddress"') do set LOCAL_IP=%%i

cls
color 0A
echo ===============================================================================
echo            CARPETA COMPARTIDA CONFIGURADA EXITOSAMENTE
echo ===============================================================================
echo.
echo  [DATOS DEL EQUIPO SERVIDOR]
echo  - Nombre del Equipo (Hostname) : %COMPUTERNAME%
echo  - Direccion IP Local           : %LOCAL_IP%
echo  - Carpeta Compartida Local     : %FOLDER_PATH%
echo.
echo  -----------------------------------------------------------------------------
echo  [COMO CONECTARSE DESDE LA OTRA PC]
echo.
echo  1. Ruta de Acceso Directo (Win + R):
echo     \\%LOCAL_IP%\%SHARE_NAME%
echo     \\%COMPUTERNAME%\%SHARE_NAME%
echo.
echo  2. Comando para Mapear como Unidad Z: en la otra PC (CMD / BAT):
echo     net use Z: \\%LOCAL_IP%\%SHARE_NAME% /persistent:yes
echo.
echo ===============================================================================
echo Presione cualquier tecla para salir...
pause >nul

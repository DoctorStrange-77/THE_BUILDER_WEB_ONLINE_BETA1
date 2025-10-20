@echo off
echo ========================================
echo Setup Android SDK
echo ========================================
echo.

echo Cerco Android SDK nel sistema...
echo.

REM Percorsi comuni dove potrebbe essere Android SDK
set SDK_PATH=

if exist "%LOCALAPPDATA%\Android\Sdk" (
    set SDK_PATH=%LOCALAPPDATA%\Android\Sdk
    echo [OK] Trovato Android SDK in: %SDK_PATH%
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
    set SDK_PATH=%USERPROFILE%\AppData\Local\Android\Sdk
    echo [OK] Trovato Android SDK in: %SDK_PATH%
) else if exist "C:\Android\Sdk" (
    set SDK_PATH=C:\Android\Sdk
    echo [OK] Trovato Android SDK in: %SDK_PATH%
) else (
    echo [ERRORE] Android SDK non trovato!
    echo.
    echo Percorsi controllati:
    echo - %LOCALAPPDATA%\Android\Sdk
    echo - %USERPROFILE%\AppData\Local\Android\Sdk
    echo - C:\Android\Sdk
    echo.
    echo SOLUZIONE:
    echo.
    echo 1. Installa Android Studio da: https://developer.android.com/studio
    echo    Android Studio include automaticamente l'SDK
    echo.
    echo 2. Oppure scarica solo Android SDK command line tools:
    echo    https://developer.android.com/studio#command-tools
    echo.
    echo 3. Dopo l'installazione, riprova questo script
    echo.
    pause
    exit /b 1
)

echo.
echo Creazione file local.properties...
echo.

REM Converti path in formato corretto (con backslash doppi)
set SDK_PATH_ESCAPED=%SDK_PATH:\=\\%

REM Crea il file local.properties
echo sdk.dir=%SDK_PATH_ESCAPED% > android\local.properties

if exist "android\local.properties" (
    echo [OK] File local.properties creato!
    echo.
    echo Contenuto:
    type android\local.properties
    echo.
    echo.
    echo ========================================
    echo CONFIGURAZIONE COMPLETATA!
    echo ========================================
    echo.
    echo Ora puoi eseguire:
    echo   build-with-java17.bat
    echo.
) else (
    echo [ERRORE] Impossibile creare local.properties
)

pause

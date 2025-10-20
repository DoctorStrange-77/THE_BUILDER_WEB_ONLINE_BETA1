@echo off
echo ========================================
echo THE BUILDER WEB - APK Build Script
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRORE] Java non e' installato!
    echo.
    echo Per compilare l'APK Android, devi installare Java JDK:
    echo.
    echo 1. Scarica Java JDK da: https://adoptium.net/temurin/releases/
    echo    - Scegli "JDK 17 (LTS)" o "JDK 21 (LTS)"
    echo    - Scegli "Windows" e "x64"
    echo    - Scarica il file .msi
    echo.
    echo 2. Installa il file scaricato
    echo    - Durante l'installazione, assicurati che "Set JAVA_HOME variable" sia selezionato
    echo    - Assicurati che "Add to PATH" sia selezionato
    echo.
    echo 3. Riavvia questo script dopo l'installazione
    echo.
    pause
    exit /b 1
)

echo [OK] Java e' installato
java -version
echo.

echo [STEP 1/4] Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRORE] Build React fallito!
    pause
    exit /b 1
)
echo [OK] React app built successfully
echo.

echo [STEP 2/4] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERRORE] Capacitor sync fallito!
    pause
    exit /b 1
)
echo [OK] Capacitor sync completed
echo.

echo [STEP 3/4] Building Android APK (this may take several minutes)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERRORE] APK build fallito!
    cd..
    pause
    exit /b 1
)
cd..
echo [OK] APK built successfully!
echo.

echo [STEP 4/4] Copying APK to desktop...
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set DESKTOP=%USERPROFILE%\Desktop
if exist "%APK_PATH%" (
    copy "%APK_PATH%" "%DESKTOP%\TheBuilderWeb.apk"
    echo [SUCCESS] APK copiato sul Desktop: TheBuilderWeb.apk
    echo.
    echo File size:
    dir "%DESKTOP%\TheBuilderWeb.apk" | find "TheBuilderWeb.apk"
) else (
    echo [ERRORE] APK non trovato in %APK_PATH%
)

echo.
echo ========================================
echo BUILD COMPLETATO!
echo ========================================
echo.
echo L'APK e' disponibile in:
echo - Desktop: %DESKTOP%\TheBuilderWeb.apk
echo - Progetto: %APK_PATH%
echo.
echo Per installare l'APK su Android:
echo 1. Trasferisci il file TheBuilderWeb.apk sul tuo telefono
echo 2. Apri il file sul telefono
echo 3. Autorizza l'installazione da "Origini sconosciute" se richiesto
echo 4. Installa l'app
echo.
pause

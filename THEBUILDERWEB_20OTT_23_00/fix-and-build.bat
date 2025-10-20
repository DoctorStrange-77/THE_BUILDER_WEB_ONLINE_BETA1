@echo off
echo ========================================
echo THE BUILDER WEB - Fix and Build APK
echo ========================================
echo.

echo [INFO] Questo script pulira' il progetto e rigenerera' l'APK
echo.
pause

echo [STEP 1/5] Pulisco la cache Gradle...
cd android
if exist ".gradle" (
    rd /s /q .gradle
    echo [OK] Cache Gradle eliminata
) else (
    echo [INFO] Nessuna cache Gradle da pulire
)

if exist "build" (
    rd /s /q build
    echo [OK] Cartella build eliminata
)

if exist "app\build" (
    rd /s /q app\build
    echo [OK] Cartella app\build eliminata
)
cd..
echo.

echo [STEP 2/5] Rebuilding React app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRORE] Build React fallito!
    pause
    exit /b 1
)
echo [OK] React app built
echo.

echo [STEP 3/5] Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERRORE] Capacitor sync fallito!
    pause
    exit /b 1
)
echo [OK] Capacitor synced
echo.

echo [STEP 4/5] Building Android APK (this will take several minutes)...
echo [INFO] Gradle scarichera' la versione 8.12 la prima volta...
echo [INFO] Questo puo' richiedere qualche minuto...
echo.
cd android
call gradlew.bat clean assembleDebug --no-daemon --stacktrace
set BUILD_ERROR=%errorlevel%
cd..

if %BUILD_ERROR% neq 0 (
    echo.
    echo [ERRORE] Build APK fallito!
    echo.
    echo Se l'errore persiste, prova queste soluzioni:
    echo.
    echo 1. Installa Java JDK 17 invece di Java 21
    echo    Download: https://adoptium.net/temurin/releases/?version=17
    echo.
    echo 2. Verifica che JAVA_HOME sia configurato correttamente
    echo    Esegui: echo %%JAVA_HOME%%
    echo.
    echo 3. Prova ad aprire il progetto in Android Studio
    echo    Comando: npx cap open android
    echo.
    pause
    exit /b 1
)
echo [OK] APK built successfully!
echo.

echo [STEP 5/5] Copying APK to Desktop...
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set DESKTOP=%USERPROFILE%\Desktop
if exist "%APK_PATH%" (
    copy "%APK_PATH%" "%DESKTOP%\TheBuilderWeb.apk"
    echo [SUCCESS] APK copiato sul Desktop: TheBuilderWeb.apk
    echo.
    echo File info:
    dir "%DESKTOP%\TheBuilderWeb.apk" | find "TheBuilderWeb.apk"
    echo.
    echo ========================================
    echo BUILD COMPLETATO CON SUCCESSO!
    echo ========================================
    echo.
    echo L'APK e' disponibile in:
    echo - Desktop: %DESKTOP%\TheBuilderWeb.apk
    echo - Progetto: %APK_PATH%
    echo.
    echo Dimensione file:
    for %%A in ("%DESKTOP%\TheBuilderWeb.apk") do echo %%~zA bytes
    echo.
) else (
    echo [ERRORE] APK non trovato in %APK_PATH%
    echo.
    echo Possibili soluzioni:
    echo 1. Controlla i log sopra per errori
    echo 2. Verifica che il build sia completato con successo
    echo 3. Controlla manualmente la cartella android\app\build\outputs\apk\
    echo.
)

echo.
echo Per installare l'APK su Android:
echo 1. Trasferisci TheBuilderWeb.apk sul telefono
echo 2. Apri il file e installa
echo 3. Autorizza "Origini sconosciute" se richiesto
echo.
pause

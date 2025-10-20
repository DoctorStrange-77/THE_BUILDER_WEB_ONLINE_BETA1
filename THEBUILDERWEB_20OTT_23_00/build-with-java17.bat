@echo off
echo ========================================
echo THE BUILDER WEB - Build con Java 21
echo ========================================
echo.

echo [INFO] Questo script forza l'uso di Java 21
echo.

REM Trova automaticamente Java 21 (o il JBR di Android Studio)
set JAVA21_PATH=
if exist "C:\Program Files\Android\Android Studio\jbr" set JAVA21_PATH=C:\Program Files\Android\Android Studio\jbr
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do set JAVA21_PATH=%%i
for /d %%i in ("C:\Program Files\Java\jdk-21*") do set JAVA21_PATH=%%i

if "%JAVA21_PATH%"=="" (
    echo [ERRORE] Java 21 non trovato!
    echo.
    echo Possibili percorsi controllati:
    echo - C:\Program Files\Android\Android Studio\jbr
    echo - C:\Program Files\Eclipse Adoptium\jdk-21*
    echo - C:\Program Files\Java\jdk-21*
    echo.
    echo Installa Java 21 da: https://adoptium.net/temurin/releases/?version=21
    pause
    exit /b 1
)

echo [OK] Java 21 trovato in: %JAVA21_PATH%
echo.

REM Configura JAVA_HOME temporaneamente per questo script
set JAVA_HOME=%JAVA21_PATH%
set PATH=%JAVA_HOME%\bin;%PATH%

echo [INFO] JAVA_HOME temporaneo: %JAVA_HOME%
echo [INFO] Verifica versione:
java -version
echo.

pause

echo.
echo [STEP 1/5] Pulisco la cache Gradle...
cd android
if exist ".gradle" (
    rd /s /q .gradle
    echo [OK] Cache Gradle eliminata
)
if exist "build" rd /s /q build
if exist "app\build" rd /s /q app\build
cd..
echo.

echo [STEP 2/5] Rebuilding React app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRORE] Build React fallito!
    pause
    exit /b 1
)
echo.

echo [STEP 3/5] Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERRORE] Capacitor sync fallito!
    pause
    exit /b 1
)
echo.

echo [STEP 4/5] Building Android APK con Java 21...
echo [INFO] JAVA_HOME: %JAVA_HOME%
echo.
cd android
call gradlew.bat clean assembleDebug --no-daemon
set BUILD_ERROR=%errorlevel%
cd..

if %BUILD_ERROR% neq 0 (
    echo.
    echo [ERRORE] Build APK fallito!
    echo.
    echo Controlla i log sopra per l'errore specifico.
    echo.
    pause
    exit /b 1
)
echo.

echo [STEP 5/5] Copying APK to Desktop...
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set DESKTOP=%USERPROFILE%\Desktop
if exist "%APK_PATH%" (
    copy "%APK_PATH%" "%DESKTOP%\TheBuilderWeb.apk"
    echo.
    echo ========================================
    echo BUILD COMPLETATO CON SUCCESSO!
    echo ========================================
    echo.
    echo APK salvato in: %DESKTOP%\TheBuilderWeb.apk
    echo.
    for %%A in ("%DESKTOP%\TheBuilderWeb.apk") do echo Dimensione: %%~zA bytes
    echo.
) else (
    echo [ERRORE] APK non trovato!
)

pause

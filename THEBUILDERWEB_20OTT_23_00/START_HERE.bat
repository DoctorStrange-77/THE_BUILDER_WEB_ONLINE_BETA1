@echo off
title The Builder Web - Istruzioni APK
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║              THE BUILDER WEB - APP ANDROID                        ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo  Benvenuto! Sto aprendo la guida per creare l'app Android...
echo.

REM Apri la guida HTML nel browser
start istruzioni-apk.html

timeout /t 2 /nobreak >nul

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║  COSA VUOI FARE?                                                  ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo  [1] Generare l'APK Android (build normale)
echo  [2] Fix e Rebuild APK (pulisce cache e ricomincia) CONSIGLIATO!
echo  [3] Aprire la guida completa (Markdown)
echo  [4] Aprire guida risoluzione errori
echo  [5] Verificare se Java e' installato
echo  [6] Scaricare Java JDK
echo  [7] Uscire
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

choice /c 1234567 /n /m "Scegli un'opzione (1-7): "

if errorlevel 7 goto :exit
if errorlevel 6 goto :download_java
if errorlevel 5 goto :check_java
if errorlevel 4 goto :open_errors
if errorlevel 3 goto :open_md
if errorlevel 2 goto :fix_build
if errorlevel 1 goto :build_apk

:build_apk
echo.
echo ► Avvio build APK...
echo.
call build-apk.bat
goto :end

:fix_build
echo.
echo ► Avvio Fix e Rebuild APK...
echo.
call fix-and-build.bat
goto :end

:open_md
echo.
echo ► Apertura guida Markdown...
start GUIDA_APK_ANDROID.md
goto :menu_loop

:open_errors
echo.
echo ► Apertura guida risoluzione errori...
start RISOLUZIONE_ERRORI.md
goto :menu_loop

:check_java
echo.
echo ═══════════════════════════════════════════════════════════════════
echo  VERIFICA JAVA
echo ═══════════════════════════════════════════════════════════════════
echo.
java -version
if %errorlevel% equ 0 (
    echo.
    echo [OK] Java e' installato correttamente!
    echo Puoi procedere con la generazione dell'APK.
) else (
    echo.
    echo [ERRORE] Java NON e' installato!
    echo.
    echo Devi installare Java JDK prima di generare l'APK.
    echo Premi [5] per aprire la pagina di download di Java.
)
echo.
pause
goto :menu_loop

:download_java
echo.
echo ► Apertura pagina download Java JDK...
start https://adoptium.net/temurin/releases/
echo.
echo La pagina di download si aprira' nel browser.
echo.
echo Configurazione consigliata:
echo - Versione: JDK 17 (LTS) o JDK 21 (LTS)
echo - Sistema: Windows
echo - Architettura: x64
echo - Tipo: .msi
echo.
echo Durante l'installazione, seleziona:
echo   [X] Set JAVA_HOME variable
echo   [X] Add to PATH
echo.
pause
goto :menu_loop

:menu_loop
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║  COSA VUOI FARE?                                                  ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo  [1] Generare l'APK Android (build normale)
echo  [2] Fix e Rebuild APK (pulisce cache e ricomincia) CONSIGLIATO!
echo  [3] Aprire la guida completa (Markdown)
echo  [4] Aprire guida risoluzione errori
echo  [5] Verificare se Java e' installato
echo  [6] Scaricare Java JDK
echo  [7] Uscire
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

choice /c 1234567 /n /m "Scegli un'opzione (1-7): "

if errorlevel 7 goto :exit
if errorlevel 6 goto :download_java
if errorlevel 5 goto :check_java
if errorlevel 4 goto :open_errors
if errorlevel 3 goto :open_md
if errorlevel 2 goto :fix_build
if errorlevel 1 goto :build_apk

:exit
echo.
echo ► Arrivederci!
timeout /t 1 /nobreak >nul
exit

:end
pause

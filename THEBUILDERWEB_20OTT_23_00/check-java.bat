@echo off
echo ========================================
echo VERIFICA CONFIGURAZIONE JAVA
echo ========================================
echo.

echo [1] Versione Java nel PATH:
java -version
echo.

echo [2] JAVA_HOME configurato:
echo %JAVA_HOME%
echo.

echo [3] Tutti i Java installati (cerca in Program Files):
echo.
dir "C:\Program Files\Eclipse Adoptium" /b 2>nul
dir "C:\Program Files\Java" /b 2>nul
dir "C:\Program Files (x86)\Java" /b 2>nul
echo.

echo [4] Variabile PATH (parte Java):
echo %PATH% | findstr /i java
echo.

pause

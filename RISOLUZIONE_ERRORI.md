# Risoluzione Errori - Build APK Android

## Errore Risolto: "Unsupported class file major version 69"

### Cosa era il problema

L'errore `Unsupported class file major version 69` indicava che:
- Hai installato Java 21 (version 69)
- Gradle 8.11.1 non gestiva correttamente Java 21
- Serviva configurare la compatibilitÃ  Java

### Cosa ho fatto per risolvere

âœ… **1. Aggiornato Gradle wrapper**
- Da: `gradle-8.11.1-all.zip`
- A: `gradle-8.12-all.zip`
- File modificato: `android/gradle/wrapper/gradle-wrapper.properties`

âœ… **2. Aggiornato Android Gradle Plugin**
- Da: `com.android.tools.build:gradle:8.7.2`
- A: `com.android.tools.build:gradle:8.7.3`
- File modificato: `android/build.gradle`

âœ… **3. Configurato compatibilitÃ  Java**
- Aggiunto `compileOptions` con Java 21
- File modificato: `android/app/build.gradle`

```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

âœ… **4. Ottimizzato gradle.properties**
- Aumentata memoria JVM: `-Xmx2048m`
- Abilitato build parallelo
- Abilitato caching
- File modificato: `android/gradle.properties`

## Come Procedere Ora

### Opzione 1: Usa il nuovo script FIX (CONSIGLIATO)

Ho creato uno script migliorato che pulisce tutto e ricomincia da zero:

```
fix-and-build.bat
```

Questo script:
1. Pulisce la cache Gradle
2. Rimuove le build precedenti
3. Ricompila l'app React
4. Sincronizza Capacitor
5. Genera l'APK pulito

### Opzione 2: Usa il vecchio script

Se preferisci, puoi ancora usare:

```
build-apk.bat
```

### Opzione 3: Comandi manuali

Se vuoi eseguire i comandi manualmente:

```bash
# 1. Pulisci cache Gradle
cd android
rd /s /q .gradle
rd /s /q build
rd /s /q app\build
cd..

# 2. Build React
npm run build

# 3. Sync Capacitor
npx cap sync android

# 4. Build APK
cd android
gradlew.bat clean assembleDebug
cd..
```

## Se il Problema Persiste

### Soluzione 1: Usa Java 21 invece di Java 21

Java 21 Ã¨ la versione LTS (Long Term Support) piÃ¹ stabile per Android:

1. **Disinstalla Java 21**
   - Pannello di Controllo â†’ Programmi â†’ Disinstalla

2. **Scarica Java 21**
   - URL: https://adoptium.net/temurin/releases/?version=17
   - Scegli: JDK 17 (LTS), Windows, x64, .msi

3. **Installa Java 21**
   - Assicurati di selezionare:
     - âœ… Set JAVA_HOME variable
     - âœ… Add to PATH

4. **Verifica installazione**
   ```
   java -version
   ```
   Dovresti vedere: `openjdk version "17.x.x"`

5. **Riprova il build**
   ```
   fix-and-build.bat
   ```

### Soluzione 2: Configura manualmente JAVA_HOME

Se hai sia Java 21 che Java 21 installati:

1. **Trova il percorso di Java 21**
   - Di solito: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\`

2. **Crea un file setjava.bat**
   ```batch
   @echo off
   set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.xx-hotspot
   set PATH=%JAVA_HOME%\bin;%PATH%
   echo Java configurato su versione 17
   java -version
   ```

3. **Usa questo comando prima del build**
   ```
   setjava.bat
   fix-and-build.bat
   ```

### Soluzione 3: Usa Android Studio

Se gli script non funzionano, puoi usare Android Studio:

1. **Installa Android Studio**
   - Download: https://developer.android.com/studio

2. **Apri il progetto**
   ```
   npx cap open android
   ```

3. **Build dall'IDE**
   - Menu: Build â†’ Build Bundle(s) / APK(s) â†’ Build APK(s)
   - Attendi il completamento
   - Click su "locate" per trovare l'APK

## Verifica Configurazione Sistema

### Controlla Java

```batch
java -version
```

**Output atteso:**
```
openjdk version "17.0.x" o "21.0.x"
```

### Controlla JAVA_HOME

```batch
echo %JAVA_HOME%
```

**Output atteso:**
```
C:\Program Files\Eclipse Adoptium\jdk-xx.x.x-hotspot
```

### Controlla Gradle

```batch
cd android
gradlew.bat --version
cd..
```

**Output atteso:**
```
Gradle 8.12
```

## Errori Comuni e Soluzioni

### Errore: "JAVA_HOME is not set"

**Soluzione:**
1. Reinstalla Java
2. Assicurati di selezionare "Set JAVA_HOME" durante l'installazione
3. Riavvia il computer

### Errore: "SDK location not found"

**Soluzione:**
1. Installa Android Studio
2. Apri Android Studio â†’ Tools â†’ SDK Manager
3. Installa Android SDK

Oppure aggiungi questo file: `android/local.properties`
```
sdk.dir=C:\\Users\\TUO_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Errore: "Gradle build failed"

**Soluzione:**
1. Pulisci tutto: `fix-and-build.bat`
2. Verifica che Java sia installato correttamente
3. Prova con Java 21 invece di Java 21

### Errore: "Out of memory"

**Soluzione:**
Ho giÃ  aumentato la memoria in `gradle.properties`, ma se necessario puoi aumentarla ulteriormente:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

## File Modificati

Questi file sono stati modificati per risolvere il problema:

1. âœ… `android/gradle/wrapper/gradle-wrapper.properties`
   - Aggiornato Gradle a 8.12

2. âœ… `android/build.gradle`
   - Aggiornato Android Gradle Plugin a 8.7.3

3. âœ… `android/app/build.gradle`
   - Aggiunta compatibilitÃ  Java 21

4. âœ… `android/gradle.properties`
   - Ottimizzazioni memoria e performance

## Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `START_HERE.bat` | Menu interattivo |
| `build-apk.bat` | Build APK normale |
| `fix-and-build.bat` | Pulisce e rebuild (NUOVO) |

## Supporto Aggiuntivo

Se dopo aver provato tutte queste soluzioni il problema persiste:

1. **Controlla i log completi**
   - I log sono mostrati durante il build
   - Cerca errori specifici

2. **Prova con un emulatore**
   ```
   npx cap run android
   ```

3. **Verifica configurazione sistema**
   - Windows 10/11
   - Almeno 8GB RAM
   - 20GB spazio disco libero

## Versioni Consigliate

Per evitare problemi di compatibilitÃ :

- âœ… **Java**: JDK 17 (LTS)
- âœ… **Gradle**: 8.12
- âœ… **Android Gradle Plugin**: 8.7.3
- âœ… **Node.js**: 18.x o 20.x
- âœ… **npm**: 9.x o 10.x

---

**Nota:** Se hai seguito tutti questi passaggi e il build ancora non funziona, potrebbe essere un problema specifico del tuo sistema. In quel caso, ti consiglio di usare Android Studio per buildare l'app manualmente.

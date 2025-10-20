# Guida: Come Generare l'APK Android per The Builder Web

## Stato Attuale

Ho configurato completamente il progetto per generare un'app Android! Questi sono i passi che ho completato:

- ✅ Installato Capacitor
- ✅ Inizializzato Capacitor nel progetto
- ✅ Compilato l'app React per produzione
- ✅ Aggiunto la piattaforma Android
- ✅ Sincronizzato i file con Android
- ✅ Creato script automatico per il build

**Manca solo:** Installare Java JDK sul tuo computer

## Soluzione: Installa Java e Genera l'APK

### Passo 1: Installa Java JDK

1. **Scarica Java JDK** da: https://adoptium.net/temurin/releases/

   Configurazione consigliata:
   - **Versione**: JDK 17 (LTS) o JDK 21 (LTS)
   - **Sistema Operativo**: Windows
   - **Architettura**: x64
   - **Tipo di pacchetto**: .msi (installer)

2. **Installa Java**
   - Esegui il file `.msi` scaricato
   - Durante l'installazione, **assicurati** che queste opzioni siano selezionate:
     - ✅ "Set JAVA_HOME variable"
     - ✅ "Add to PATH"
     - ✅ "JavaSoft (Oracle) registry keys"

3. **Verifica l'installazione**
   - Apri un nuovo Prompt dei comandi (CMD)
   - Digita: `java -version`
   - Dovresti vedere qualcosa come: `openjdk version "17.0.x" ...`

### Passo 2: Genera l'APK

Ho creato uno **script automatico** che fa tutto per te!

1. **Apri il file**: `build-apk.bat` (si trova nella cartella principale del progetto)
2. **Fai doppio click** sul file
3. **Aspetta** che lo script completi tutti i passaggi (può richiedere 5-10 minuti la prima volta)

Lo script farà automaticamente:
- ✅ Verifica che Java sia installato
- ✅ Compila l'app React
- ✅ Sincronizza con Capacitor
- ✅ Genera l'APK Android
- ✅ Copia l'APK sul Desktop

### Passo 3: Installa l'APK su Android

Dopo che lo script ha completato, troverai il file **`TheBuilderWeb.apk`** sul tuo Desktop.

1. **Trasferisci** il file sul tuo telefono Android (via USB, Bluetooth, email, Google Drive, ecc.)
2. **Apri** il file `.apk` sul telefono
3. Se richiesto, **autorizza** l'installazione da "Origini sconosciute"
   - Vai in Impostazioni → Sicurezza → Origini sconosciute (varia per dispositivo)
4. **Installa** l'app
5. **Apri** l'app dalla home screen

## Come Funziona l'App Android

### Caratteristiche

✅ **App completa**: Include tutte le funzionalità dell'app web
✅ **Dati locali**: I dati sono salvati localmente sul dispositivo (localStorage)
✅ **Offline**: Funziona senza connessione internet
✅ **Nativo**: Si comporta come un'app nativa Android

### Limitazioni (versione demo)

⚠️ **Nessuna sincronizzazione**: I dati non si sincronizzano tra telefono e computer
⚠️ **Nessun backup cloud**: Se disinstalli l'app, perdi i dati
⚠️ **Nessun import da Google Sheets**: Non puoi importare da Google Sheets direttamente dall'app

## Prossimi Passi (Opzionali)

Se vuoi migliorare l'app, posso aiutarti a:

### 1. Aggiungere Backend con Supabase
- Sincronizzazione dati tra dispositivi
- Backup automatico
- Multi-utente
- Accesso da qualsiasi dispositivo

### 2. Personalizzare l'App
- Cambiare icona e nome
- Aggiungere splash screen
- Configurare colori e temi

### 3. Pubblicare su Google Play Store
- Firmare l'APK con certificato
- Creare release APK
- Pubblicare sullo store

### 4. Aggiungere Funzionalità Native
- Notifiche push
- Fotocamera
- Geolocalizzazione
- Sensori del telefono

## Comandi Utili

### Build manuale (senza script)

```bash
# 1. Build React app
npm run build

# 2. Sync con Capacitor
npx cap sync android

# 3. Build APK
cd android
gradlew.bat assembleDebug
cd..
```

L'APK sarà in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Aprire il progetto in Android Studio

```bash
npx cap open android
```

Questo ti permette di:
- Modificare il codice nativo Android
- Testare l'app su emulatore
- Fare debug avanzato
- Generare release APK firmato

### Aggiornare l'app dopo modifiche

```bash
npm run build
npx cap sync android
cd android && gradlew.bat assembleDebug
```

## Risoluzione Problemi

### Errore: "JAVA_HOME is not set"
- Java non è installato correttamente
- Reinstalla Java assicurandoti di selezionare "Set JAVA_HOME"
- Riavvia il computer dopo l'installazione

### Errore: "SDK location not found"
- Android SDK non trovato
- Soluzione: Installa Android Studio, oppure usa lo script automatico

### APK troppo grande
- L'APK sarà circa 10-20 MB
- Puoi ridurre la dimensione abilitando ProGuard e R8

### L'app si chiude immediatamente
- Controlla i log: `adb logcat`
- Verifica che il build React sia completo
- Prova a rifare `npx cap sync android`

## Specifiche Tecniche

**App Info:**
- **Nome**: The Builder Web
- **Package**: com.thebuilder.app
- **Piattaforma**: Android 5.0+ (API 21+)
- **Architettura**: ARM, ARM64, x86, x86_64

**Build Info:**
- **Framework**: Capacitor 6.x
- **Runtime**: WebView Android
- **Storage**: localStorage (WebView)
- **Dimensione**: ~10-20 MB

## Struttura File Generati

```
THEBUILDERWEB_1/
├── capacitor.config.ts          # Configurazione Capacitor
├── build-apk.bat                # Script automatico build
├── android/                     # Progetto Android
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── res/             # Icone e risorse
│   │   │   └── assets/public/   # File web (HTML, JS, CSS)
│   │   └── build/outputs/apk/   # APK generato
│   └── gradlew.bat              # Gradle wrapper
└── dist/                        # Build React (web assets)
```

## Contatti e Supporto

Se hai problemi o domande:
1. Verifica questa guida
2. Controlla i log di errore
3. Chiedi assistenza

---

**Creato con ❤️ usando Capacitor + React + TypeScript**

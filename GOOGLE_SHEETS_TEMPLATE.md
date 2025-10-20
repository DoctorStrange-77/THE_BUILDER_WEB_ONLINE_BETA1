# Template Google Sheets per Importazione Dati Atleta

Questo documento descrive come preparare un file Google Sheets per importare i dati delle varie sezioni della scheda atleta.

## Come Usare

1. Crea un nuovo Google Sheet
2. Crea i fogli (tab) seguendo le specifiche sotto
3. Scarica il file come Excel (.xlsx)
4. Nella pagina dettaglio atleta, clicca su "IMPORTA DA GOOGLE SHEETS"
5. Seleziona il file scaricato

## Struttura dei Fogli

### 1. Foglio "Informazioni Cronologiche"

Questo foglio contiene le informazioni cronologiche dell'atleta.

| Data Nascita | Data Inizio | Data Fine | Età |
|--------------|-------------|-----------|-----|
| 1990-01-15   | 2024-01-01  | 2024-06-30| 34  |

**Colonne richieste:**
- `Data Nascita` o `Data nascita` o `DOB`
- `Data Inizio` o `Data inizio` o `Start`
- `Data Fine` o `Data fine` o `End`
- `Età` o `Eta` o `Age`

---

### 2. Foglio "Affaticamento e Progressioni"

Questo foglio contiene i dati di affaticamento muscolare e progressioni.

| Data       | Muscolo | Esercizio      | Progressione |
|------------|---------|----------------|--------------|
| 2024-01-15 | Petto   | Panca Piana    | 3x10 @70kg   |
| 2024-01-17 | Gambe   | Squat          | 4x8 @100kg   |
| 2024-01-20 | Dorsali | Trazioni       | 3x12         |

**Colonne richieste:**
- `Data` o `Date`
- `Muscolo` o `Muscle`
- `Esercizio` o `Exercise`
- `Progressione` o `Progression`

---

### 3. Foglio "Note e Osservazioni"

Questo foglio contiene note e osservazioni sull'atleta.

| Data       | Tipo           | Nota                                    |
|------------|----------------|-----------------------------------------|
| 2024-01-15 | Allenamento    | Ottima esecuzione, aumentare carico     |
| 2024-01-20 | Recupero       | Riferisce dolore al ginocchio destro    |
| 2024-01-25 | Motivazione    | Molto motivato, obiettivo: -5kg         |

**Colonne richieste:**
- `Data` o `Date`
- `Tipo` o `Type`
- `Nota` o `Note`

---

### 4. Foglio "Stress Score"

Questo foglio contiene i punteggi di stress dell'atleta.

| Data       | Qualità Sonno | Recupero Allenamento | Adesione Allenamento | Riduzione Peso | Riduzione Serie | Affaticamento Generale | Stress Durato Programma | Stress Oggi Allenamento |
|------------|---------------|----------------------|----------------------|----------------|-----------------|------------------------|-------------------------|-------------------------|
| 2024-01-15 | 8.0           | 7.5                  | 9.0                  | 0.0            | 0.0             | 3.0                    | 2.0                     | 2.5                     |
| 2024-01-22 | 7.0           | 6.0                  | 8.0                  | 0.0            | 1.0             | 4.0                    | 3.0                     | 3.5                     |

**Colonne richieste:**
- `Data` o `Date`
- `Qualità Sonno` o `Qualita Sonno` o `Sleep`
- `Recupero Allenamento` o `Recupero` o `Recovery`
- `Adesione Allenamento` o `Adesione` o `Adherence`
- `Riduzione Peso` o `Weight Reduction`
- `Riduzione Serie` o `Set Reduction`
- `Affaticamento Generale` o `General Fatigue`
- `Stress Durato Programma` o `Program Stress`
- `Stress Oggi Allenamento` o `Today Stress`

**Note:**
- Tutti i valori devono essere numerici (scala 0-10)
- Il sistema calcolerà automaticamente il punteggio totale

---

### 5. Foglio "Sustainability Score"

Questo foglio contiene i punteggi di sostenibilità del programma.

| Data       | Adesione Ultimi Periodi | Mancanze Motivazionali | Disponibilità Tempo | Livello Energetico |
|------------|-------------------------|------------------------|---------------------|--------------------|
| 2024-01-15 | 9.0                     | 2.0                    | 8.0                 | 8.5                |
| 2024-01-22 | 8.5                     | 3.0                    | 7.5                 | 7.0                |
| 2024-01-29 | 9.0                     | 1.5                    | 8.5                 | 9.0                |

**Colonne richieste:**
- `Data` o `Date`
- `Adesione Ultimi Periodi` o `Adesione` o `Adherence`
- `Mancanze Motivazionali` o `Mancanze` o `Lack` o `Motivazion`
- `Disponibilità Tempo` o `Disponibilita` o `Time`
- `Livello Energetico` o `Energy`

**Note:**
- Tutti i valori devono essere numerici (scala 0-10)
- "Mancanze Motivazionali" viene invertito automaticamente (10 - valore)
- Il sistema calcolerà automaticamente il punteggio totale

---

## Esempio di Template Completo

Puoi scaricare o copiare questo template:

### Struttura Minima

1. **Foglio 1: "Cronologiche"** - Una riga di intestazione + una riga di dati
2. **Foglio 2: "Stress"** - Una riga di intestazione + N righe di dati storici
3. **Foglio 3: "Sustainability"** - Una riga di intestazione + N righe di dati storici
4. **Foglio 4: "Affaticamento"** - Una riga di intestazione + N righe di dati storici
5. **Foglio 5: "Note"** - Una riga di intestazione + N righe di note

### Note Importanti

- I nomi dei fogli NON sono case-sensitive (puoi usare maiuscole o minuscole)
- I nomi delle colonne possono contenere le parole chiave indicate (es. "qualità sonno" o "sleep quality")
- Le date devono essere in formato YYYY-MM-DD (es. 2024-01-15)
- I valori numerici possono usare il punto o la virgola come separatore decimale
- Righe vuote vengono ignorate automaticamente
- Se una colonna non viene trovata, il campo viene lasciato vuoto

### Esempio di File Excel

Puoi creare un file Excel con questa struttura e importarlo direttamente senza passare da Google Sheets.

---

## Troubleshooting

### Errore: "Errore durante l'importazione del file"

- Verifica che il file sia in formato .xlsx o .xls
- Controlla che i nomi dei fogli contengano le parole chiave corrette
- Assicurati che le intestazioni delle colonne siano presenti

### I dati non vengono importati

- Verifica che le date siano in formato corretto (YYYY-MM-DD)
- Controlla che i valori numerici siano effettivamente numeri
- Assicurati che i nomi delle colonne contengano almeno una delle parole chiave

### Alcuni campi risultano vuoti

- Le colonne opzionali possono essere omesse
- Verifica l'ortografia dei nomi delle colonne
- Controlla che non ci siano spazi extra nei nomi delle colonne

---

## Supporto

Per problemi o domande, controlla il codice sorgente in:
`src/components/GoogleSheetsImporter.tsx`

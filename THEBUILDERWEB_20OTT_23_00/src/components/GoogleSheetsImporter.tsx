import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Link as LinkIcon } from "lucide-react";

interface ImportedData {
  cronologiche?: {
    dataNascita: string;
    dataInizio: string;
    dataFine: string;
    eta: number;
  };
  affaticamento?: Array<{
    data: string;
    muscolo: string;
    esercizio: string;
    progressione: string;
  }>;
  note?: Array<{
    data: string;
    tipo: string;
    nota: string;
  }>;
  stressScore?: Array<{
    data: string;
    qualitaSonno: number;
    recuperoAllenamento: number;
    adesioneAllenamento: number;
    riduzionePeso: number;
    riduzioneSerie: number;
    affaticamentoGenerale: number;
    stressDuratoProgramma: number;
    stressOggiAllenamento: number;
  }>;
  sustainabilityScore?: Array<{
    data: string;
    adesioneUltimiPeriodi: number;
    mancanzeMotivazionali: number;
    disponibilitaTempo: number;
    livelloEnergetico: number;
  }>;
}

interface GoogleSheetsImporterProps {
  athleteId: string;
  onDataImported: (data: ImportedData) => void;
}

export default function GoogleSheetsImporter({ athleteId, onDataImported }: GoogleSheetsImporterProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Converti link Google Sheets in URL di export CSV
  const convertToCSVExportUrl = (url: string): string => {
    try {
      // Se il link è già pubblicato (contiene /pub), usalo direttamente
      if (url.includes('/pub?') && url.includes('output=csv')) {
        return url;
      }

      // Se il link è già pubblicato ma manca output=csv, aggiungilo
      if (url.includes('/pub?')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('output', 'csv');
        return urlObj.toString();
      }

      // Altrimenti, converti dal formato /edit o /d/ID
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error("Link Google Sheets non valido");
      }

      const spreadsheetId = match[1];

      // Estrai il GID se presente (identifica il foglio specifico)
      const gidMatch = url.match(/[#&?]gid=(\d+)/);
      const gid = gidMatch ? gidMatch[1] : '0';

      // Costruisci l'URL di export CSV
      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    } catch (error) {
      throw new Error("Impossibile convertire il link");
    }
  };

  // Importa dal link Google Sheets
  const handleImportFromLink = async () => {
    if (!sheetsUrl.trim()) {
      toast.error("Inserisci il link del Google Sheet");
      return;
    }

    setIsLoading(true);

    try {
      const csvUrl = convertToCSVExportUrl(sheetsUrl);

      // Scarica il CSV con mode: 'cors' e credentials
      // redirect: 'follow' è importante per seguire i redirect di Google
      const response = await fetch(csvUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          'Accept': 'text/csv,application/csv,text/plain,*/*',
        }
      });

      if (!response.ok) {
        // Se fallisce, prova con un approccio alternativo
        throw new Error(
          "Impossibile scaricare i dati.\n\n" +
          "SOLUZIONE:\n" +
          "1. Vai su File → Condividi → Pubblica sul web\n" +
          "2. Seleziona il foglio e il formato CSV\n" +
          "3. Clicca Pubblica e copia il nuovo link\n\n" +
          "OPPURE condividi con 'Chiunque abbia il link può visualizzare'"
        );
      }

      const csvText = await response.text();

      // Verifica se il contenuto è HTML (pagina di errore)
      if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
        throw new Error(
          "Il foglio richiede autenticazione.\n\n" +
          "SOLUZIONE:\n" +
          "1. Apri il Google Sheet\n" +
          "2. File → Condividi → Pubblica sul web\n" +
          "3. Seleziona formato 'Valori separati da virgola (.csv)'\n" +
          "4. Clicca 'Pubblica'\n" +
          "5. Copia e incolla il nuovo link qui"
        );
      }

      // Parse CSV
      const rows = parseCSV(csvText);

      if (rows.length < 2) {
        toast.error("Il foglio è vuoto o non contiene dati validi");
        return;
      }

      // Processa i dati
      const importedData = await processCSVData(rows);

      // Salva i dati
      saveImportedData(athleteId, importedData);

      // Notifica il componente padre
      onDataImported(importedData);

      toast.success(`Importati ${rows.length - 1} inserimenti con successo!`);
      setSheetsUrl("");
      setShowLinkInput(false);

    } catch (error: any) {
      console.error("Errore importazione:", error);
      toast.error(error.message || "Errore durante l'importazione dal link");
    } finally {
      setIsLoading(false);
    }
  };

  // Parser CSV semplice
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current = '';
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (current || row.length > 0) {
          row.push(current.trim());
          if (row.some(cell => cell !== '')) {
            rows.push(row);
          }
        }
        current = '';
        row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else {
        current += char;
      }
    }

    if (current || row.length > 0) {
      row.push(current.trim());
      if (row.some(cell => cell !== '')) {
        rows.push(row);
      }
    }

    return rows;
  };

    // Util: parsing robusto di date italiane (dd/mm/yyyy, tempo con punti)
    const parseItalianDateToISO = (raw: string | undefined): string => {
      if (!raw) return new Date().toISOString();
      let s = String(raw).trim();
      if (!s) return new Date().toISOString();
      // Normalizza separatori tempo con ':'
      s = s.replace(/\.(?=\d{2}(?:\D|$))/g, ":");
      // Match dd/mm/yyyy [hh[:mm[:ss]]]
      const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2})[:\.]?(\d{1,2})?(?::(\d{1,2}))?)?/);
      if (m) {
        let d = parseInt(m[1], 10);
        let mo = parseInt(m[2], 10) - 1;
        let y = parseInt(m[3], 10);
        if (y < 100) y += 2000;
        const hh = m[4] ? parseInt(m[4], 10) : 0;
        const mm = m[5] ? parseInt(m[5], 10) : 0;
        const ss = m[6] ? parseInt(m[6], 10) : 0;
        const dt = new Date(Date.UTC(y, mo, d, hh, mm, ss));
        return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
      }
      const d2 = new Date(s);
      return isNaN(d2.getTime()) ? new Date().toISOString() : d2.toISOString();
    };

    // Processa i dati CSV dal Form_Responses
    const processCSVData = async (rows: string[][]): Promise<ImportedData> => {
    const headers = rows[0].map(h => String(h).toLowerCase());
    const dataRows = rows.slice(1);

    const importedData: ImportedData = {
      stressScore: [],
      sustainabilityScore: [],
    };

    // Mappa tutte le colonne
      // Preferisci colonna "Informazioni cronologiche" o timestamp; fallback alla prima colonna
      let timestampIdx = headers.findIndex(h => h.includes('informazioni cronologiche') || h.includes('timestamp'));
      if (timestampIdx < 0) timestampIdx = 0;
      const dataInizioIdx = (() => {
        const idx1 = headers.findIndex(h => h.includes('data inizio programma'));
        if (idx1 >= 0) return idx1;
        // Gestisce il refuso 'data inzio programma'
        const idx2 = headers.findIndex(h => h.includes('data inzio programma'));
        if (idx2 >= 0) return idx2;
        const idx3 = headers.findIndex(h => h.includes('inizio programma'));
        return idx3;
      })();
      const dataFineIdx = (() => {
        const idx1 = headers.findIndex(h => h.includes('data fine programma'));
        if (idx1 >= 0) return idx1;
        return headers.findIndex(h => h.includes('fine programma'));
      })();
      const pesoInizioIdx = (() => {
        const idx1 = headers.findIndex(h => h.includes('peso inizio programma'));
        if (idx1 >= 0) return idx1;
        return headers.findIndex(h => h.includes('peso inizio'));
      })();
      const pesoFineIdx = (() => {
        const idx1 = headers.findIndex(h => h.includes('peso fine programma'));
        if (idx1 >= 0) return idx1;
        return headers.findIndex(h => h.includes('peso fine'));
      })();
    const qualitaSonnoIdx = headers.findIndex(h => h.includes('qualità del sonno'));
    const quantoSentiMotiIdx = headers.findIndex(h => h.includes('quanto ti senti moti'));
    const andamentoIdx = headers.findIndex(h => h.includes('andamento degli'));
    const andamentoNutrizioIdx = headers.findIndex(h => h.includes('andamento nutrizio'));
    const livelloAffaticamentoIdx = headers.findIndex(h => h.includes('livello di affaticamento generale'));
    const noteIdx = headers.findIndex(h => h.includes('note') && h.includes('osservazioni'));
    const eserciziIdx = headers.findIndex(h => h.includes('esercizi') && h.includes('progressioni'));

    // Processa ogni riga
    dataRows.forEach(row => {
      if (!row || row.length === 0 || row.every(cell => !cell)) return; // Skip empty rows

        const timestamp = parseItalianDateToISO(row[timestampIdx]);

      // Crea un oggetto con TUTTI i dati grezzi
      const rawData: { [key: string]: any } = {};
      headers.forEach((header, idx) => {
        if (row[idx]) {
          rawData[header] = row[idx];
        }
      });

      // Crea un entry per Stress Score con tutti i campi
      const stressEntry = {
          data: timestamp,
        qualitaSonno: parseFloat(row[qualitaSonnoIdx]) || 0,
        recuperoAllenamento: parseFloat(row[quantoSentiMotiIdx]) || 0,
        adesioneAllenamento: parseFloat(row[andamentoIdx]) || 0,
        riduzionePeso: 0,
        riduzioneSerie: 0,
        affaticamentoGenerale: parseFloat(row[livelloAffaticamentoIdx]) || 0,
        stressDuratoProgramma: 0,
        stressOggiAllenamento: 0,
        // Campi aggiuntivi
        dataInizioProgramma: row[dataInizioIdx] || '',
        dataFineProgramma: row[dataFineIdx] || '',
        pesoInizio: row[pesoInizioIdx] || '',
        pesoFine: row[pesoFineIdx] || '',
        noteOsservazioni: row[noteIdx] || '',
        eserciziMiglioriProgressioni: row[eserciziIdx] || '',
        rawData: rawData, // Tutti i dati grezzi
      };

      // Crea un entry per Sustainability Score
      const sustainabilityEntry = {
          data: timestamp,
        adesioneUltimiPeriodi: parseFloat(row[andamentoIdx]) || 0,
        mancanzeMotivazionali: 10 - (parseFloat(row[quantoSentiMotiIdx]) || 0),
        disponibilitaTempo: parseFloat(row[andamentoNutrizioIdx]) || 0,
        livelloEnergetico: parseFloat(row[quantoSentiMotiIdx]) || 0,
        rawData: rawData, // Tutti i dati grezzi
      };

      importedData.stressScore?.push(stressEntry);
      importedData.sustainabilityScore?.push(sustainabilityEntry);
    });

    return importedData;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      // @ts-ignore
      const XLSX = (await import("xlsx")) as any;
      const workbook = XLSX.read(data, { type: "array" });

      const importedData: ImportedData = {};

      // Processa ogni foglio
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Identifica il tipo di dati in base al nome del foglio o all'header
        const sheetLower = sheetName.toLowerCase();

        if (sheetLower.includes("cronolog") || sheetLower.includes("informazioni")) {
          importedData.cronologiche = parseCronologiche(jsonData);
        } else if (sheetLower.includes("affaticamento") || sheetLower.includes("progressioni")) {
          importedData.affaticamento = parseAffaticamento(jsonData);
        } else if (sheetLower.includes("note") || sheetLower.includes("osservazioni")) {
          importedData.note = parseNote(jsonData);
        } else if (sheetLower.includes("stress")) {
          importedData.stressScore = parseStressScore(jsonData);
        } else if (sheetLower.includes("sustainability") || sheetLower.includes("sostenibilit")) {
          importedData.sustainabilityScore = parseSustainabilityScore(jsonData);
        }
      });

      // Salva i dati importati nel localStorage
      saveImportedData(athleteId, importedData);

      // Notifica il componente padre
      onDataImported(importedData);

      toast.success("Dati importati con successo!");
    } catch (err) {
      console.error("Errore importazione:", err);
      toast.error("Errore durante l'importazione del file");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const parseCronologiche = (data: any[][]): ImportedData['cronologiche'] => {
    if (data.length < 2) return undefined;

    const headers = data[0].map(h => String(h).toLowerCase());
    const row = data[1];

    const findValue = (keywords: string[]) => {
      for (const keyword of keywords) {
        const index = headers.findIndex(h => h.includes(keyword));
        if (index >= 0 && row[index]) return row[index];
      }
      return "";
    };

    return {
      dataNascita: findValue(["nascita", "data nascita", "dob"]) || "",
      dataInizio: findValue(["inizio", "data inizio", "start"]) || "",
      dataFine: findValue(["fine", "data fine", "end"]) || "",
      eta: parseInt(findValue(["età", "eta", "age"])) || 0,
    };
  };

  const parseAffaticamento = (data: any[][]): ImportedData['affaticamento'] => {
    if (data.length < 2) return [];

    const headers = data[0].map(h => String(h).toLowerCase());
    const dataIndex = headers.findIndex(h => h.includes("data") || h.includes("date"));
    const muscoloIndex = headers.findIndex(h => h.includes("muscolo") || h.includes("muscle"));
    const esercizioIndex = headers.findIndex(h => h.includes("esercizio") || h.includes("exercise"));
    const progressioneIndex = headers.findIndex(h => h.includes("progression") || h.includes("progressione"));

    return data.slice(1).filter(row => row.length > 0).map(row => ({
      data: row[dataIndex] || "",
      muscolo: row[muscoloIndex] || "",
      esercizio: row[esercizioIndex] || "",
      progressione: row[progressioneIndex] || "",
    }));
  };

  const parseNote = (data: any[][]): ImportedData['note'] => {
    if (data.length < 2) return [];

    const headers = data[0].map(h => String(h).toLowerCase());
    const dataIndex = headers.findIndex(h => h.includes("data") || h.includes("date"));
    const tipoIndex = headers.findIndex(h => h.includes("tipo") || h.includes("type"));
    const notaIndex = headers.findIndex(h => h.includes("nota") || h.includes("note"));

    return data.slice(1).filter(row => row.length > 0).map(row => ({
      data: row[dataIndex] || "",
      tipo: row[tipoIndex] || "",
      nota: row[notaIndex] || "",
    }));
  };

    const parseStressScore = (data: any[][]): ImportedData['stressScore'] => {
      if (data.length < 2) return [];

      const headers = data[0].map(h => String(h).toLowerCase());

    const findIndex = (keywords: string[]) => {
      for (const keyword of keywords) {
        const index = headers.findIndex(h => h.includes(keyword));
        if (index >= 0) return index;
      }
      return -1;
    };

      let dataIndex = findIndex(["informazioni cronologiche", "timestamp", "data", "date"]);
      if (dataIndex < 0) dataIndex = 0;
    const qualitaSonnoIndex = findIndex(["qualità sonno", "qualita sonno", "qualità del sonno", "sleep"]);
    const recuperoIndex = findIndex(["recupero", "recovery", "moti"]);
    const adesioneIndex = findIndex(["adesione", "adherence", "andamento"]);
    const riduzioneWeightIndex = findIndex(["riduzione peso", "weight reduction"]);
    const riduzioneSerieIndex = findIndex(["riduzione serie", "set reduction"]);
    const affaticamentoIndex = findIndex(["affaticamento generale", "affaticamento", "general fatigue", "livello di affaticamento"]);
    const stressDuratoIndex = findIndex(["stress durato", "program stress"]);
      const stressOggiIndex = findIndex(["stress oggi", "today stress"]);
      const eserciziMiglioriIdx = findIndex(["esercizi con migliori progressioni", "migliori progressioni", "progressioni di carico"]);
      const noteGeneraliIdx = findIndex(["note aggiuntive generali", "note osservazioni", "note generali"]);

      return data.slice(1).filter(row => row.length > 0).map(row => {
        const rawData: { [key: string]: any } = {};
        headers.forEach((h, idx) => {
          const val = row[idx];
          if (val !== undefined && val !== null && String(val).trim().length > 0) {
            rawData[h] = val;
          }
        });

          return {
            data: parseItalianDateToISO(row[dataIndex] as any),
          qualitaSonno: parseFloat(row[qualitaSonnoIndex]) || 0,
          recuperoAllenamento: parseFloat(row[recuperoIndex]) || 0,
          adesioneAllenamento: parseFloat(row[adesioneIndex]) || 0,
          riduzionePeso: parseFloat(row[riduzioneWeightIndex]) || 0,
          riduzioneSerie: parseFloat(row[riduzioneSerieIndex]) || 0,
          affaticamentoGenerale: parseFloat(row[affaticamentoIndex]) || 0,
          stressDuratoProgramma: parseFloat(row[stressDuratoIndex]) || 0,
          stressOggiAllenamento: parseFloat(row[stressOggiIndex]) || 0,
          eserciziMiglioriProgressioni: eserciziMiglioriIdx >= 0 ? (row[eserciziMiglioriIdx] || "") : "",
          noteOsservazioni: noteGeneraliIdx >= 0 ? (row[noteGeneraliIdx] || "") : "",
          rawData,
        };
      });
    };

  const parseSustainabilityScore = (data: any[][]): ImportedData['sustainabilityScore'] => {
    if (data.length < 2) return [];

    const headers = data[0].map(h => String(h).toLowerCase());

    const findIndex = (keywords: string[]) => {
      for (const keyword of keywords) {
        const index = headers.findIndex(h => h.includes(keyword));
        if (index >= 0) return index;
      }
      return -1;
    };

      let dataIndex = findIndex(["informazioni cronologiche", "timestamp", "data", "date"]);
      if (dataIndex < 0) dataIndex = 0;
    const adesioneIndex = findIndex(["adesione", "adherence", "andamento"]);
    const mancanzeIndex = findIndex(["mancanze", "lack", "motivazion"]);
    const disponibilitaIndex = findIndex(["disponibilità", "disponibilita", "time", "nutrizio"]);
    const livelloIndex = findIndex(["livello energetico", "energy", "moti"]);

      return data.slice(1).filter(row => row.length > 0).map(row => ({
        data: parseItalianDateToISO(row[dataIndex] as any),
      adesioneUltimiPeriodi: parseFloat(row[adesioneIndex]) || 0,
      mancanzeMotivazionali: parseFloat(row[mancanzeIndex]) || 0,
      disponibilitaTempo: parseFloat(row[disponibilitaIndex]) || 0,
      livelloEnergetico: parseFloat(row[livelloIndex]) || 0,
    }));
  };

  const saveImportedData = (athleteId: string, data: ImportedData) => {
    // Salva i dati nelle chiavi appropriate del localStorage
    if (data.cronologiche) {
      localStorage.setItem(`athlete:${athleteId}:cronologiche`, JSON.stringify(data.cronologiche));
    }

    if (data.affaticamento && data.affaticamento.length > 0) {
      localStorage.setItem(`athlete:${athleteId}:affaticamento`, JSON.stringify(data.affaticamento));
    }

    if (data.note && data.note.length > 0) {
      localStorage.setItem(`athlete:${athleteId}:note`, JSON.stringify(data.note));
    }

    if (data.stressScore && data.stressScore.length > 0) {
      // Converti in formato StressScore con TUTTI i campi
      const stressScores = data.stressScore.map(s => ({
        date: s.data,
        physicalStress: (s.recuperoAllenamento + s.affaticamentoGenerale) / 2,
        mentalStress: (s.stressDuratoProgramma + s.stressOggiAllenamento) / 2,
        sleepQuality: s.qualitaSonno,
        recovery: s.recuperoAllenamento,
        totalScore: (s.qualitaSonno + s.recuperoAllenamento + s.adesioneAllenamento) / 3,
        // Campi dettagliati
        recuperoAllenamento: s.recuperoAllenamento,
        adesioneAllenamento: s.adesioneAllenamento,
        riduzionePeso: s.riduzionePeso,
        riduzioneSerie: s.riduzioneSerie,
        affaticamentoGenerale: s.affaticamentoGenerale,
        stressDuratoProgramma: s.stressDuratoProgramma,
        stressOggiAllenamento: s.stressOggiAllenamento,
        // Sezione 1: Informazioni Cronologiche
        dataInizioProgramma: s.dataInizioProgramma,
        dataFineProgramma: s.dataFineProgramma,
        pesoInizio: s.pesoInizio,
        pesoFine: s.pesoFine,
        // Sezione 4 e 5: Testo libero
        eserciziMiglioriProgressioni: s.eserciziMiglioriProgressioni,
        noteOsservazioni: s.noteOsservazioni,
        // Dati raw completi
        rawData: s.rawData,
      }));

      localStorage.setItem(`athlete:${athleteId}:stress`, JSON.stringify(stressScores));
    }

    if (data.sustainabilityScore && data.sustainabilityScore.length > 0) {
      // Converti in formato SustainabilityScore con TUTTI i campi
      const sustainabilityScores = data.sustainabilityScore.map(s => ({
        date: s.data,
        adherence: s.adesioneUltimiPeriodi,
        enjoyment: 10 - s.mancanzeMotivazionali, // Inverte la scala
        timeAvailability: s.disponibilitaTempo,
        energyLevels: s.livelloEnergetico,
        totalScore: (s.adesioneUltimiPeriodi + (10 - s.mancanzeMotivazionali) + s.disponibilitaTempo + s.livelloEnergetico) / 4,
        // Campi dettagliati originali
        adesioneUltimiPeriodi: s.adesioneUltimiPeriodi,
        mancanzeMotivazionali: s.mancanzeMotivazionali,
        disponibilitaTempo: s.disponibilitaTempo,
        livelloEnergetico: s.livelloEnergetico,
        // Dati raw completi
        rawData: s.rawData,
      }));

      localStorage.setItem(`athlete:${athleteId}:sustainability`, JSON.stringify(sustainabilityScores));
    }
  };

  return (
    <div className="space-y-3">
      {!showLinkInput ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-9 px-3 rounded-md border border-yellow-400 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            onClick={() => setShowLinkInput(true)}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            IMPORTA DA GOOGLE SHEETS
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3 rounded-md"
            onClick={handleClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Carica File Excel
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="sheets-url">Link Google Sheets</Label>
          <div className="flex gap-2">
            <Input
              id="sheets-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleImportFromLink}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              {isLoading ? "Importazione..." : "Importa"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false);
                setSheetsUrl("");
              }}
            >
              Annulla
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-yellow-600">⚠️ Non usare il link "edit" normale!</p>
            <p className="font-semibold">Devi pubblicare il foglio sul web:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Nel Google Sheet: <strong>File → Condividi → Pubblica sul web</strong></li>
              <li>Seleziona il foglio e formato <strong>CSV</strong></li>
              <li>Clicca <strong>Pubblica</strong></li>
              <li>Copia il link che inizia con <code className="bg-gray-100 px-1">...d/e/2PACX...</code></li>
              <li>Incollalo qui e clicca Importa</li>
            </ol>
            <p className="mt-2 text-xs italic">Il link "edit" funziona per visualizzare ma non per scaricare dati automaticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { MUSCLE_GROUPS } from "@/modules/template-split/types/training";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calculator, Printer, Save, FolderOpen, Edit, Trash2, FileText } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import progressionsData from "@/data/progressions.json";
import { filterAndRank, strictFilter, scoreMatch } from "@/utils/search";
import { useNavigate as useNav } from "react-router-dom";
import exercisesData from "@/data/exercises.json";
import { Progression, Exercise } from "@/types";
import { ROLES, STIMOLI } from "@/modules/template-split/types/training";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button as UiButton } from "@/components/ui/button";
import { toast } from "sonner";
import PrintableScheda from "@/components/PrintableScheda";
import { generateLogbookPDF } from "@/utils/generateLogbookPDF";

function MuscleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filtro personalizzato: cerca ogni parola in qualsiasi posizione
  const filteredMuscles = useMemo(() => {
    if (!search.trim()) return [];

    const searchWords = search.toLowerCase().trim().split(/\s+/);

    return MUSCLE_GROUPS
      .filter((muscle) => {
        const muscleName = muscle.name.toLowerCase();
        // TUTTE le parole cercate devono essere presenti nel nome
        return searchWords.every(word => muscleName.includes(word));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search]);

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value || ""}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false} filter={() => 1}>
          <CommandInput
            placeholder="Cerca distretto..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredMuscles.length === 0 && search.trim() !== "" && (
              <CommandEmpty>Nessun distretto trovato.</CommandEmpty>
            )}
            <CommandGroup>
              {filteredMuscles.map((muscle, idx) => (
                <CommandItem
                  key={muscle.name}
                  value={`muscle-${idx}`}
                  keywords={[muscle.name]}
                  onSelect={() => {
                    onChange(muscle.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === muscle.name ? "opacity-100" : "opacity-0"}`}
                  />
                  {muscle.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </>
  );
}

function StimoloSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value || ""}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command 
          filter={(value, q) => {
            const { score, matchesAll } = scoreMatch(value, q);
            return matchesAll ? score : 0;
          }}
        >
          <CommandInput
            placeholder="Cerca stimolo..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nessuno stimolo trovato.</CommandEmpty>
            <CommandGroup>
              {STIMOLI.map((stimolo, idx) => (
                <CommandItem
                  key={stimolo}
                  value={stimolo}
                  keywords={[stimolo]}
                  onSelect={() => {
                    onChange(stimolo);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === stimolo ? "opacity-100" : "opacity-0"}`}
                  />
                  {stimolo}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </>
  );
}

function ProgressionSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const progressions: Progression[] = useMemo(() => progressionsData as Progression[], []);

  // Filtro con ranking: robusto a maiuscole, accenti e separatori (spazi, _ , -)
  const filteredProgressions = useMemo(() => {
    return filterAndRank(progressions, (p) => p.name, search);
  }, [search, progressions]);

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={value || ""}
            onDoubleClick={() => setOpen(true)}
            onKeyDown={(e) => {
              // Cancella la progressione se premi CANC o DEL
              if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                onChange('');
              }
            }}
            className="w-full pr-8 cursor-pointer select-text"
            placeholder="Seleziona progressione..."
          />
          <ChevronsUpDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false} filter={() => 1}>
          <CommandInput
            placeholder="Cerca progressione..."
            value={search}
            onValueChange={(value) => {
              // Pulisci il testo: rimuovi caratteri invisibili ma mantieni gli spazi
              const cleaned = value
                .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Rimuovi solo zero-width chars
              setSearch(cleaned);
            }}
            onKeyDown={(e) => {
              // Previeni che Command intercetti lo spazio
              if (e.key === ' ') {
                e.stopPropagation();
              }
            }}
          />
          <CommandList>
            {filteredProgressions.length === 0 && search.trim() !== "" && (
              <CommandEmpty>Nessuna progressione trovata.</CommandEmpty>
            )}
            <CommandGroup>
              {filteredProgressions.map((progression, idx) => (
                <CommandItem
                  key={progression.name}
                  value={`progression-${idx}`}
                  keywords={[progression.name]}
                  onSelect={() => {
                    onChange(progression.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === progression.name ? "opacity-100" : "opacity-0"}`}
                  />
                  {progression.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </>
  );
}

function ExerciseSelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const exercises: Exercise[] = useMemo(() => exercisesData as Exercise[], []);
  const sortedExercises: Exercise[] = useMemo(
    () => [...exercises].sort((a, b) => a.name.localeCompare(b.name)),
    [exercises]
  );
  const hasAnyMatch = useMemo(() => {
    if (!search.trim()) return false;
    return exercises.some(e => scoreMatch(e.name, search).matchesAll);
  }, [exercises, search]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCustom, setPendingCustom] = useState("");
  const nav = useNav();

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value || placeholder || ""}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command 
          filter={(value, q) => {
            if (value?.startsWith("__add__")) return 1; // forza visibile l'opzione custom
            const { score, matchesAll } = scoreMatch(value, q);
            return matchesAll ? Math.max(1, score) : 0;
          }}
        >
          <CommandInput
            placeholder="Cerca esercizio..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nessun esercizio trovato.</CommandEmpty>
            <CommandGroup>
              {sortedExercises.map((exercise, idx) => (
                <CommandItem
                  key={exercise.name}
                  value={exercise.name}
                  keywords={[exercise.name]}
                  onSelect={() => {
                    onChange(exercise.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === exercise.name ? "opacity-100" : "opacity-0"}`}
                  />
                  {exercise.name}
                </CommandItem>
              ))}
              {search.trim() !== "" && !hasAnyMatch && (
                <CommandItem
                  key="add-custom-exercise"
                  value={`__add__${search}`}
                  onSelect={() => { setPendingCustom(search.trim()); setConfirmOpen(true); }}
                >
                  Aggiungi o usa: "{search.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nessun esercizio trovato</AlertDialogTitle>
          <AlertDialogDescription>
            Vuoi aggiungere "{pendingCustom}" al database esercizi?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setConfirmOpen(false); }}>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={() => { onChange(pendingCustom); setConfirmOpen(false); setOpen(false); setSearch(""); }}>Usa solo testo</AlertDialogAction>
          <AlertDialogAction onClick={() => { setConfirmOpen(false); setOpen(false); nav('/esercizi', { state: { newExerciseName: pendingCustom } }); }}>Aggiungi al database</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

const progressions: Progression[] = progressionsData as Progression[];
const exercises: Exercise[] = exercisesData as Exercise[];


// use ROLES from Template Split types
const EXERCISE_TYPES = ROLES.map(r => r.toUpperCase());

// Configurazione tipi di esercizio con esercizi figli
const EXERCISE_GROUP_CONFIG: Record<string, { childCount: number; badge: string; label: string; bg: string; border: string }> = {
  "Single set": { childCount: 0, badge: "", label: "Single set", bg: "", border: "" },
  "Superset": { childCount: 1, badge: "SS", label: "Superset", bg: "hsl(142, 76%, 49%, 0.1)", border: "hsl(142, 76%, 49%)" },
  "Triset": { childCount: 2, badge: "TS", label: "Triset", bg: "hsl(271, 46%, 53%, 0.1)", border: "hsl(271, 46%, 53%)" },
  "Giant set": { childCount: 3, badge: "GS", label: "Giant set", bg: "hsl(204, 70%, 53%, 0.1)", border: "hsl(204, 70%, 53%)" },
  "Compound set": { childCount: 1, badge: "CP", label: "Compound set", bg: "hsl(48, 89%, 50%, 0.1)", border: "hsl(48, 89%, 50%)" },
};

const ADVANCED_EXERCISE_TYPES = Object.keys(EXERCISE_GROUP_CONFIG);

interface WorkoutExercise {
  type: string;
  progression: string;
  muscle: string;
  exercise: string;
  stimolo?: string;
  technicalNote?: string;
  technique: string;
  weeks: Array<{ set: string; reps: string; info: string }>;
  rest: string;
  note: string;
  // Campi per gestire i gruppi (Superset, Triset, ecc.)
  groupType?: string; // tipo del gruppo (Superset, Triset, ecc.)
  isGroupHead?: boolean; // se è il capo gruppo
  isGroupChild?: boolean; // se è un figlio del gruppo
  groupId?: string; // ID univoco del gruppo
  childIndex?: number; // indice del figlio (0, 1, 2...)
}

export default function Schede() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estrai dati atleta dallo state (se proviene dalla pagina atleta)
  const athleteData = location.state?.athlete;
  const athleteName = athleteData ? `${athleteData.firstname} ${athleteData.lastname}` : null;

  const TemplateSplitButton = () => {
    return (
      <Button variant="outline" className="gap-2" onClick={() => {
        try {
          const payload = { numWorkouts, duration, clientInfo, workouts };
          localStorage.setItem("schede:draft", JSON.stringify(payload));
          // debug: log saved draft so developer can verify in console
          // eslint-disable-next-line no-console
          console.log('[Schede] saved draft before navigating to template-split:', payload);
          try { toast.success('Bozza salvata'); } catch (e) { /* ignore toast errors */ }
        } catch (e) {
          // ignore storage errors
        }
        navigate('/template-split', { state: { breadcrumb: { parent: 'Gestione Schede', current: 'Template Split' } } });
      }}>
        Template Split
      </Button>
    );
  };
  const [numWorkouts, setNumWorkouts] = useState<number>(0);
  const [duration, setDuration] = useState<number>(4);
  const [workouts, setWorkouts] = useState<WorkoutExercise[][]>([]);
  const [clientInfo, setClientInfo] = useState({
    lastname: "",
    firstname: "",
    startDate: "",
    endDate: "",
    block: "",
    notes: "",
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showCopyWorkoutDialog, setShowCopyWorkoutDialog] = useState(false);
  const [sourceWorkoutIndex, setSourceWorkoutIndex] = useState<number | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<boolean[]>([]);

  // Stati per gestione schede salvate
  const [savedSchede, setSavedSchede] = useState<any[]>([]);
  const [currentSchedaId, setCurrentSchedaId] = useState<string | null>(null);
  const [schedaName, setSchedaName] = useState("");
  // Tiene traccia se l'utente ha modificato manualmente il nome scheda
  const [isNameDirty, setIsNameDirty] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [schedaToDelete, setSchedaToDelete] = useState<string | null>(null);

  // Persistence helpers
  const isRestoredRef = useRef(false);
  const importLockRef = useRef(false);

  // Carica schede salvate
  useEffect(() => {
    try {
      const schedeData = localStorage.getItem('saved-schede');
      if (schedeData) {
        setSavedSchede(JSON.parse(schedeData));
      }
    } catch (e) {
      console.error('Errore caricamento schede:', e);
    }
  }, []);

  // Salva scheda
  const handleSaveScheda = () => {
    if (!schedaName.trim()) {
      toast.error('Inserisci un nome per la scheda');
      return;
    }

    const schedaData = {
      id: currentSchedaId || Date.now().toString(),
      name: schedaName,
      clientInfo,
      numWorkouts,
      duration,
      workouts,
      athleteId: athleteData?.id,
      athleteName: athleteName,
      createdAt: currentSchedaId ? savedSchede.find(s => s.id === currentSchedaId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedSchede;
    if (currentSchedaId) {
      // Modifica scheda esistente
      updatedSchede = savedSchede.map(s => s.id === currentSchedaId ? schedaData : s);
      toast.success('Scheda aggiornata con successo');
    } else {
      // Nuova scheda
      updatedSchede = [...savedSchede, schedaData];
      toast.success('Scheda salvata con successo');
    }

    setSavedSchede(updatedSchede);
    localStorage.setItem('saved-schede', JSON.stringify(updatedSchede));
    setCurrentSchedaId(schedaData.id);
    setShowSaveDialog(false);

    // Salva anche nello storico dell'atleta se presente
    if (athleteData?.id) {
      try {
        const workoutsKey = `athlete:${athleteData.id}:workouts`;
        const existingWorkouts = localStorage.getItem(workoutsKey);
        const workoutsList = existingWorkouts ? JSON.parse(existingWorkouts) : [];

        // Calcola tipi di stimolo e volume (semplificato)
        const stimulusTypes = [...new Set(workouts.flat().map(ex => ex.stimolo).filter(Boolean))];

        const historicalWorkout = {
          id: schedaData.id,
          name: schedaName,
          startDate: clientInfo.startDate || new Date().toISOString(),
          endDate: clientInfo.endDate || new Date().toISOString(),
          duration: duration,
          stimulusType: stimulusTypes,
          volumePerMuscleGroup: {},
          createdBy: 'Current Trainer',
          notes: clientInfo.block || '',
        };

        const updatedWorkouts = workoutsList.filter((w: any) => w.id !== schedaData.id);
        updatedWorkouts.push(historicalWorkout);
        localStorage.setItem(workoutsKey, JSON.stringify(updatedWorkouts));
      } catch (e) {
        console.error('Errore salvataggio storico atleta:', e);
      }
    }
  };

  // Apri scheda esistente
  const handleOpenScheda = (schedaId: string) => {
    const scheda = savedSchede.find(s => s.id === schedaId);
    if (!scheda) return;

    // Pulisci i placeholder "Esercizio X" dai workouts caricati
    const cleanedWorkouts = scheda.workouts.map((workout) =>
      workout.map((exercise) => ({
        ...exercise,
        exercise: cleanExercisePlaceholder(exercise.exercise || ""),
      }))
    );

    // Evita che l'effetto di auto-inizializzazione sovrascriva i dati appena caricati
    isRestoredRef.current = true;

    setClientInfo(scheda.clientInfo);
    setNumWorkouts(scheda.numWorkouts);
    setDuration(scheda.duration);
    setWorkouts(cleanedWorkouts);
    setCurrentSchedaId(scheda.id);
    setSchedaName(scheda.name);
    setIsNameDirty(true);
    setShowOpenDialog(false);
    toast.success(`Scheda "${scheda.name}" caricata`);
  };

  // Apri automaticamente una scheda specifica quando si arriva da AtletaDettaglio
  useEffect(() => {
    let idToOpen = (location.state as any)?.openSchedaId as string | undefined;
    if (!idToOpen) {
      try {
        const storedId = localStorage.getItem('schede:auto-open-id');
        if (storedId) {
          idToOpen = storedId;
        }
      } catch (error) {
        console.error('Impossibile leggere l\'ID della scheda da aprire automaticamente:', error);
      }
    }
    if (!idToOpen) return;
    if (savedSchede.length === 0) return;
    const exists = savedSchede.some(s => s.id === idToOpen);
    if (exists) {
      handleOpenScheda(idToOpen);
    }
    try {
      localStorage.removeItem('schede:auto-open-id');
    } catch (error) {
      console.error('Impossibile rimuovere l\'ID della scheda da aprire automaticamente:', error);
    }
    // Se non esiste nessuna scheda con quell'ID, non fare nulla
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSchede]);

  // Elimina scheda
  const handleDeleteScheda = () => {
    if (!schedaToDelete) return;

    const updatedSchede = savedSchede.filter(s => s.id !== schedaToDelete);
    setSavedSchede(updatedSchede);
    localStorage.setItem('saved-schede', JSON.stringify(updatedSchede));

    if (currentSchedaId === schedaToDelete) {
      setCurrentSchedaId(null);
      setSchedaName('');
    }

    setShowDeleteDialog(false);
    setSchedaToDelete(null);
    toast.success('Scheda eliminata');
  };

  // Nuova scheda
  const handleNewScheda = () => {
    let latestNotes = "";
    try {
      if (athleteData?.id) {
        const normalize = (s: any): string => String(s ?? "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const isMeaningful = (val: any): boolean => {
          const v = normalize(val);
          if (!v) return false;
          const bad = new Set(["nulla","bd","nulla di rilevante","-","n/a","na"]);
          return !bad.has(v);
        };
        const getFromRaw = (raw: Record<string, any> | undefined, keywords: string[]): string | undefined => {
          if (!raw) return undefined;
          const kw = keywords.map(normalize);
          for (const [k,v] of Object.entries(raw)) {
            const nk = normalize(k);
            if (kw.every(w => nk.includes(w))) {
              const val = typeof v === 'string' ? v : String(v ?? '');
              if (isMeaningful(val)) return val.trim();
            }
          }
          return undefined;
        };
        const raw = localStorage.getItem(`athlete:${athleteData.id}:stress`);
        if (raw) {
          const arr: any[] = JSON.parse(raw) || [];
          const sorted = arr.filter(x => x && x.date && !isNaN(new Date(x.date).getTime()))
                            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const last = sorted[0];
          if (last) {
            const lines: string[] = [];
            const v1 = getFromRaw(last.rawData, ['prossimo','programma','allenamenti','settimanali']);
            if (isMeaningful(v1)) lines.push(`1) NEL PROSSIMO PROGRAMMA HAI ESIGENZE SPECIFICHE SUL NUMERO DI ALLENAMENTI SETTIMANALI?: ${v1}`);
            const nWorkout = getFromRaw(last.rawData, ['note','aggiuntive','workout']);
            if (isMeaningful(nWorkout)) lines.push(`Note aggiuntive Workout: ${nWorkout}`);
            const nSalute = getFromRaw(last.rawData, ['note','aggiuntive','salute']) || getFromRaw(last.rawData, ['note','aggiuntive','alimentazione']);
            if (isMeaningful(nSalute)) lines.push(`Note aggiuntive Salute e Alimentazione: ${nSalute}`);
              const toOneLine2 = (s: string) => s.replace(/\s*\r?\n\s*/g, ' ').trim();
              const nGenerali = getFromRaw(last.rawData, ['note','aggiuntive','generali']) || last.noteOsservazioni;
              if (isMeaningful(nGenerali)) lines.push(`2) Note aggiuntive Generali: ${toOneLine2(String(nGenerali))}`);
            latestNotes = lines.join("\n");
          }
        }
      }
    } catch {}

    setClientInfo({
      lastname: athleteData?.lastname || "",
      firstname: athleteData?.firstname || "",
      startDate: "",
      endDate: "",
      block: "",
      notes: latestNotes,
    });
    setNumWorkouts(0);
    setDuration(4);
    setWorkouts([]);
    setCurrentSchedaId(null);
    setSchedaName('');
    setIsNameDirty(false);
    toast.success('Nuova scheda creata');
  };

  // Hydrate saved draft on mount or load athlete data
  useEffect(() => {
    // Se arriva dalla pagina atleta, carica i dati dell'atleta
    if (athleteData) {
      const normalize = (s: any): string =>
        String(s ?? "")
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

      const isMeaningful = (val: any): boolean => {
        const v = normalize(val);
        if (!v) return false;
        const bad = new Set([
          "nulla",
          "bd",
          "nulla di rilevante",
          "-",
          "n/a",
          "na",
        ]);
        return !bad.has(v);
      };

      const getFromRaw = (raw: Record<string, any> | undefined, keywords: string[]): string | undefined => {
        if (!raw) return undefined;
        const kw = keywords.map(normalize);
        for (const [k, v] of Object.entries(raw)) {
          const nk = normalize(k);
          if (kw.every(w => nk.includes(w))) {
            const val = typeof v === 'string' ? v : String(v ?? '');
            if (isMeaningful(val)) return val.trim();
          }
        }
        return undefined;
      };

      // Estrai ultimo inserimento (cronologicamente) dai dati stress salvati
      let latestNotes = "";
      try {
        if (athleteData.id) {
          const key = `athlete:${athleteData.id}:stress`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const arr: any[] = JSON.parse(raw) || [];
            const sorted = arr
              .filter(x => x && x.date && !isNaN(new Date(x.date).getTime()))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const last = sorted[0];
            if (last) {
              const lines: string[] = [];
              const v1 = getFromRaw(last.rawData, [
                'prossimo','programma','allenamenti','settimanali'
              ]);
              if (isMeaningful(v1)) lines.push(`1) NEL PROSSIMO PROGRAMMA HAI ESIGENZE SPECIFICHE SUL NUMERO DI ALLENAMENTI SETTIMANALI?: ${v1}`);

              // Note aggiuntive (sezione 5)
              const nWorkout = getFromRaw(last.rawData, ['note','aggiuntive','workout']);
              if (isMeaningful(nWorkout)) lines.push(`Note aggiuntive Workout: ${nWorkout}`);

              const nSalute = getFromRaw(last.rawData, ['note','aggiuntive','salute'])
                || getFromRaw(last.rawData, ['note','aggiuntive','alimentazione']);
              if (isMeaningful(nSalute)) lines.push(`Note aggiuntive Salute e Alimentazione: ${nSalute}`);

              const toOneLine = (s: string) => s.replace(/\s*\r?\n\s*/g, ' ').trim();
              const nGenerali = getFromRaw(last.rawData, ['note','aggiuntive','generali']) || last.noteOsservazioni;
              if (isMeaningful(nGenerali)) lines.push(`2) Note aggiuntive Generali: ${toOneLine(String(nGenerali))}`);
              
              latestNotes = lines.join("\n");
            }
          }
        }
      } catch {}

      setClientInfo({
        lastname: athleteData.lastname || "",
        firstname: athleteData.firstname || "",
        startDate: "",
        endDate: "",
        block: "",
        notes: latestNotes,
      });
      return;
    }

    // Altrimenti carica dalla bozza salvata
    try {
      const raw = localStorage.getItem("schede:draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed) return;
      if (typeof parsed.duration === "number") setDuration(parsed.duration);
      if (typeof parsed.numWorkouts === "number") setNumWorkouts(parsed.numWorkouts);
      if (parsed.clientInfo) setClientInfo(parsed.clientInfo);
      if (parsed.workouts) {
        // Pulisci i placeholder "Esercizio X" dai workouts caricati
        const cleanedWorkouts = parsed.workouts.map((workout: WorkoutExercise[]) =>
          workout.map((exercise: WorkoutExercise) => ({
            ...exercise,
            exercise: cleanExercisePlaceholder(exercise.exercise || ""),
          }))
        );
        setWorkouts(cleanedWorkouts);
      }
      // mark that we restored from storage so effects don't overwrite
      isRestoredRef.current = true;
    } catch (e) {
      // ignore parse errors
    }
  }, [athleteData]);

  // Auto-save draft whenever key state changes
  useEffect(() => {
    try {
      const payload = { numWorkouts, duration, clientInfo, workouts };
      localStorage.setItem("schede:draft", JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors (e.g., quota)
    }
  }, [numWorkouts, duration, clientInfo, workouts]);

  // Ensure we persist the latest draft on unmount as a safety net
  useEffect(() => {
    return () => {
      try {
        const payload = { numWorkouts, duration, clientInfo, workouts };

  // Sincronizza automaticamente il campo 'Nome Scheda' con 'Blocco programmazione'
  useEffect(() => {
    if (!isNameDirty) {
      setSchedaName(clientInfo.block || "");
    }
  }, [clientInfo.block, isNameDirty]);

        localStorage.setItem("schede:draft", JSON.stringify(payload));
      } catch (e) {
        // ignore
      }
    };
  }, [numWorkouts, duration, clientInfo, workouts]);

  // Funzione helper per pulire i valori placeholder "Esercizio X"
  const cleanExercisePlaceholder = (value: string): string => {
    return /^Esercizio \d+$/.test(value) ? "" : value;
  };

  const createEmptyExercise = useCallback((): WorkoutExercise => ({
    type: "",
    progression: "",
    muscle: "",
    exercise: "",
    technique: "",
    weeks: Array.from({ length: duration }, () => ({ set: "", reps: "", info: "" })),
    rest: "",
    note: "",
    groupType: undefined,
    isGroupHead: false,
    isGroupChild: false,
    groupId: undefined,
    childIndex: undefined,
  }), [duration]);

  useEffect(() => {
    // if we're currently importing, skip the auto-initialize which would overwrite imported data
    if (importLockRef.current) {
      importLockRef.current = false; // reset lock and skip one init
      return;
    }
    // if we restored from localStorage on mount, skip initial auto-initialize to preserve restored workouts
    if (isRestoredRef.current) {
      // reset the flag so future numWorkouts changes still trigger initialization
      isRestoredRef.current = false;
      return;
    }
    if (numWorkouts === 0) {
      setWorkouts([]);
      return;
    }
    const initialWorkouts = Array.from({ length: numWorkouts }, () => [createEmptyExercise()]);
    setWorkouts(initialWorkouts);
  }, [numWorkouts, createEmptyExercise]);

  // Import payload exported from Template Split
  useEffect(() => {
    try {
      const raw = localStorage.getItem("importedSplit");
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload) return;
      // remove it immediately to avoid double-imports
      localStorage.removeItem("importedSplit");

      const days = Number(payload.numDays) || 1;
      // determine imported duration from payload or from exercises weeks when available
      const flatExercises: any[] = payload.exercises || [];
      let importedDuration: number | undefined = undefined;
      if (typeof payload.duration === 'number' && payload.duration > 0) importedDuration = payload.duration;
      else {
        const maxWeeks = flatExercises.reduce((m, e) => Math.max(m, (e?.weeks?.length) || 0), 0);
        if (maxWeeks > 0) importedDuration = maxWeeks;
      }

      // Merge with existing schede draft (if any) to avoid wiping user's current work
      importLockRef.current = true;
      // load existing draft if available
      let existingRaw = null;
      try {
        existingRaw = localStorage.getItem("schede:draft");
      } catch (e) {
        existingRaw = null;
      }

      let existingWorkouts: WorkoutExercise[][] | null = null;
      let existingNumWorkouts: number | null = null;
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          if (parsed && Array.isArray(parsed.workouts)) existingWorkouts = parsed.workouts;
          if (parsed && typeof parsed.numWorkouts === 'number') existingNumWorkouts = parsed.numWorkouts;
        } catch (e) {
          existingWorkouts = null;
          existingNumWorkouts = null;
        }
      }

      // compute target number of days (keep existing if present)
      const targetDays = existingNumWorkouts && existingNumWorkouts > 0 ? existingNumWorkouts : days;
      const mergedWorkouts: WorkoutExercise[][] = Array.from({ length: Math.max(targetDays, days) }, (_, i) => {
        return (existingWorkouts && existingWorkouts[i]) ? [...existingWorkouts[i]] : [];
      });

      flatExercises.forEach((ex, idx) => {
        let dayIndex = 0;
        if (typeof ex.day === 'number') {
          dayIndex = Math.max(0, Math.min(days - 1, ex.day - 1));
        } else {
          dayIndex = idx % days;
        }

        const weeksArr = ex.weeks && Array.isArray(ex.weeks)
          ? ex.weeks
          : Array.from({ length: importedDuration || duration }, () => ({ set: "", reps: "", info: "" }));

        // Pulisci i valori placeholder "Esercizio X"
        const exerciseValue = ex.exercise || ex.name || "";
        const cleanExercise = /^Esercizio \d+$/.test(exerciseValue) ? "" : exerciseValue;

        const mapped: WorkoutExercise = {
          type: ex.exerciseType || ex.type || "",
          progression: ex.progression || "",
          muscle: ex.muscleGroup || ex.muscle || "",
          exercise: cleanExercise,
          stimolo: ex.stimuloTecnica || ex.stimolo || "",
          technicalNote: ex.technicalNote || ex.note || "",
          technique: ex.technique || "",
          weeks: weeksArr,
          rest: ex.rest || "",
          note: ex.note || "",
          groupType: ex.groupType,
          isGroupHead: !!ex.isGroupHead,
          isGroupChild: !!ex.isGroupChild,
          groupId: ex.groupId,
          childIndex: ex.childIndex,
        };

        // ensure mergedWorkouts has enough days
        if (dayIndex >= mergedWorkouts.length) {
          for (let i = mergedWorkouts.length; i <= dayIndex; i++) mergedWorkouts.push([]);
        }
        mergedWorkouts[dayIndex].push(mapped);
      });

      // debug: log imported structure and merged result
      // eslint-disable-next-line no-console
      console.log("[Schede] importedSplit -> days:", days, "importedDuration:", importedDuration, "mergedWorkouts:", mergedWorkouts);

      // if there was an existing numWorkouts, preserve it, otherwise use imported days
      const finalNumWorkouts = existingNumWorkouts && existingNumWorkouts > 0 ? existingNumWorkouts : days;
      setNumWorkouts(finalNumWorkouts);
      if (importedDuration) setDuration(importedDuration);
      setWorkouts(mergedWorkouts);
      toast.success("Split importato in Gestione Schede");
    } catch (e) {
      // ignore import errors
      console.error("Import error:", e);
    }
  }, []);

  // Aggiorna il numero di settimane quando cambia la durata
  useEffect(() => {
    setWorkouts((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((workout) =>
        workout.map((exercise) => ({
          ...exercise,
          weeks: Array.from({ length: duration }, (_, i) => exercise.weeks[i] || { set: "", reps: "", info: "" }),
        }))
      );
    });
  }, [duration]);

  

  const addExercise = (workoutIndex: number) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].push(createEmptyExercise());
    setWorkouts(newWorkouts);
  };

  const copyExercise = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    const exerciseToCopy = newWorkouts[workoutIndex][exerciseIndex];
    // Crea una copia profonda dell'esercizio
    const copiedExercise = JSON.parse(JSON.stringify(exerciseToCopy));
    // Inserisci la copia dopo l'esercizio corrente
    newWorkouts[workoutIndex].splice(exerciseIndex + 1, 0, copiedExercise);
    setWorkouts(newWorkouts);
  };

  const openCopyWorkoutDialog = (workoutIndex: number) => {
    setSourceWorkoutIndex(workoutIndex);
    // Inizializza array di selezione (false per tutti i workout tranne quello sorgente)
    setSelectedWorkouts(Array(numWorkouts).fill(false));
    setShowCopyWorkoutDialog(true);
  };

  const confirmCopyWorkout = () => {
    if (sourceWorkoutIndex === null) return;

    const newWorkouts = [...workouts];
    const workoutToCopy = newWorkouts[sourceWorkoutIndex];

    // Copia il workout nei workout selezionati
    selectedWorkouts.forEach((isSelected, targetIndex) => {
      if (isSelected && targetIndex !== sourceWorkoutIndex) {
        // Crea una copia profonda del workout
        const copiedWorkout = JSON.parse(JSON.stringify(workoutToCopy));
        newWorkouts[targetIndex] = copiedWorkout;
      }
    });

    setWorkouts(newWorkouts);
    setShowCopyWorkoutDialog(false);
    setSourceWorkoutIndex(null);
    setSelectedWorkouts([]);
  };

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].splice(exerciseIndex, 1);
    setWorkouts(newWorkouts);
  };

  const updateExercise = (
    workoutIndex: number,
    exerciseIndex: number,
    field: keyof WorkoutExercise,
    value: unknown
  ) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex][exerciseIndex] = {
      ...newWorkouts[workoutIndex][exerciseIndex],
      // assign with type assertion; caller should pass correct type
      [field]: value as WorkoutExercise[typeof field],
    };
    setWorkouts(newWorkouts);
  };

  const applyProgression = (workoutIndex: number, exerciseIndex: number, progressionName: string) => {
    const progression = progressions.find(p => p.name === progressionName);
    if (!progression) return;

    const newWorkouts = [...workouts];
    const exercise = newWorkouts[workoutIndex][exerciseIndex];
    
    exercise.progression = progressionName;
    exercise.weeks = progression.weeks.slice(0, duration).map(w => ({
      set: w.set || "",
      reps: w.reps || "",
      info: w.info || "",
    }));
    exercise.rest = progression.rest || "";
    exercise.note = progression.note || "";
    
    // Propaga i set ai figli se è un capo gruppo
    if (exercise.isGroupHead) {
      propagateSetsToChildren(workoutIndex, exerciseIndex);
    }
    
    setWorkouts(newWorkouts);
  };

  // Gestisce la selezione del tipo di esercizio avanzato (Superset, Triset, ecc.)
  const handleAdvancedTypeChange = (workoutIndex: number, exerciseIndex: number, advancedType: string) => {
    const config = EXERCISE_GROUP_CONFIG[advancedType] || EXERCISE_GROUP_CONFIG["Single set"];
    const newWorkouts = [...workouts];
    const exercise = newWorkouts[workoutIndex][exerciseIndex];

    // Se è Single set o nessun tipo, rimuovi il gruppo
    if (config.childCount === 0) {
      // Rimuovi tutti i figli del gruppo se esistono
      if (exercise.groupId) {
        newWorkouts[workoutIndex] = newWorkouts[workoutIndex].filter(
          (ex) => ex.groupId !== exercise.groupId || ex === exercise
        );
      }
      exercise.groupType = undefined;
      exercise.isGroupHead = false;
      exercise.groupId = undefined;
      setWorkouts(newWorkouts);
      return;
    }

    // Crea o aggiorna il gruppo
    const groupId = exercise.groupId || `group-${Date.now()}-${Math.random()}`;
    exercise.groupType = advancedType;
    exercise.isGroupHead = true;
    exercise.groupId = groupId;

    // Trova gli esercizi figli esistenti
    const existingChildren = newWorkouts[workoutIndex].filter(
      (ex) => ex.groupId === groupId && ex.isGroupChild
    );

    const diff = config.childCount - existingChildren.length;

    if (diff > 0) {
      // Aggiungi nuovi figli
      const insertIndex = exerciseIndex + 1 + existingChildren.length;
      for (let i = 0; i < diff; i++) {
        const childExercise = createEmptyExercise();
        childExercise.groupType = advancedType;
        childExercise.isGroupChild = true;
        childExercise.groupId = groupId;
        childExercise.childIndex = existingChildren.length + i;
        newWorkouts[workoutIndex].splice(insertIndex + i, 0, childExercise);
      }
    } else if (diff < 0) {
      // Rimuovi figli in eccesso
      const childrenToRemove = existingChildren.slice(config.childCount);
      newWorkouts[workoutIndex] = newWorkouts[workoutIndex].filter(
        (ex) => !childrenToRemove.includes(ex)
      );
    }

    // Aggiorna gli indici dei figli rimanenti
    newWorkouts[workoutIndex]
      .filter((ex) => ex.groupId === groupId && ex.isGroupChild)
      .forEach((child, idx) => {
        child.childIndex = idx;
      });

    setWorkouts(newWorkouts);
  };

  // Propaga i valori dei set dal capo gruppo ai figli
  const propagateSetsToChildren = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    const headExercise = newWorkouts[workoutIndex][exerciseIndex];

    if (!headExercise.isGroupHead || !headExercise.groupId) return;

    const children = newWorkouts[workoutIndex].filter(
      (ex) => ex.groupId === headExercise.groupId && ex.isGroupChild
    );

    children.forEach((child) => {
      child.weeks = child.weeks.map((week, weekIndex) => ({
        ...week,
        set: week.set || headExercise.weeks[weekIndex]?.set || "",
      }));
    });

    setWorkouts(newWorkouts);
  };

  // Funzione helper per ottenere la lettera dell'esercizio nel gruppo
  const getExerciseLetter = (exercise: WorkoutExercise): string => {
    if (exercise.isGroupHead) return "A";
    if (exercise.isGroupChild && exercise.childIndex !== undefined) {
      return String.fromCharCode(66 + exercise.childIndex); // B, C, D, ...
    }
    return "";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {athleteName ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/atleti">Atleti</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/atleti/${athleteData?.id}`}>{athleteName}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Gestione Schede</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>Gestione Schede</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold tracking-tight">Gestione Schede</h1>
        <p className="text-muted-foreground mt-1">Crea e gestisci le schede di allenamento personalizzate</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-primary to-secondary"
          onClick={() => {
            if (currentSchedaId && schedaName) {
              // Se è già salvata con nome, salva direttamente
              handleSaveScheda();
            } else {
              // Altrimenti apri dialog
              if (!isNameDirty) {
                setSchedaName(clientInfo.block || "");
              }
              setShowSaveDialog(true);
            }
          }}
        >
          <Save className="h-4 w-4" />
          {currentSchedaId ? 'Salva Modifiche' : 'Salva'}
        </Button>

        <Button variant="outline" className="gap-2" onClick={() => setShowOpenDialog(true)}>
          <FolderOpen className="h-4 w-4" />
          Apri
        </Button>

        {currentSchedaId && (
          <Button variant="outline" className="gap-2" onClick={() => { if (!isNameDirty) { setSchedaName(clientInfo.block || ""); } setShowSaveDialog(true); }}>
            <Edit className="h-4 w-4" />
            Salva Come...
          </Button>
        )}

        <Button variant="outline" className="gap-2" onClick={handleNewScheda}>
          Nuova Scheda
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Calcola volume
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowPrintPreview(true)}>
          <Printer className="h-4 w-4" />
          Stampa
        </Button>
        {/* Template Split navigation button (added) */}
        <TemplateSplitButton />
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            if (numWorkouts === 0 || workouts.length === 0) {
              toast.error('Nessuna scheda da esportare');
              return;
            }
            try {
              generateLogbookPDF(clientInfo, workouts, duration);
              toast.success('Logbook PDF generato con successo');
            } catch (error) {
              console.error('Errore durante la generazione del PDF:', error);
              toast.error('Errore durante la generazione del PDF');
            }
          }}
        >
          <FileText className="h-4 w-4" />
          Logbook PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prima riga: Cognome, Nome, Data Inizio (metà), Durata programmazione (metà), Data Fine (metà), Workout settimanali (metà), Blocco programmazione */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6 lg:col-span-2 space-y-2">
              <Label htmlFor="lastname">Cognome</Label>
              <Input
                id="lastname"
                value={clientInfo.lastname}
                onChange={(e) => setClientInfo({ ...clientInfo, lastname: e.target.value })}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2 space-y-2">
              <Label htmlFor="firstname">Nome</Label>
              <Input
                id="firstname"
                value={clientInfo.firstname}
                onChange={(e) => setClientInfo({ ...clientInfo, firstname: e.target.value })}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-1 space-y-2">
              <Label htmlFor="startDate">Data Inizio</Label>
              <Input
                id="startDate"
                type="date"
                className="text-white"
                value={clientInfo.startDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  setClientInfo({ ...clientInfo, startDate });

                  // Calcola automaticamente data fine se c'è una durata
                  if (startDate && duration > 0) {
                    const start = new Date(startDate);
                    const endDate = new Date(start);
                    endDate.setDate(endDate.getDate() + (duration * 7));

                    const formattedEndDate = endDate.toISOString().split('T')[0];
                    setClientInfo((prev) => ({ ...prev, endDate: formattedEndDate }));
                  }
                }}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-1 space-y-2">
              <Label htmlFor="duration">Durata</Label>
              <Select
                value={duration.toString()}
                onValueChange={(v) => {
                  const weeks = parseInt(v);
                  setDuration(weeks);

                  // Calcola automaticamente data fine se c'è una data inizio
                  if (clientInfo.startDate) {
                    const startDate = new Date(clientInfo.startDate);
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + (weeks * 7));

                    // Formatta la data in formato YYYY-MM-DD per l'input date
                    const formattedEndDate = endDate.toISOString().split('T')[0];
                    setClientInfo({ ...clientInfo, endDate: formattedEndDate });
                  }
                }}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} settiman{n === 1 ? "a" : "e"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-1 space-y-2">
              <Label htmlFor="endDate">Data Fine</Label>
              <Input
                id="endDate"
                type="date"
                className="text-white"
                value={clientInfo.endDate}
                onChange={(e) => setClientInfo({ ...clientInfo, endDate: e.target.value })}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-1 space-y-2">
              <Label htmlFor="workouts">Workout settimanali</Label>
              <Select value={numWorkouts === 0 ? "" : numWorkouts.toString()} onValueChange={(v) => setNumWorkouts(parseInt(v))}>
                <SelectTrigger id="workouts">
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} Workout
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-2">
              <Label htmlFor="block">Blocco programmazione</Label>
              <Input
                id="block"
                value={clientInfo.block}
                onChange={(e) => setClientInfo({ ...clientInfo, block: e.target.value })}
              />
            </div>
          </div>

          {/* Seconda riga: Note per il workout */}
          <div className="space-y-2">
            <Label htmlFor="workoutNotes">NOTE PER IL WORKOUT</Label>
              <Textarea
                className="break-normal"
                id="workoutNotes"
                value={clientInfo.notes || ''}
                onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                placeholder="Inserisci note, istruzioni o osservazioni per questo workout..."
                rows={3}
                style={{
                  textAlign: 'justify',
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                  textJustify: 'inter-word' as any,
                }}
                autoResize
              />
          </div>
        </CardContent>
      </Card>

      {numWorkouts > 0 && workouts.map((workout, workoutIndex) => (
        <Card key={workoutIndex}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Workout {String.fromCharCode(65 + workoutIndex)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCopyWorkoutDialog(workoutIndex)}
              >
                Copia Workout
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workout.map((exercise, exerciseIndex) => {
              const config = exercise.groupType ? EXERCISE_GROUP_CONFIG[exercise.groupType] : null;
              const exerciseLetter = getExerciseLetter(exercise);
              const isPartOfGroup = exercise.isGroupHead || exercise.isGroupChild;

              return (
                <>
                  <div key={exerciseIndex}>
                    {/* Titolo del gruppo (solo per il capo gruppo) */}
                    {exercise.isGroupHead && config && (
                      <div
                        className="p-2 font-semibold text-sm rounded-t-lg border-l-4"
                        style={{
                          backgroundColor: config.bg,
                          borderLeftColor: config.border,
                        }}
                      >
                        {config.label} A-{String.fromCharCode(65 + config.childCount)}
                      </div>
                    )}

                    <div
                      className="space-y-3 p-4 border rounded-lg"
                      style={
                        isPartOfGroup && config
                          ? {
                              backgroundColor: config.bg,
                              borderLeft: `4px solid ${config.border}`,
                            }
                          : {}
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {config && (
                            <span
                              className="px-2 py-1 text-xs font-bold rounded"
                              style={{
                                backgroundColor: config.border,
                                color: "white",
                              }}
                            >
                              {config.badge}
                            </span>
                          )}
                          <div className="w-full text-center">
                            <h4 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              Esercizio {exerciseIndex + 1}
                              {exerciseLetter && ` (${exerciseLetter})`}
                            </h4>
                            {exercise.isGroupHead && (
                              <p className="text-xs text-muted-foreground">capo gruppo</p>
                            )}
                            {exercise.isGroupChild && (
                              <p className="text-xs text-muted-foreground">con esercizio sopra</p>
                            )}
                          </div>
                        </div>
                        {workout.length > 1 && !exercise.isGroupChild && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      {/* First row (4 columns): Distretto, Ruolo, Stimolo, Tipo esercizio (NOTE TECH occupies 2 rows) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label>Distretto - Pattern Motorio - Prehab/Mobilità</Label>
                          <MuscleSelect
                            value={exercise.muscle}
                            onChange={(v: string) => updateExercise(workoutIndex, exerciseIndex, "muscle", v)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Ruolo esercizio</Label>
                          <Select
                            value={exercise.type}
                            onValueChange={(v) => updateExercise(workoutIndex, exerciseIndex, "type", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXERCISE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Stimolo - Tecnica</Label>
                          <StimoloSelect value={exercise.stimolo || ""} onChange={(v) => updateExercise(workoutIndex, exerciseIndex, "stimolo", v)} />
                        </div>

                        <div className="space-y-2">
                          {/* Tipo esercizio shown only for head */}
                          {!exercise.isGroupChild ? (
                            <>
                              <Label>Tipo esercizio</Label>
                              <Select
                                value={exercise.groupType || "Single set"}
                                onValueChange={(v) => handleAdvancedTypeChange(workoutIndex, exerciseIndex, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Single set" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ADVANCED_EXERCISE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          ) : (
                            <div />
                          )}
                        </div>
                        
                      </div>

                      {/* Second row: Progressione, Esercizio, NOTE TECNICHE ESERCIZIO */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        <div className="space-y-2">
                          <Label>Progressione</Label>
                          <ProgressionSelect
                            value={exercise.progression}
                            onChange={(v) => applyProgression(workoutIndex, exerciseIndex, v)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Esercizio</Label>
                          <ExerciseSelect
                            value={exercise.exercise}
                            onChange={(v) => updateExercise(workoutIndex, exerciseIndex, "exercise", v)}
                            placeholder={`Esercizio ${exerciseIndex + 1}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Note Tecniche Esercizio</Label>
                          <Textarea
                            value={exercise.technicalNote || ""}
                            onChange={(e) => updateExercise(workoutIndex, exerciseIndex, "technicalNote", (e.target as HTMLTextAreaElement).value)}
                            placeholder="Note tecniche dettagliate"
                            rows={4}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm">Settimane</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {exercise.weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                              <div className="font-medium text-xs text-muted-foreground">
                                Week {weekIndex + 1}
                              </div>
                              <div className="space-y-2">
                                 <Input
                                  placeholder="Set"
                                  value={week.set}
                                  onChange={(e) => {
                                    const newWeeks = [...exercise.weeks];
                                    newWeeks[weekIndex].set = e.target.value;
                                    updateExercise(workoutIndex, exerciseIndex, "weeks", newWeeks);
                                    // Propaga i set ai figli se è capo gruppo
                                    if (exercise.isGroupHead) {
                                      propagateSetsToChildren(workoutIndex, exerciseIndex);
                                    }
                                  }}
                                  className="h-8 text-xs w-16"
                                  maxLength={2}
                                  disabled={exercise.isGroupChild}
                                />
                                <Input
                                  placeholder="Reps"
                                  value={week.reps}
                                  onChange={(e) => {
                                    const newWeeks = [...exercise.weeks];
                                    newWeeks[weekIndex].reps = e.target.value;
                                    updateExercise(workoutIndex, exerciseIndex, "weeks", newWeeks);
                                  }}
                                  className="h-8 text-xs"
                                />
                                <Input
                                  placeholder="Info"
                                  value={week.info}
                                  onChange={(e) => {
                                    const newWeeks = [...exercise.weeks];
                                    newWeeks[weekIndex].info = e.target.value;
                                    updateExercise(workoutIndex, exerciseIndex, "weeks", newWeeks);
                                  }}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label>Rest</Label>
                          <Input
                            value={exercise.rest}
                            onChange={(e) => updateExercise(workoutIndex, exerciseIndex, "rest", e.target.value)}
                            placeholder="Es: 90-120 sec"
                            className="w-32"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Note</Label>
                          <Textarea
                            value={exercise.note}
                            onChange={(e) => updateExercise(workoutIndex, exerciseIndex, "note", e.target.value)}
                            placeholder="Note aggiuntive"
                            rows={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Pulsanti Aggiungi e Copia Esercizio */}
                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExercise(workoutIndex, exerciseIndex)}
                        >
                          Copia esercizio
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExercise(workoutIndex)}
                        >
                          Aggiungi esercizio
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Dialog Copia Workout */}
      <Dialog open={showCopyWorkoutDialog} onOpenChange={setShowCopyWorkoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Copia Workout {sourceWorkoutIndex !== null ? String.fromCharCode(65 + sourceWorkoutIndex) : ''}
            </DialogTitle>
            <DialogDescription>
              Seleziona i workout in cui copiare gli esercizi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {Array.from({ length: numWorkouts }, (_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`workout-${index}`}
                  checked={selectedWorkouts[index] || false}
                  disabled={index === sourceWorkoutIndex}
                  onChange={(e) => {
                    const newSelected = [...selectedWorkouts];
                    newSelected[index] = e.target.checked;
                    setSelectedWorkouts(newSelected);
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor={`workout-${index}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    index === sourceWorkoutIndex ? 'text-muted-foreground' : ''
                  }`}
                >
                  Workout {String.fromCharCode(65 + index)}
                  {index === sourceWorkoutIndex && ' (originale)'}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyWorkoutDialog(false)}>
              Annulla
            </Button>
            <Button onClick={confirmCopyWorkout}>
              Copia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Salva Scheda */}
      <Dialog
        open={showSaveDialog}
        onOpenChange={(open) => {
          if (open && !isNameDirty) {
            setSchedaName(clientInfo.block || "");
          }
          setShowSaveDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentSchedaId ? 'Salva Scheda Come...' : 'Salva Scheda'}</DialogTitle>
            <DialogDescription>
              Inserisci un nome per identificare questa scheda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedaName">Nome Scheda</Label>
              <Input
                id="schedaName"
                value={schedaName}
                onChange={(e) => { setSchedaName(e.target.value); setIsNameDirty(true); }}
                placeholder="Es: Ipertrofia Upper Lower 4x/week"
              />
            </div>
            {athleteName && (
              <p className="text-sm text-muted-foreground">
                Atleta: <strong>{athleteName}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveScheda} className="bg-gradient-to-r from-primary to-secondary">
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Apri Scheda */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apri Scheda Salvata</DialogTitle>
            <DialogDescription>
              Seleziona una scheda da caricare
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {savedSchede.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessuna scheda salvata
              </p>
            ) : (
              savedSchede.map((scheda) => (
                <Card
                  key={scheda.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleOpenScheda(scheda.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{scheda.name}</h4>
                        {scheda.athleteName && (
                          <p className="text-sm text-muted-foreground">
                            Atleta: {scheda.athleteName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {scheda.numWorkouts} workout × {scheda.duration} settimane
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Creata: {new Date(scheda.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedaToDelete(scheda.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Elimina Scheda */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa scheda? L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSchedaToDelete(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScheda}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {showPrintPreview && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'white', zIndex: 9999, overflow: 'auto' }}>
          <PrintableScheda
            clientInfo={clientInfo}
            workouts={workouts}
            duration={duration}
            onClose={() => setShowPrintPreview(false)}
          />
        </div>
      )}

    </div>
  );
}




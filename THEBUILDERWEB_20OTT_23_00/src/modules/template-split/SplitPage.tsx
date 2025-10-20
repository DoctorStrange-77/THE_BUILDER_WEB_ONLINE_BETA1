import React, { useState, useEffect } from "react";
import { VolumeBar } from "./components/VolumeBar";
import { TrainingGrid } from "./components/TrainingGrid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SplitDialog from "./components/SplitDialog";
import SaveSplitDialog from "./components/SaveSplitDialog";
import ResetConfirmDialog from "./components/ResetConfirmDialog";
import CenteredAlertDialog from "./components/CenteredAlertDialog";
import DeleteSplitConfirmDialog from "./components/DeleteSplitConfirmDialog";
import ConfirmOverwriteDialog from "./components/ConfirmOverwriteDialog";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SplitPage: React.FC = () => {
  const location = useLocation();
  const breadcrumbState = (location.state as any)?.breadcrumb;
  const [exercises, setExercises] = useState<any[]>([]);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [numDays, setNumDays] = useState<number>(7);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [currentSplitName, setCurrentSplitName] = useState<string>("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOverwriteConfirmOpen, setIsOverwriteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const volumeData = exercises.reduce((acc: Record<string, number>, exercise: any) => {
    if ((exercise.muscleGroup || "").toUpperCase() === "ATTIVAZIONE") return acc;
    acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddExercise = (exercise: any) => {
    // If exercise contains a groupType that requires child exercises, expand it
    try {
      const { EXERCISE_GROUP_CONFIG } = require("./types/training") as any;
      const cfg = EXERCISE_GROUP_CONFIG?.[exercise.groupType];
      if (cfg && cfg.childCount > 0) {
        const groupId = `group-${Date.now()}-${Math.random()}`;
        // head
        const head = { ...exercise, id: `ex-${Date.now()}-${Math.random()}`, groupType: exercise.groupType, groupId, isGroupHead: true };
        // children
        const children = Array.from({ length: cfg.childCount }).map((_, idx) => ({ ...exercise, id: `ex-${Date.now()}-${Math.random()}-${idx}`, groupType: exercise.groupType, groupId, isGroupChild: true, childIndex: idx }));
        setExercises((prev) => [...prev, head, ...children]);
        toast.success("Esercizio di gruppo aggiunto con successo!");
        return;
      }
    } catch (e) {
      // fallback: just add single
    }
    const newExercise = { ...exercise, id: `ex-${Date.now()}-${Math.random()}` };
    setExercises((prev) => [...prev, newExercise]);
    toast.success("Esercizio aggiunto con successo!");
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
    toast.success("Esercizio eliminato");
  };

  const handleUpdateExercise = (exercise: any) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exercise.id ? exercise : ex)));
    toast.success("Esercizio aggiornato");
  };

  const handleReset = () => {
    setIsResetDialogOpen(true);
  };

  const handleDoReset = () => {
    setExercises([]);
    setNotes({});
    setCurrentSplitName("");
    setNumDays(7);
    setIsResetDialogOpen(false);
    toast.success("Blocco resettato");
  };

  const handleSaveSplit = () => setIsSaveDialogOpen(true);

  const handleDoSave = (name: string) => {
    const key = name.trim() || `split-${new Date().toISOString()}`;
    try {
      const stored = JSON.parse(localStorage.getItem("savedSplits") || "{}");
      if (stored[key]) {
        setAlertMessage("Nome split già presente. Inserisci un nome diverso.");
        setIsAlertOpen(true);
        return false;
      }
      stored[key] = { savedAt: Date.now(), exercises, notes, numDays };
      localStorage.setItem("savedSplits", JSON.stringify(stored));
      toast.success(`Split salvato come: ${key}`);
      setCurrentSplitName(key);
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Impossibile salvare lo split");
      return false;
    }
  };

  // Hydrate draft when component mounts so navigating away/back preserves work
  useEffect(() => {
    try {
      const raw = localStorage.getItem("split:draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed) return;
      if (Array.isArray(parsed.exercises)) setExercises(parsed.exercises);
      if (parsed.notes) setNotes(parsed.notes);
      if (typeof parsed.numDays === 'number') setNumDays(parsed.numDays);
      if (typeof parsed.name === 'string') setCurrentSplitName(parsed.name);
      // notify user non-intrusively
      // toast.success("Ripristinata bozza split salvata");
    } catch (e) {
      // ignore
    }
  }, []);

  // Autosave draft whenever key state changes
  useEffect(() => {
    try {
      const payload = { exercises, notes, numDays, name: currentSplitName };
      localStorage.setItem("split:draft", JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors
    }
  }, [exercises, notes, numDays, currentSplitName]);

  const handleRestoreSplit = (payload: any) => {
    setExercises(payload.exercises || []);
    if (payload.notes) setNotes(payload.notes);
    if (payload.numDays) setNumDays(payload.numDays);
    if (payload.name) setCurrentSplitName(payload.name);
    toast.success("Split caricato");
  };

  const handleConfirmOverwrite = () => {
    const key = currentSplitName.trim();
    if (!key) return;
    try {
      const stored = JSON.parse(localStorage.getItem("savedSplits") || "{}");
      stored[key] = { savedAt: Date.now(), exercises, notes, numDays };
      localStorage.setItem("savedSplits", JSON.stringify(stored));
      toast.success(`Split aggiornato: ${key}`);
    } catch (e) {
      console.error(e);
      toast.error("Impossibile salvare le modifiche allo split");
    }
  };

  const alignedWidth = numDays * 300 + (numDays - 1) * 8;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/schede">Gestione Schede</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Template Split</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-5xl font-black text-primary tracking-tight">SPLIT</h1>
          <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-md border border-border">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">W.O. Settimanali</label>
            <select aria-label="W.O. Settimanali" value={numDays} onChange={(e) => setNumDays(Number(e.target.value))} className="bg-card text-primary font-bold text-lg px-3 py-1.5 rounded-md border border-primary/30 hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 flex-1">
            <Button size="sm" onClick={handleReset} className="h-9 px-4 bg-primary/90 hover:bg-primary text-primary-foreground font-bold shadow-md transition-all hover:shadow-lg hover:scale-105">RESET</Button>
            <Button size="sm" onClick={() => setIsSplitDialogOpen(true)} className="h-9 px-4 bg-primary/90 hover:bg-primary text-primary-foreground font-bold shadow-md transition-all hover:shadow-lg hover:scale-105">APRI SPLIT</Button>
            <Button size="sm" className="h-9 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => setIsOverwriteConfirmOpen(true)} disabled={!currentSplitName} aria-disabled={!currentSplitName}>SALVA MODIFICA</Button>
            <Button size="sm" onClick={handleSaveSplit} className="h-9 px-4 bg-primary/90 hover:bg-primary text-primary-foreground font-bold shadow-md transition-all hover:shadow-lg hover:scale-105">SALVA SPLIT</Button>
            <Button size="sm" onClick={() => {
              // export current split to Gestione Schede (normalize fields)
              try {
                const normalized = (exercises || []).map((e: any, idx: number) => ({
                  // prefer explicit template-split keys, fallback to common names
                  muscleGroup: e.muscleGroup || e.muscle || "",
                  exerciseType: e.exerciseType || e.type || "",
                  stimuloTecnica: e.stimuloTecnica || e.stimolo || "",
                  exercise: e.exercise || e.name || `Esercizio ${idx + 1}`,
                  day: typeof e.day === 'number' ? e.day : (e.dayIndex ? e.dayIndex + 1 : undefined),
                  weeks: e.weeks || [],
                  rest: e.rest || "",
                  note: e.note || "",
                  groupType: e.groupType,
                  isGroupHead: !!e.isGroupHead,
                  isGroupChild: !!e.isGroupChild,
                  groupId: e.groupId,
                  childIndex: e.childIndex,
                }));
                const payload = { exercises: normalized, notes, numDays, name: currentSplitName };
                localStorage.setItem("importedSplit", JSON.stringify(payload));
                toast.success("Split esportato a Gestione Schede");
                navigate("/schede", { state: { fromImport: true } });
              } catch (e) {
                console.error(e);
                toast.error("Impossibile esportare lo split");
              }
            }} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all hover:shadow-lg hover:scale-105">AGGIUNGI A SCHEDA</Button>
            <Button size="sm" variant="destructive" className="h-9 px-4 font-bold shadow-md transition-all hover:shadow-lg hover:scale-105" onClick={() => setIsDeleteDialogOpen(true)}>CANCELLA SPLIT</Button>
          </div>
        </div>

        <div className="mb-4">
          <input value={currentSplitName} onChange={(e) => setCurrentSplitName(e.target.value)} placeholder="NOME SPLIT CORRENTE" style={{ width: `${alignedWidth}px` }} className="bg-card/50 backdrop-blur-sm placeholder:text-muted-foreground text-primary px-4 py-2.5 rounded-md border-2 border-primary/40 hover:border-primary/60 focus:border-primary text-center font-bold uppercase text-xl tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Nome split corrente" />
        </div>
      </div>

      <SplitDialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen} onRestore={handleRestoreSplit} currentExercises={exercises} currentNotes={notes} currentNumDays={numDays} />
      <SaveSplitDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen} onSave={handleDoSave} />
      <ResetConfirmDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} onConfirm={handleDoReset} />
      <CenteredAlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen} message={alertMessage} />
      <DeleteSplitConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={() => { const key = currentSplitName.trim(); if (!key) { toast.error("Nessun split selezionato"); return; } const stored = JSON.parse(localStorage.getItem("savedSplits") || "{}"); if (!stored[key]) { toast.error("Split non trovato"); return; } delete stored[key]; localStorage.setItem("savedSplits", JSON.stringify(stored)); toast.success(`Split cancellato: ${key}`); setCurrentSplitName(""); setIsSplitDialogOpen(false); setIsDeleteDialogOpen(false); }} />
      <ConfirmOverwriteDialog open={isOverwriteConfirmOpen} onOpenChange={setIsOverwriteConfirmOpen} onConfirm={handleConfirmOverwrite} splitName={currentSplitName} />

      <div className="flex flex-col gap-4">
        <div className="mt-6 overflow-x-auto">
          <div className="inline-block min-w-full">
            {Object.keys(volumeData).length > 0 && (
              <div className="mb-6">
                <VolumeBar data={volumeData} numDays={numDays} />
              </div>
            )}

            <TrainingGrid exercises={exercises} onAddExercise={handleAddExercise} onDeleteExercise={handleDeleteExercise} onUpdateExercise={handleUpdateExercise} onReset={handleReset} numDays={numDays} notes={notes} onNoteChange={(day, text) => setNotes((prev) => ({ ...prev, [day]: text }))} noScrollContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitPage;

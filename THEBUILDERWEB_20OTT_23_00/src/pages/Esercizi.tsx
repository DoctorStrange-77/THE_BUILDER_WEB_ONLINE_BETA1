import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Dumbbell, Play } from "lucide-react";
import { toast } from 'sonner';
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/types";
import MuscleSelect from "@/components/MuscleSelect";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input as UiInput } from "@/components/ui/input";

const STORAGE_KEY = 'exercises:modified';

// load initial list: prefer any saved modified list in localStorage
const loadInitialExercises = (): Exercise[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Exercise[];
    }
  } catch (e) {
    // ignore
  }
  return exercisesData as unknown as Exercise[];
};

export default function Esercizi() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [exercises, setExercises] = useState<Exercise[]>(() => loadInitialExercises());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [originalSerialized, setOriginalSerialized] = useState<string | null>(null);

  // persist modifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    } catch (e) {
      // ignore
    }
  }, [exercises]);

  const muscleGroups = useMemo(() => {
    const groups = new Set(exercises.map((ex) => ex.group));
    return Array.from(groups).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises
      .filter((exercise) => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = selectedGroup === "all" || exercise.group === selectedGroup;
        return matchesSearch && matchesGroup;
      })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedGroup, exercises]);

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      "Gambe": "bg-primary/20 text-primary border-primary/30",
      "Petto": "bg-secondary/20 text-secondary border-secondary/30",
      "Schiena": "bg-primary/20 text-primary border-primary/30",
      "Dorso": "bg-secondary/20 text-secondary border-secondary/30",
      "Braccia": "bg-primary/20 text-primary border-primary/30",
      "Spalle": "bg-secondary/20 text-secondary border-secondary/30",
      "Tricipiti": "bg-primary/20 text-primary border-primary/30",
    };
    return colors[group] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const getEquipmentInfo = (equip?: string) => {
    const k = (equip || "").toLowerCase();
    if (!k) return { label: "", emoji: "", cls: "" };
    if (k.includes("corpo") || k.includes("libero") || k.includes("body"))
      return { label: "BW", emoji: "🧍", cls: "border-emerald-300 text-emerald-300" };
    if (k.includes("macchina"))
      return { label: "MAC", emoji: "⚙️", cls: "border-amber-300 text-amber-300" };
    if (k.includes("cavi") || k.includes("cable"))
      return { label: "CAVI", emoji: "🔌", cls: "border-sky-300 text-sky-300" };
    if (k.includes("bilanc"))
      return { label: "BB", emoji: "🏋️", cls: "border-indigo-300 text-indigo-300" };
    if (k.includes("manub"))
      return { label: "DB", emoji: "🏋️", cls: "border-fuchsia-300 text-fuchsia-300" };
    if (k.includes("kettlebell") || k.includes("kb"))
      return { label: "KB", emoji: "🔔", cls: "border-orange-300 text-orange-300" };
    if (k.includes("band") || k.includes("elast"))
      return { label: "BAND", emoji: "🪢", cls: "border-violet-300 text-violet-300" };
    return { label: equip, emoji: "", cls: "text-muted-foreground border-muted-foreground/30" };
  };

  // use shared MuscleSelect component for primari/secondari

  // Handle creation flow when navigating from Schede with a custom name
  useEffect(() => {
    const incoming = (location.state as any)?.newExerciseName as string | undefined;
    if (!incoming) return;
    const name = incoming.trim();
    if (!name) { navigate(location.pathname, { replace: true, state: {} }); return; }

    setSearchQuery(name);
    setSelectedGroup("all");

    setExercises((prev) => {
      // if exists, do not duplicate
      const exists = prev.find((e) => e.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        // open dialog on existing item
        const filtered = [...prev]
          .filter((ex) => ex.name.toLowerCase().includes(name.toLowerCase()) && ("all" === "all" || true))
          .sort((a, b) => a.name.localeCompare(b.name));
        const idx = filtered.indexOf(exists);
        setActiveIndex(idx >= 0 ? idx : 0);
        setIsDialogOpen(true);
        setOriginalSerialized(JSON.stringify(exists));
        return prev;
      }

      const template: any = {
        categoria: "",
        tipo: "",
        esercizio: name,
        equipaggiamento: "",
        "bilaterale/unilaterale": "",
        catena: "",
        piano: "",
        primari: "",
        secondari: "",
        note: "",
        video: "",
        name: name,
        group: "",
      };
      const copy = [...prev, template as Exercise];
      // compute filtered with new list
      const filtered = copy
        .filter((ex) => ex.name.toLowerCase().includes(name.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
      const idx = filtered.indexOf(template as Exercise);
      setActiveIndex(idx >= 0 ? idx : 0);
      setIsDialogOpen(true);
      setOriginalSerialized(JSON.stringify(template));
      return copy;
    });

    // cleanup navigation state to avoid re-trigger
    navigate(location.pathname, { replace: true, state: {} });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Esercizi</h1>
        <p className="text-muted-foreground mt-1">
          Esplora il database completo di {exercises.length} esercizi
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca esercizi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtra per gruppo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i gruppi</SelectItem>
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredExercises.map((exercise, index) => (
          <Card
            key={index}
            className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
            onClick={() => { setActiveIndex(index); setOriginalSerialized(JSON.stringify(exercise)); setIsDialogOpen(true); }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors mt-1">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base group-hover:text-primary transition-colors break-words">
                        {exercise.name}
                      </CardTitle>
                      <Badge variant="outline" className={getGroupColor(exercise.group)}>
                        {exercise.group}
                      </Badge>
                      {(() => { const eq = getEquipmentInfo((exercise as any).equipaggiamento); return eq.label ? (
                        <Badge variant="outline" className={`bg-transparent ${eq.cls}`}>
                          <span className="mr-1">{eq.emoji}</span>{eq.label}
                        </Badge>
                      ) : null; })()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {exercise.video && (
                        <a
                          href={exercise.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:text-secondary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Play className="h-3 w-3" />
                          Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={(v)=>{ setIsDialogOpen(v); if(!v) setIsMaximized(false); }}>
          {isMaximized ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
        <div className="bg-popover border-border w-[calc(100%-96px)] h-[calc(100%-96px)] rounded-md">
          <div className="w-full h-full overflow-auto pr-6">
                <div className="flex justify-end p-2">
                  <button onClick={() => setIsMaximized((s) => !s)} className="p-1 rounded hover:bg-muted/30">
                {isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14H5a2 2 0 01-2-2V5a2 2 0 012-2h7a2 2 0 012 2v4m0 6h4a2 2 0 002-2v-7a2 2 0 00-2-2h-7a2 2 0 00-2 2v4" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h4V3h8v4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4v4H9v-4H5a2 2 0 01-2-2V9z" />
                  </svg>
                )}
              </button>
            </div>
                <DialogHeader>
              <DialogTitle>Modifica Esercizio</DialogTitle>
            </DialogHeader>
                {activeIndex !== null && filteredExercises[activeIndex] && (() => {
              const item = filteredExercises[activeIndex];
              const globalIndex = exercises.indexOf(item);
              if (globalIndex === -1) return null;
              const keys = Object.keys(item);
              return (
                <div className="space-y-4 h-full p-4">
                  {keys.map((k) => (
                    <div key={k} className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-muted-foreground col-span-1 break-words">{k}</label>
                      <div className="col-span-2">
                        {(k === 'primari' || k === 'secondari') ? (
                          <MuscleSelect value={(exercises[globalIndex] as any)[k] ?? ''} onChange={(v) => {
                            const copy = [...exercises];
                            copy[globalIndex] = { ...copy[globalIndex], [k]: v } as any;
                            // if primary changed, also update group to keep them in sync
                            if (k === 'primari') copy[globalIndex] = { ...copy[globalIndex], group: v } as any;
                            setExercises(copy);
                          }} placeholder={k === 'primari' ? 'Cerca o seleziona distretto...' : 'Cerca o seleziona secondario...'} />
                        ) : (
                          <UiInput value={(exercises[globalIndex] as any)[k] ?? ''} onChange={(e) => {
                            const copy = [...exercises];
                            copy[globalIndex] = { ...copy[globalIndex], [k]: (e.target as HTMLInputElement).value } as any;
                            setExercises(copy);
                          }} />
                        )}
                      </div>
                    </div>
                  ))}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Chiudi</Button>
                      <Button onClick={() => {
                        // Save changes (exercises state is already updated on inputs)
                        if (activeIndex === null) return;
                        const item = filteredExercises[activeIndex];
                        const globalIdx = exercises.indexOf(item);
                        try {
                          localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
                          setOriginalSerialized(JSON.stringify(exercises[globalIdx]));
                          toast.success('Modifiche salvate');
                        } catch (e) {
                          toast.error('Impossibile salvare');
                        }
                      }} disabled={!(activeIndex !== null && (() => { const item = filteredExercises[activeIndex!]; const gi = exercises.indexOf(item); return gi !== -1 && JSON.stringify(exercises[gi]) !== originalSerialized; })())}>Salva</Button>
                      <Button variant="destructive" onClick={() => {
                        const copy = [...exercises];
                        copy.splice(globalIndex, 1);
                        setExercises(copy);
                        setIsDialogOpen(false);
                      }}>Elimina</Button>
                    </div>
                </div>
              );
            })()}
                </div>
              </div>
            </div>
          ) : (
            <DialogContent className="bg-popover border-border max-w-5xl w-[min(980px,95vw)] max-h-[80vh]">
              <div className="max-h-[80vh] overflow-hidden">
                <div className="max-h-[60vh] overflow-auto pr-6">
              <div className="flex justify-end">
                <button onClick={() => setIsMaximized((s) => !s)} className="p-1 rounded hover:bg-muted/30">
                  {isMaximized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14H5a2 2 0 01-2-2V5a2 2 0 012-2h7a2 2 0 012 2v4m0 6h4a2 2 0 002-2v-7a2 2 0 00-2-2h-7a2 2 0 00-2 2v4" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h4V3h8v4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4v4H9v-4H5a2 2 0 01-2-2V9z" />
                    </svg>
                  )}
                </button>
              </div>
              <DialogHeader>
                <DialogTitle>Modifica Esercizio</DialogTitle>
              </DialogHeader>
              {activeIndex !== null && filteredExercises[activeIndex] && (() => {
                const item = filteredExercises[activeIndex];
                const globalIndex = exercises.indexOf(item);
                if (globalIndex === -1) return null;
                const keys = Object.keys(item);
                return (
                  <div className="space-y-4">
                    {keys.map((k) => (
                      <div key={k} className="grid grid-cols-3 gap-2 items-center">
                        <label className="text-sm text-muted-foreground col-span-1 break-words">{k}</label>
                        <div className="col-span-2">
                          {(k === 'primari' || k === 'secondari') ? (
                            <MuscleSelect value={(exercises[globalIndex] as any)[k] ?? ''} onChange={(v) => {
                              const copy = [...exercises];
                              copy[globalIndex] = { ...copy[globalIndex], [k]: v } as any;
                              // if primary changed, also update group to keep them in sync
                              if (k === 'primari') copy[globalIndex] = { ...copy[globalIndex], group: v } as any;
                              setExercises(copy);
                            }} placeholder={k === 'primari' ? 'Cerca o seleziona distretto...' : 'Cerca o seleziona secondario...'} />
                          ) : (
                            <UiInput value={(exercises[globalIndex] as any)[k] ?? ''} onChange={(e) => {
                              const copy = [...exercises];
                              copy[globalIndex] = { ...copy[globalIndex], [k]: (e.target as HTMLInputElement).value } as any;
                              setExercises(copy);
                            }} />
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Chiudi</Button>
                      <Button onClick={() => {
                        if (activeIndex === null) return;
                        const item = filteredExercises[activeIndex];
                        const gi = exercises.indexOf(item);
                        try {
                          localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
                          setOriginalSerialized(JSON.stringify(exercises[gi]));
                          toast.success('Modifiche salvate');
                        } catch (e) {
                          toast.error('Impossibile salvare');
                        }
                      }} disabled={!(activeIndex !== null && (() => { const item = filteredExercises[activeIndex!]; const gi = exercises.indexOf(item); return gi !== -1 && JSON.stringify(exercises[gi]) !== originalSerialized; })())}>Salva</Button>
                      <Button variant="destructive" onClick={() => {
                        const copy = [...exercises];
                        copy.splice(globalIndex, 1);
                        setExercises(copy);
                        setIsDialogOpen(false);
                      }}>Elimina</Button>
                    </div>
                  </div>
                );
              })()}
                  </div>
                </div>
              </DialogContent>
          )}
        </Dialog>
      </div>

      {filteredExercises.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun esercizio trovato</h3>
            <p className="text-muted-foreground text-center">
              Prova a modificare i criteri di ricerca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

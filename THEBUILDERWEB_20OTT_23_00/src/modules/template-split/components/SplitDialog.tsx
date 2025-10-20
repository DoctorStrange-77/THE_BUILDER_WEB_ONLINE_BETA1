import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Exercise } from "@/modules/template-split/types/training";

interface SavedSplit {
  savedAt: number;
  exercises: Exercise[];
  notes?: Record<number, string>;
  numDays?: number;
}

export default function SplitDialog({ open, onOpenChange, onRestore, currentExercises, currentNotes, currentNumDays }: any) {
  const [splits, setSplits] = useState<Record<string, SavedSplit>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("savedSplits") || "{}");
      setSplits(stored);
      if (open) setQuery("");
      if (open) setFocusedIndex(0);
    } catch (e) {
      setSplits({});
    }
  }, [open]);

  const handleDelete = (key: string) => {
    const copy = { ...splits };
    delete copy[key];
    setSplits(copy);
    localStorage.setItem("savedSplits", JSON.stringify(copy));
  };

  const handleStartRestore = (key: string) => setSelectedKey(key);
  const handleCancelRestore = () => setSelectedKey(null);

  const handleConfirmRestore = (mode: "overwrite" | "merge") => {
    if (!selectedKey) return;
    const s = splits[selectedKey];
    if (!s) return;
    if (mode === "overwrite") {
      onRestore({ name: selectedKey, exercises: s.exercises || [], notes: s.notes || {}, numDays: s.numDays });
    } else {
      const now = Date.now();
      const newSaved = (s.exercises || []).map((ex, idx) => ({ ...ex, id: `ex-${now}-${Math.random()}-${idx}` }));
      const mergedNotes = { ...(currentNotes || {}) };
      if (s.notes) {
        Object.entries(s.notes).forEach(([k, v]) => {
          const day = Number(k);
          if (mergedNotes[day]) mergedNotes[day] = `${mergedNotes[day]} | ${v}`;
          else mergedNotes[day] = v;
        });
      }
      onRestore({ name: selectedKey, exercises: [...currentExercises, ...newSaved], notes: mergedNotes, numDays: currentNumDays });
    }
    setSelectedKey(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apri Split</DialogTitle>
          <DialogDescription>Seleziona uno split salvato per caricarlo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-auto my-4">
          <div>
            <Input placeholder="Cerca split..." value={query} onChange={(e) => { setQuery(e.target.value); setFocusedIndex(0); }} className="mb-2" />
          </div>
          {Object.keys(splits).length === 0 && <div className="text-sm text-muted-foreground">Nessuno split salvato</div>}

          {selectedKey ? (
            (() => {
              const s = splits[selectedKey as string];
              if (!s) return null;
              return (
                <div className="p-4 border rounded bg-background">
                  <div className="mb-2">
                    <div className="font-medium">{selectedKey}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.savedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm mb-4">Seleziona come vuoi caricare questo split:</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleConfirmRestore("overwrite")}>Sovrascrivi</Button>
                    <Button size="sm" variant="default" onClick={() => handleConfirmRestore("merge")}>Unisci</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelRestore}>Annulla</Button>
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const q = query.trim().toLowerCase();
              const entries = Object.entries(splits).filter(([key]) => key.toLowerCase().includes(q)).map(([key, s]) => ({ key, s }));
              entries.sort((a, b) => {
                if (!q) return (b.s.savedAt || 0) - (a.s.savedAt || 0);
                const ka = a.key.toLowerCase();
                const kb = b.key.toLowerCase();
                const score = (k: string) => (k === q ? 0 : k.startsWith(q) ? 1 : 2);
                const sa = score(ka);
                const sb = score(kb);
                if (sa !== sb) return sa - sb;
                return (b.s.savedAt || 0) - (a.s.savedAt || 0);
              });

              if (entries.length === 0) return <div className="text-sm text-muted-foreground">Nessuno split trovato</div>;

              return entries.map(({ key, s }, idx) => {
                const isFocused = idx === focusedIndex;
                const highlight = (text: string) => {
                  if (!q) return <>{text}</>;
                  const lower = text.toLowerCase();
                  const pos = lower.indexOf(q);
                  if (pos === -1) return <>{text}</>;
                  return (
                    <>
                      {text.slice(0, pos)}
                      <span className="bg-yellow-300 text-black px-1">{text.slice(pos, pos + q.length)}</span>
                      {text.slice(pos + q.length)}
                    </>
                  );
                };

                return (
                  <div key={key} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") handleStartRestore(key); }} onClick={() => handleStartRestore(key)} className={"flex items-center justify-between border rounded p-2 cursor-pointer " + (isFocused ? "ring-2 ring-primary bg-muted/60" : "bg-muted/50") }>
                    <div>
                      <div className="font-medium">{highlight(key)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.savedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleStartRestore(key); }}>Apri</Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(key); }}>Elimina</Button>
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Chiudi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { Exercise, MUSCLE_GROUPS } from "@/modules/template-split/types/training";
import { Button } from "@/components/ui/button";
import { StimoloDialog } from "./StimoloDialog";
import { Plus, Trash2, Copy } from "lucide-react";

interface ExerciseCellProps {
  day: number;
  exercises: Exercise[];
  onAddExercise: (exercise: Omit<Exercise, "id">) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateExercise?: (exercise: Exercise) => void;
  note?: string;
  onNoteChange?: (text: string) => void;
}

export const ExerciseCell = ({ day, exercises, onAddExercise, onDeleteExercise, onUpdateExercise, note, onNoteChange }: ExerciseCellProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const handleAddExercise = (data: Omit<Exercise, "id" | "day">) => {
    onAddExercise({ ...data, day });
    setIsDialogOpen(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsDialogOpen(true);
  };

  const handleUpdateExercise = (data: Omit<Exercise, "id" | "day">) => {
    if (!editingExercise) return;
    onUpdateExercise?.({ ...editingExercise, ...data });
    setEditingExercise(null);
    setIsDialogOpen(false);
  };

  const handleCopyExercise = (exercise: Exercise) => {
    const { id, ...rest } = exercise;
    onAddExercise(rest);
  };

  const getMuscleColor = (muscleGroup: string) => {
    const group = MUSCLE_GROUPS.find((g) => g.name === muscleGroup);
    return group?.color || "muted";
  };

  return (
    <div className="bg-card border border-gray-400 rounded-lg min-h-[300px] p-3 space-y-2">
      <div className="bg-primary text-primary-foreground font-bold text-center py-2 px-3 rounded-t-lg mb-3 -mx-3 -mt-3">DAY - {day}</div>
      <div className="px-1 mb-3">
        <input value={note ?? ""} onChange={(e) => onNoteChange?.(e.target.value)} placeholder="TIPO W.O." aria-label={`Tipo W.O. giorno ${day}`} className="w-full bg-black placeholder:text-white/30 text-primary rounded px-3 py-2 text-center uppercase font-bold text-base border-2 border-primary relative z-10" style={{ fontFamily: "inherit" }} />
      </div>

      {exercises.map((exercise) => {
        const isActivation = (exercise.muscleGroup || '').toUpperCase() === 'ATTIVAZIONE';
        return (
          <div key={exercise.id} className={`p-3 rounded-sm relative group flex flex-col items-center text-center justify-center ${isActivation ? 'bg-white text-black' : ''}`} style={isActivation ? { textShadow: 'none' } : { backgroundColor: `hsl(var(--${getMuscleColor(exercise.muscleGroup)}))`, textShadow: '0 1px 1px rgba(0,0,0,0.12)' }} onDoubleClick={() => handleEdit(exercise)}>
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive" onClick={() => onDeleteExercise(exercise.id)} onDoubleClick={(e) => e.stopPropagation()}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute top-1 right-8 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-secondary" onClick={() => handleCopyExercise(exercise)} onDoubleClick={(e) => e.stopPropagation()}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80" onClick={() => handleEdit(exercise)} onDoubleClick={(e) => e.stopPropagation()}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Button>
            <div className="text-sm font-bold text-black uppercase">{exercise.muscleGroup}</div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[12px] text-black/80 font-semibold text-center w-full">
              <div className="truncate">{exercise.exerciseType}</div>
              <div className="truncate">{exercise.stimuloTecnica}</div>
            </div>
          </div>
        );
      })}

      <Button variant="ghost" size="sm" className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted" onClick={() => { setEditingExercise(null); setIsDialogOpen(true); }}>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Esercizio
      </Button>

      <StimoloDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingExercise ? handleUpdateExercise : handleAddExercise}
        initialData={editingExercise ?? undefined}
        placeholderData={editingExercise ? { muscleGroup: editingExercise.muscleGroup, exerciseType: editingExercise.exerciseType, stimuloTecnica: editingExercise.stimuloTecnica } : undefined}
        submitLabel={editingExercise ? "Aggiorna" : undefined}
      />
    </div>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Food } from "@/types/diet";

interface FoodDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (food: Partial<Food>) => void;
  food?: Food | null;
}

const MEAL_TAGS = ["breakfast", "snack", "lunch", "dinner", "prenanna"];

export const FoodDialog = ({ open, onClose, onSave, food }: FoodDialogProps) => {
  const [formData, setFormData] = useState<Partial<Food>>({
    name: "",
    category: "carb",
    carbs: 0,
    protein: 0,
    fat: 0,
    suitable: [],
  });

  useEffect(() => {
    if (food) {
      setFormData(food);
    } else {
      setFormData({
        name: "",
        category: "carb",
        carbs: 0,
        protein: 0,
        fat: 0,
        suitable: [],
      });
    }
  }, [food, open]);

  const handleSave = () => {
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  const toggleSuitable = (tag: string) => {
    const current = formData.suitable || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setFormData({ ...formData, suitable: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{food ? "Modifica alimento" : "Nuovo alimento"}</DialogTitle>
          <DialogDescription>
            Inserisci i valori nutrizionali per 100 g di alimento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="food-name">Nome</Label>
              <Input
                id="food-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Es. Riso bianco"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food-category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "protein" | "fat" | "carb" | "mixed") =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="food-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carb">Carboidrati</SelectItem>
                  <SelectItem value="protein">Proteine</SelectItem>
                  <SelectItem value="fat">Grassi</SelectItem>
                  <SelectItem value="mixed">Misti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="food-carbs">CHO (g/100g)</Label>
              <Input
                id="food-carbs"
                type="number"
                step="0.1"
                min="0"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food-protein">PRO (g/100g)</Label>
              <Input
                id="food-protein"
                type="number"
                step="0.1"
                min="0"
                value={formData.protein}
                onChange={(e) =>
                  setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food-fat">FAT (g/100g)</Label>
              <Input
                id="food-fat"
                type="number"
                step="0.1"
                min="0"
                value={formData.fat}
                onChange={(e) =>
                  setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adatto a</Label>
            <div className="flex flex-wrap gap-3">
              {MEAL_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 cursor-pointer rounded-full border border-border px-3 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={formData.suitable?.includes(tag)}
                    onCheckedChange={() => toggleSuitable(tag)}
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { DietBreadcrumbs } from "@/components/diet/DietBreadcrumbs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDietState } from "@/hooks/useDietState";
import { FoodDatabase as FoodDatabaseComponent } from "@/components/diet/FoodDatabase";
import { FoodDialog } from "@/components/diet/FoodDialog";
import { Food } from "@/types/diet";
import { toast } from "sonner";

const FoodDatabase = () => {
  const navigate = useNavigate();
  const { state, addFood, updateFood } = useDietState();
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const handleSaveFood = (foodData: Partial<Food>) => {
    if (editingFood) {
      updateFood(editingFood.id, foodData);
      toast.success("Alimento modificato");
    } else {
      const newFood: Food = {
        id: `food_${Date.now()}`,
        name: foodData.name || "",
        category: foodData.category || "carb",
        carbs: foodData.carbs || 0,
        protein: foodData.protein || 0,
        fat: foodData.fat || 0,
        suitable: foodData.suitable || [],
      };
      addFood(newFood);
      toast.success("Alimento aggiunto");
    }
    setEditingFood(null);
  };

  const handleEditFood = (food: Food) => {
    setEditingFood(food);
    setFoodDialogOpen(true);
  };

  const handleAddFood = () => {
    setEditingFood(null);
    setFoodDialogOpen(true);
  };

  return (<>
    <DietBreadcrumbs current="Database Alimenti" />
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dieta")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h1 className="text-lg font-bold tracking-tight">THE BUILDER WEB</h1>
              </div>
            </div>
            <Button onClick={handleAddFood} className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Alimento
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">
            Tabella <span className="text-primary">Alimentare</span>
          </h1>
          <p className="text-muted-foreground">
            Gestisci il database degli alimenti con i valori nutrizionali per 100g.
          </p>
        </header>

        <FoodDatabaseComponent
          foods={state.foods}
          onEditFood={handleEditFood}
          onAddFood={handleAddFood}
        />

        <footer className="text-xs text-muted-foreground py-6 border-t border-border">
          * I valori nutrizionali sono riferiti a 100g di parte edibile. Verifica sempre le etichette
          degli alimenti specifici che utilizzi. Database coerente con tabelle CREA (2019).
        </footer>
      </main>

      <FoodDialog
        open={foodDialogOpen}
        onClose={() => {
          setFoodDialogOpen(false);
          setEditingFood(null);
        }}
        onSave={handleSaveFood}
        food={editingFood}
      />
    </div>
  
  </>
);
};

export default FoodDatabase;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Food } from "@/types/diet";
import { Plus } from "lucide-react";

interface FoodDatabaseProps {
  foods: Food[];
  onEditFood: (food: Food) => void;
  onAddFood: () => void;
}

export const FoodDatabase = ({ foods, onEditFood, onAddFood }: FoodDatabaseProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Database Alimenti (per 100 g)</CardTitle>
            <CardDescription>
              Valori per 100 g di parte edibile; modifica/aggiungi alimenti.
            </CardDescription>
          </div>
          <Button onClick={onAddFood} className="gap-2">
            <Plus className="h-4 w-4" />
            Aggiungi alimento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left font-semibold">Alimento</th>
                <th className="p-3 text-left font-semibold">Categoria</th>
                <th className="p-3 text-left font-semibold">CHO</th>
                <th className="p-3 text-left font-semibold">PRO</th>
                <th className="p-3 text-left font-semibold">FAT</th>
                <th className="p-3 text-left font-semibold">Adatto a</th>
                <th className="p-3 text-right font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr
                  key={food.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3 font-medium">{food.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{food.category}</td>
                  <td className="p-3">{food.carbs}</td>
                  <td className="p-3">{food.protein}</td>
                  <td className="p-3">{food.fat}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {food.suitable.join(", ")}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditFood(food)}
                    >
                      Modifica
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

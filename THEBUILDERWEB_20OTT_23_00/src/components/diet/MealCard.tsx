import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Food, MealRow } from "@/types/diet";
import { FoodCombobox } from "./FoodCombobox";

interface MealCardProps {
  name: string;
  target: { c: number; p: number; f: number };
  total: { c: number; p: number; f: number };
  rows: MealRow[];
  availableFoods: Food[];
  onRowChange: (rowIndex: number, updates: Partial<MealRow>) => void;
  onClear: () => void;
}

export const MealCard = ({
  name,
  target,
  total,
  rows,
  availableFoods,
  onRowChange,
  onClear,
}: MealCardProps) => {
  const foodMap = Object.fromEntries(availableFoods.map((f) => [f.id, f]));

  const getDeltaColor = (delta: number) => {
    if (Math.abs(delta) < 0.5) return "text-foreground";
    return delta > 0 ? "text-destructive" : "text-blue-400";
  };

  const calculateRowMacros = (row: MealRow) => {
    const food = foodMap[row.foodId];
    if (!food || !row.grams) return { c: 0, p: 0, f: 0 };
    const factor = row.grams / 100;
    return {
      c: (food.carbs * factor).toFixed(1),
      p: (food.protein * factor).toFixed(1),
      f: (food.fat * factor).toFixed(1),
    };
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{name}</h3>
          <div className="flex items-center gap-2">
            <code className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary border border-primary/20">
              Target: {target.c}C / {target.p}P / {target.f}F
            </code>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-3">
        <div className="space-y-2">
          {rows.map((row, i) => {
            const macros = calculateRowMacros(row);
            return (
              <div key={i} className="grid grid-cols-[1.2fr_0.7fr_1fr] gap-2 items-center">
                <FoodCombobox
                  foods={availableFoods}
                  value={row.foodId}
                  onValueChange={(value) => onRowChange(i, { foodId: value })}
                />
                
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={row.grams || ""}
                  onChange={(e) =>
                    onRowChange(i, { grams: parseInt(e.target.value) || 0 })
                  }
                  placeholder="g"
                  className="h-9"
                />
                
                <code className="text-xs font-mono text-muted-foreground text-right">
                  {macros.c} / {macros.p} / {macros.f}
                </code>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm font-medium">
            Totale: <span className="font-mono text-xs">{total.c}C / {total.p}P / {total.f}F</span>
          </div>
          <div className="text-xs font-mono">
            Δ:{" "}
            <span className={getDeltaColor(total.c - target.c)}>
              {(total.c - target.c).toFixed(1)}
            </span>
            C ·{" "}
            <span className={getDeltaColor(total.p - target.p)}>
              {(total.p - target.p).toFixed(1)}
            </span>
            P ·{" "}
            <span className={getDeltaColor(total.f - target.f)}>
              {(total.f - target.f).toFixed(1)}
            </span>
            F
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Supplement, SupplementPlan, SupplementRow } from "@/types/supplements";
import { FoodCombobox } from "@/components/diet/FoodCombobox";
import { Trash2 } from "lucide-react";

interface PlanEditorProps {
  plan: SupplementPlan;
  supplements: Supplement[];
  onUpdateInfo: (updates: Partial<Pick<SupplementPlan, "name" | "clientName">>) => void;
  onUpdateRow: (rowIndex: number, updates: Partial<SupplementRow>) => void;
  onClear: () => void;
}

export const PlanEditor = ({
  plan,
  supplements,
  onUpdateInfo,
  onUpdateRow,
  onClear,
}: PlanEditorProps) => {
  const supplementsAsFood = supplements.map((s) => ({
    id: s.id,
    name: s.name,
    category: "mixed" as const,
    carbs: 0,
    protein: 0,
    fat: 0,
    suitable: [],
  }));

  const timingOptions = [
    "Mattina a digiuno",
    "Colazione",
    "Pre-workout",
    "Intra-workout",
    "Post-workout",
    "Pranzo",
    "Spuntino pomeridiano",
    "Cena",
    "Pre-nanna",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Piano di Integrazione</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Nome Piano</Label>
            <Input
              id="plan-name"
              value={plan.name}
              onChange={(e) => onUpdateInfo({ name: e.target.value })}
              placeholder="Es: Piano Massa Inverno"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-name">Nome Cliente</Label>
            <Input
              id="client-name"
              value={plan.clientName}
              onChange={(e) => onUpdateInfo({ clientName: e.target.value })}
              placeholder="Nome e Cognome"
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Integratori e Timing</h4>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-3 w-3 mr-2" />
              Pulisci
            </Button>
          </div>

          <div className="space-y-2">
            {plan.rows.map((row, i) => {
              const supplement = supplements.find((s) => s.id === row.supplementId);
              return (
                <div key={i} className="grid grid-cols-[1.5fr_0.8fr_1.5fr] gap-2 items-center">
                  <FoodCombobox
                    foods={supplementsAsFood}
                    value={row.supplementId}
                    onValueChange={(value) => onUpdateRow(i, { supplementId: value })}
                  />
                  
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={row.quantity || ""}
                      onChange={(e) =>
                        onUpdateRow(i, { quantity: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Qtà"
                      className="h-9"
                    />
                    {supplement && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {supplement.unit}
                      </span>
                    )}
                  </div>

                  <Input
                    value={row.timing}
                    onChange={(e) => onUpdateRow(i, { timing: e.target.value })}
                    placeholder="Es: Pre-workout, Mattina..."
                    list={`timing-suggestions-${i}`}
                    className="h-9"
                  />
                  <datalist id={`timing-suggestions-${i}`}>
                    {timingOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Suggerimenti:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Seleziona l'integratore dal database</li>
            <li>Inserisci la quantità con l'unità di misura corretta</li>
            <li>Specifica quando assumere l'integratore durante la giornata</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

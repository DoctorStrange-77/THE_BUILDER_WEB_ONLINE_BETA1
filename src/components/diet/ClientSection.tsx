import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kcalFrom } from "@/utils/dietCalculations";

interface ClientSectionProps {
  client: { nome: string; cognome: string; peso: number };
  totals: { carbs: number; protein: number; fat: number };
  onClientChange: (updates: Partial<ClientSectionProps["client"]>) => void;
  onTotalsChange: (updates: Partial<ClientSectionProps["totals"]>) => void;
}

export const ClientSection = ({
  client,
  totals,
  onClientChange,
  onTotalsChange,
}: ClientSectionProps) => {
  const totalKcal = kcalFrom(totals.carbs, totals.protein, totals.fat);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Atleta & Macro (giornalieri)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cognome">Cognome</Label>
            <Input
              id="cognome"
              value={client.cognome}
              onChange={(e) => onClientChange({ cognome: e.target.value })}
              placeholder="Rossi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={client.nome}
              onChange={(e) => onClientChange({ nome: e.target.value })}
              placeholder="Mario"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              min="0"
              value={client.peso || ""}
              onChange={(e) => onClientChange({ peso: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="carbs">Carboidrati (g)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="1"
              value={totals.carbs || ""}
              onChange={(e) => onTotalsChange({ carbs: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Proteine (g)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="1"
              value={totals.protein || ""}
              onChange={(e) => onTotalsChange({ protein: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Grassi (g)</Label>
            <Input
              id="fat"
              type="number"
              min="0"
              step="1"
              value={totals.fat || ""}
              onChange={(e) => onTotalsChange({ fat: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground mb-1">Totale kcal</p>
            <p className="text-2xl font-bold text-primary">{totalKcal}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

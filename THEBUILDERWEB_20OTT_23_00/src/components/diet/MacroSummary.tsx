import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MacroSummaryProps {
  target: {
    carbs: number;
    protein: number;
    fat: number;
  };
  actual: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

export const MacroSummary = ({ target, actual }: MacroSummaryProps) => {
  const getDelta = (actualValue: number, targetValue: number) => {
    return actualValue - targetValue;
  };

  const getDeltaColor = (delta: number) => {
    if (Math.abs(delta) < 5) return "text-success";
    if (Math.abs(delta) < 20) return "text-warning";
    return "text-destructive";
  };

  const formatDelta = (delta: number) => {
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(0)}`;
  };

  const targetKcal = target.carbs * 4 + target.protein * 4 + target.fat * 9;
  const actualKcal = actual.carbs * 4 + actual.protein * 4 + actual.fat * 9;

  const metrics = [
    { label: "Calorie", targetValue: targetKcal, actualValue: actualKcal, unit: "kcal" },
    { label: "Carboidrati", targetValue: target.carbs, actualValue: actual.carbs, unit: "g" },
    { label: "Proteine", targetValue: target.protein, actualValue: actual.protein, unit: "g" },
    { label: "Grassi", targetValue: target.fat, actualValue: actual.fat, unit: "g" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">
          Riepilogo <span className="text-primary">Macro</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => {
            const delta = getDelta(metric.actualValue, metric.targetValue);
            const deltaColor = getDeltaColor(delta);
            const percentage = metric.targetValue > 0 
              ? ((metric.actualValue / metric.targetValue) * 100).toFixed(0)
              : 0;

            return (
              <div
                key={metric.label}
                className="p-4 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.actualValue.toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">/ {metric.targetValue.toFixed(0)} {metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${deltaColor}`}>
                      {formatDelta(delta)} {metric.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

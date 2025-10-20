import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEAL_NAMES } from "@/utils/mealNames";
import { columnSums } from "@/utils/dietCalculations";
import { TimingRow } from "@/types/diet";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDietState } from "@/hooks/useDietState";
import { toast } from "sonner";

interface TimingSectionProps {
  timing: TimingRow[];
  targets: Array<{ c: number; p: number; f: number }>;
  onTimingChange: (index: number, updates: Partial<TimingRow>) => void;
  onLoadTemplate: (templateId: string) => void;
}

export const TimingSection = ({ timing, targets, onTimingChange, onLoadTemplate }: TimingSectionProps) => {
  const { getTimingTemplates } = useDietState();
  type TimingTemplate = { id: string; name: string; timing?: TimingRow[] };
  const templates: TimingTemplate[] = getTimingTemplates();
  const sums = columnSums(timing);

  const getSumColor = (sum: number) => {
    if (Math.abs(sum - 100) < 0.1) return "bg-success text-white";
    if (sum > 100) return "bg-destructive text-white";
    return "bg-warning text-black";
  };

  const handleLoadTemplate = (templateId: string) => {
    onLoadTemplate(templateId);
    toast.success("Template caricato");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <CardTitle className="text-lg">Timing dei macronutrienti (6 pasti)</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            {templates.length > 0 && (
              <Select onValueChange={handleLoadTemplate}>
                <SelectTrigger className="w-[180px] h-9">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <SelectValue placeholder="Carica template" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex flex-wrap gap-2 text-xs items-center">
              <span className="flex items-center gap-1">
                CHO: <Badge className={getSumColor(sums.c)}>{sums.c.toFixed(0)}%</Badge>
              </span>
              <span className="flex items-center gap-1">
                PRO: <Badge className={getSumColor(sums.p)}>{sums.p.toFixed(0)}%</Badge>
              </span>
              <span className="flex items-center gap-1">
                FAT: <Badge className={getSumColor(sums.f)}>{sums.f.toFixed(0)}%</Badge>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-2 text-left font-semibold">Pasto</th>
                <th className="p-2 text-left font-semibold">CHO %</th>
                <th className="p-2 text-left font-semibold">PRO %</th>
                <th className="p-2 text-left font-semibold">FAT %</th>
                <th className="p-2 text-right font-semibold">Target (g)</th>
              </tr>
            </thead>
            <tbody>
              {MEAL_NAMES.map((name, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-2 font-medium text-xs">{name}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={timing[i].cPerc || ""}
                      onChange={(e) =>
                        onTimingChange(i, { cPerc: parseInt(e.target.value) || 0 })
                      }
                      className="w-16 h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={timing[i].pPerc || ""}
                      onChange={(e) =>
                        onTimingChange(i, { pPerc: parseInt(e.target.value) || 0 })
                      }
                      className="w-16 h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={timing[i].fPerc || ""}
                      onChange={(e) =>
                        onTimingChange(i, { fPerc: parseInt(e.target.value) || 0 })
                      }
                      className="w-16 h-8"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary border border-primary/20">
                      {targets[i].c} / {targets[i].p} / {targets[i].f}
                    </code>
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

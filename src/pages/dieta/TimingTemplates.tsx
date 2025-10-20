import { DietBreadcrumbs } from "@/components/diet/DietBreadcrumbs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MEAL_NAMES } from "@/utils/mealNames";
import { useDietState } from "@/hooks/useDietState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimingTemplate {
  id: string;
  name: string;
  description: string;
  timing: Array<{ cPerc: number; pPerc: number; fPerc: number }>;
}

const TimingTemplates = () => {
  const navigate = useNavigate();
  const { saveTimingTemplate, deleteTimingTemplate, getTimingTemplates } = useDietState();
  
  const [templates, setTemplates] = useState<TimingTemplate[]>(getTimingTemplates());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TimingTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<TimingTemplate>>({
    name: "",
    description: "",
    timing: Array.from({ length: 6 }, () => ({ cPerc: 0, pPerc: 0, fPerc: 0 })),
  });

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Inserisci un nome per il template");
      return;
    }

    const template: TimingTemplate = {
      id: editingTemplate?.id || `template_${Date.now()}`,
      name: formData.name,
      description: formData.description || "",
      timing: formData.timing || Array.from({ length: 6 }, () => ({ cPerc: 0, pPerc: 0, fPerc: 0 })),
    };

    saveTimingTemplate(template);
    setTemplates(getTimingTemplates());
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      timing: Array.from({ length: 6 }, () => ({ cPerc: 0, pPerc: 0, fPerc: 0 })),
    });
    toast.success(editingTemplate ? "Template modificato" : "Template salvato");
  };

  const handleEdit = (template: TimingTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo template?")) {
      deleteTimingTemplate(id);
      setTemplates(getTimingTemplates());
      toast.success("Template eliminato");
    }
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      timing: Array.from({ length: 6 }, () => ({ cPerc: 0, pPerc: 0, fPerc: 0 })),
    });
    setDialogOpen(true);
  };

  const updateTimingValue = (mealIndex: number, field: 'cPerc' | 'pPerc' | 'fPerc', value: number) => {
    const newTiming = [...(formData.timing || [])];
    newTiming[mealIndex] = { ...newTiming[mealIndex], [field]: value };
    setFormData({ ...formData, timing: newTiming });
  };

  const calculateSum = (field: 'cPerc' | 'pPerc' | 'fPerc') => {
    return formData.timing?.reduce((sum, t) => sum + (t[field] || 0), 0) || 0;
  };

  return (<>
    <DietBreadcrumbs current="Template Timing" />
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
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Template
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">
            Gestione <span className="text-primary">Timing</span>
          </h1>
          <p className="text-muted-foreground">
            Crea e gestisci template di timing per i macronutrienti da utilizzare nelle diete.
          </p>
        </header>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-4">
                Nessun template salvato. Crea il tuo primo template!
              </p>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Crea Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description || "Nessuna descrizione"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm space-y-1">
                      {MEAL_NAMES.map((name, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-border/50">
                          <span className="text-muted-foreground">{name}</span>
                          <code className="text-xs font-mono">
                            {template.timing[i].cPerc}% C · {template.timing[i].pPerc}% P · {template.timing[i].fPerc}% F
                          </code>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(template)}
                      >
                        Modifica
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifica Template" : "Nuovo Template"}
            </DialogTitle>
            <DialogDescription>
              Configura le percentuali di macronutrienti per ogni pasto. Ogni colonna deve sommare a 100%.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es. Massa Muscolare"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Es. Template per fase di massa"
                />
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="p-3 text-left font-semibold">Pasto</th>
                    <th className="p-3 text-left font-semibold">Carbo %</th>
                    <th className="p-3 text-left font-semibold">Pro %</th>
                    <th className="p-3 text-left font-semibold">Grassi %</th>
                  </tr>
                </thead>
                <tbody>
                  {MEAL_NAMES.map((name, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-3 font-medium">{name}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.timing?.[i]?.cPerc || 0}
                          onChange={(e) => updateTimingValue(i, 'cPerc', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.timing?.[i]?.pPerc || 0}
                          onChange={(e) => updateTimingValue(i, 'pPerc', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.timing?.[i]?.fPerc || 0}
                          onChange={(e) => updateTimingValue(i, 'fPerc', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/20 font-semibold">
                    <td className="p-3">Totale</td>
                    <td className="p-3">
                      <span className={calculateSum('cPerc') === 100 ? "text-success" : "text-destructive"}>
                        {calculateSum('cPerc')}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={calculateSum('pPerc') === 100 ? "text-success" : "text-destructive"}>
                        {calculateSum('pPerc')}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={calculateSum('fPerc') === 100 ? "text-success" : "text-destructive"}>
                        {calculateSum('fPerc')}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salva Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  
  </>
);
};

export default TimingTemplates;

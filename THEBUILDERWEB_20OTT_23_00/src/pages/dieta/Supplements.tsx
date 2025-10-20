import { DietBreadcrumbs } from "@/components/diet/DietBreadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileDown, Plus, FolderOpen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupplementsState } from "@/hooks/useSupplementsState";
import { SupplementsDatabase } from "@/components/supplements/SupplementsDatabase";
import { PlanEditor } from "@/components/supplements/PlanEditor";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Supplements = () => {
  const navigate = useNavigate();
  const {
    state,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    updatePlanInfo,
    updatePlanRow,
    savePlan,
    loadPlan,
    deletePlan,
    createNewPlan,
    clearPlan,
    exportPlan,
  } = useSupplementsState();

  const handleSavePlan = () => {
    if (!state.currentPlan?.name.trim()) {
      toast.error("Inserisci un nome per il piano");
      return;
    }
    savePlan();
    toast.success("Piano salvato con successo");
  };

  const handleLoadPlan = (planId: string) => {
    loadPlan(planId);
    toast.success("Piano caricato");
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo piano?")) {
      deletePlan(planId);
      toast.success("Piano eliminato");
    }
  };

  const handleExport = () => {
    if (!state.currentPlan?.name.trim()) {
      toast.error("Salva il piano prima di esportarlo");
      return;
    }
    exportPlan();
    toast.success("Piano esportato con successo");
  };

  const handleNewPlan = () => {
    createNewPlan();
    toast.success("Nuovo piano creato");
  };

  return (<>
    <DietBreadcrumbs current="Integrazioni" />
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dieta")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              {state.plans.length > 0 && (
                <Select onValueChange={handleLoadPlan}>
                  <SelectTrigger className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <SelectValue placeholder="Carica piano" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {state.plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleNewPlan}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Piano
              </Button>
              <Button variant="outline" size="sm" onClick={handleSavePlan}>
                <Save className="h-4 w-4 mr-2" />
                Salva Piano
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Esporta
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">
            Gestione <span className="text-primary">Integrazione</span>
          </h1>
          <p className="text-muted-foreground">
            Crea piani di integrazione professionali con timing giornaliero e database integratori personalizzabile.
          </p>
        </header>

        {state.currentPlan && (
          <PlanEditor
            plan={state.currentPlan}
            supplements={state.supplements}
            onUpdateInfo={updatePlanInfo}
            onUpdateRow={updatePlanRow}
            onClear={clearPlan}
          />
        )}

        <SupplementsDatabase
          supplements={state.supplements}
          onAdd={addSupplement}
          onUpdate={updateSupplement}
          onDelete={deleteSupplement}
        />

        {state.plans.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-3">Piani Salvati</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {state.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.rows.filter((r) => r.supplementId).length} integratori
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadPlan(plan.id)}
                      >
                        Carica
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  
  </>
);
};

export default Supplements;

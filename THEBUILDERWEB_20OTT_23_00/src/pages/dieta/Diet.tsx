import { DietBreadcrumbs } from "@/components/diet/DietBreadcrumbs";
import { TopBar } from "@/components/diet/TopBar";
import { ClientSection } from "@/components/diet/ClientSection";
import { TimingSection } from "@/components/diet/TimingSection";
import { MealCard } from "@/components/diet/MealCard";
import { MacroSummary } from "@/components/diet/MacroSummary";
import { useDietState } from "@/hooks/useDietState";
import { calculateMealTargets, calculateMealTotals } from "@/utils/dietCalculations";
import { MEAL_NAMES, getMealTag } from "@/utils/mealNames";
import { toast } from "sonner";
import { autofillMeal } from "@/utils/autofill";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Diet = () => {
  const navigate = useNavigate();
  const {
    state,
    updateClient,
    updateTotals,
    updateTiming,
    updateMealRow,
    clearMeal,
    clearAllMeals,
    resetAll,
    toggleEnforceSuitability,
    importState,
    setMeal,
    loadTimingTemplate,
  } = useDietState();

  const targets = calculateMealTargets(state.timing, state.totals);
  const totals = calculateMealTotals(state.meals, state.foods);
  
  const actualTotals = {
    carbs: totals.reduce((sum, t) => sum + t.c, 0),
    protein: totals.reduce((sum, t) => sum + t.p, 0),
    fat: totals.reduce((sum, t) => sum + t.f, 0),
  };

  const getFoodsForMeal = (mealIndex: number) => {
    if (!state.enforceSuitability) return state.foods;
    const tag = getMealTag(mealIndex);
    return state.foods.filter(
      (f) => !f.suitable.length || f.suitable.includes("any") || f.suitable.includes(tag)
    );
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu_${state.client.cognome || "cliente"}_${state.client.nome || ""}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Menu esportato con successo");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(String(e.target?.result || "{}"));
        importState(obj);
        toast.success("Menu importato con successo");
      } catch (err) {
        toast.error("File non valido");
      }
    };
    reader.readAsText(file);
  };

  const handleAutofill = () => {
    for (let i = 0; i < 6; i++) {
      const availableFoods = getFoodsForMeal(i);
      const meal = autofillMeal(i, targets[i], availableFoods);
      setMeal(i, meal);
    }
    toast.success("Menu automatico creato");
  };

  const handleClearMeals = () => {
    clearAllMeals();
    toast.success("Menu pasti cancellato");
  };

  const handleReset = () => {
    if (confirm("Sei sicuro di voler resettare tutti i dati?")) {
      resetAll();
      toast.success("Dati resettati");
    }
  };

  return (<>
    <DietBreadcrumbs current="Gestione Dieta" />
    <div className="min-h-screen bg-background">
      <TopBar
        onAutofill={handleAutofill}
        onClearMeals={handleClearMeals}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
        enforceSuitability={state.enforceSuitability}
        onToggleEnforce={toggleEnforceSuitability}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dieta")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Gestione <span className="text-primary">Dieta</span>
            </h1>
            <p className="text-muted-foreground">
              Crea e gestisci le diete personalizzate in stile The Builder Web.
            </p>
          </div>
        </header>

        <ClientSection
          client={state.client}
          totals={state.totals}
          onClientChange={updateClient}
          onTotalsChange={updateTotals}
        />

        <TimingSection
          timing={state.timing}
          targets={targets}
          onTimingChange={updateTiming}
          onLoadTemplate={loadTimingTemplate}
        />

        <MacroSummary target={state.totals} actual={actualTotals} />

        <div className="grid gap-6">
          {MEAL_NAMES.map((name, i) => (
            <MealCard
              key={i}
              name={name}
              target={targets[i]}
              total={totals[i]}
              rows={state.meals[i].rows}
              availableFoods={getFoodsForMeal(i)}
              onRowChange={(rowIndex, updates) => updateMealRow(i, rowIndex, updates)}
              onClear={() => clearMeal(i)}
            />
          ))}
        </div>

        <footer className="text-xs text-muted-foreground py-6 border-t border-border">
          * Calcolo kcal automatico: 4 kcal/g CHO, 4 kcal/g PRO, 9 kcal/g FAT. I valori degli
          alimenti sono tipici e coerenti con le tabelle CREA (2019) o medie comunemente reperibili
          su database pubblici per sportivi. Verifica sempre le etichette.
        </footer>
      </main>
    </div>
  
  </>
);
};

export default Diet;

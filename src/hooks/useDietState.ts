import { useState, useEffect } from "react";
import { DietState } from "@/types/diet";
import { DEFAULT_FOODS } from "@/data/defaultFoods";

const STORAGE_KEY = "menuPlannerState_v2";

const initialState: DietState = {
  client: { nome: "", cognome: "", peso: 0 },
  totals: { carbs: 0, protein: 0, fat: 0 },
  timing: Array.from({ length: 6 }, () => ({ cPerc: 0, pPerc: 0, fPerc: 0 })),
  foods: [...DEFAULT_FOODS],
  meals: Array.from({ length: 6 }, () => ({
    rows: Array.from({ length: 5 }, () => ({ foodId: "", grams: 0 })),
  })),
  enforceSuitability: true,
};

export const useDietState = () => {
  const [state, setState] = useState<DietState>(initialState);

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        const loaded = JSON.parse(s);
        setState((prev) => ({ ...prev, ...loaded }));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateClient = (updates: Partial<DietState["client"]>) => {
    setState((prev) => ({ ...prev, client: { ...prev.client, ...updates } }));
  };

  const updateTotals = (updates: Partial<DietState["totals"]>) => {
    setState((prev) => ({ ...prev, totals: { ...prev.totals, ...updates } }));
  };

  const updateTiming = (index: number, updates: Partial<DietState["timing"][0]>) => {
    setState((prev) => {
      const newTiming = [...prev.timing];
      newTiming[index] = { ...newTiming[index], ...updates };
      return { ...prev, timing: newTiming };
    });
  };

  const updateMealRow = (
    mealIndex: number,
    rowIndex: number,
    updates: Partial<DietState["meals"][0]["rows"][0]>
  ) => {
    setState((prev) => {
      const newMeals = [...prev.meals];
      const newRows = [...newMeals[mealIndex].rows];
      newRows[rowIndex] = { ...newRows[rowIndex], ...updates };
      newMeals[mealIndex] = { ...newMeals[mealIndex], rows: newRows };
      return { ...prev, meals: newMeals };
    });
  };

  const clearMeal = (index: number) => {
    setState((prev) => {
      const newMeals = [...prev.meals];
      newMeals[index] = {
        rows: Array.from({ length: 5 }, () => ({ foodId: "", grams: 0 })),
      };
      return { ...prev, meals: newMeals };
    });
  };

  const clearAllMeals = () => {
    setState((prev) => ({
      ...prev,
      meals: Array.from({ length: 6 }, () => ({
        rows: Array.from({ length: 5 }, () => ({ foodId: "", grams: 0 })),
      })),
    }));
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  const addFood = (food: DietState["foods"][0]) => {
    setState((prev) => ({ ...prev, foods: [...prev.foods, food] }));
  };

  const updateFood = (id: string, updates: Partial<DietState["foods"][0]>) => {
    setState((prev) => ({
      ...prev,
      foods: prev.foods.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const toggleEnforceSuitability = () => {
    setState((prev) => ({ ...prev, enforceSuitability: !prev.enforceSuitability }));
  };

  const importState = (newState: Partial<DietState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const setMeal = (index: number, meal: DietState["meals"][0]) => {
    setState((prev) => {
      const newMeals = [...prev.meals];
      newMeals[index] = meal;
      return { ...prev, meals: newMeals };
    });
  };

  // Timing Templates Management
  type TimingTemplate = { id: string; name: string; timing: typeof initialState.timing };
  const saveTimingTemplate = (template: TimingTemplate) => {
    const templates = getTimingTemplates();
    const existingIndex = templates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem("timingTemplates", JSON.stringify(templates));
  };

  const getTimingTemplates = (): TimingTemplate[] => {
    try {
      const stored = localStorage.getItem("timingTemplates");
      return stored ? (JSON.parse(stored) as TimingTemplate[]) : [];
    } catch {
      return [];
    }
  };

  const deleteTimingTemplate = (id: string) => {
    const templates = getTimingTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem("timingTemplates", JSON.stringify(filtered));
  };

  const loadTimingTemplate = (templateId: string) => {
    const templates = getTimingTemplates();
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setState((prev) => ({ ...prev, timing: template.timing }));
    }
  };

  return {
    state,
    updateClient,
    updateTotals,
    updateTiming,
    updateMealRow,
    clearMeal,
    clearAllMeals,
    resetAll,
    addFood,
    updateFood,
    toggleEnforceSuitability,
    importState,
    setMeal,
    saveTimingTemplate,
    getTimingTemplates,
    deleteTimingTemplate,
    loadTimingTemplate,
  };
};

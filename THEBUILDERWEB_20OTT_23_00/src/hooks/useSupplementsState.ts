import { useState, useEffect } from "react";
import { Supplement, SupplementPlan, SupplementRow, SupplementsState } from "@/types/supplements";
import { defaultSupplements } from "@/data/defaultSupplements";

const STORAGE_KEY = "supplements_state";

const createEmptyPlan = (): SupplementPlan => ({
  id: Date.now().toString(),
  name: "",
  clientName: "",
  rows: Array(6).fill(null).map(() => ({ supplementId: "", quantity: 0, timing: "" })),
});

const getInitialState = (): SupplementsState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse supplements state", e);
    }
  }
  return {
    supplements: defaultSupplements,
    plans: [],
    currentPlan: createEmptyPlan(),
  };
};

export const useSupplementsState = () => {
  const [state, setState] = useState<SupplementsState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addSupplement = (supplement: Omit<Supplement, "id">) => {
    const newSupplement: Supplement = {
      ...supplement,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      supplements: [...prev.supplements, newSupplement],
    }));
  };

  const updateSupplement = (id: string, updates: Partial<Supplement>) => {
    setState((prev) => ({
      ...prev,
      supplements: prev.supplements.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  };

  const deleteSupplement = (id: string) => {
    setState((prev) => ({
      ...prev,
      supplements: prev.supplements.filter((s) => s.id !== id),
    }));
  };

  const updatePlanInfo = (updates: Partial<Pick<SupplementPlan, "name" | "clientName">>) => {
    setState((prev) => ({
      ...prev,
      currentPlan: prev.currentPlan ? { ...prev.currentPlan, ...updates } : null,
    }));
  };

  const updatePlanRow = (rowIndex: number, updates: Partial<SupplementRow>) => {
    setState((prev) => {
      if (!prev.currentPlan) return prev;
      const newRows = [...prev.currentPlan.rows];
      newRows[rowIndex] = { ...newRows[rowIndex], ...updates };
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, rows: newRows },
      };
    });
  };

  const savePlan = () => {
    if (!state.currentPlan) return;
    
    setState((prev) => {
      const existingIndex = prev.plans.findIndex((p) => p.id === prev.currentPlan?.id);
      const newPlans = [...prev.plans];
      
      if (existingIndex >= 0) {
        newPlans[existingIndex] = prev.currentPlan!;
      } else {
        newPlans.push(prev.currentPlan!);
      }
      
      return { ...prev, plans: newPlans };
    });
  };

  const loadPlan = (planId: string) => {
    const plan = state.plans.find((p) => p.id === planId);
    if (plan) {
      setState((prev) => ({ ...prev, currentPlan: { ...plan } }));
    }
  };

  const deletePlan = (planId: string) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== planId),
    }));
  };

  const createNewPlan = () => {
    setState((prev) => ({ ...prev, currentPlan: createEmptyPlan() }));
  };

  const clearPlan = () => {
    setState((prev) => ({
      ...prev,
      currentPlan: prev.currentPlan ? { ...prev.currentPlan, rows: Array(6).fill(null).map(() => ({ supplementId: "", quantity: 0, timing: "" })) } : null,
    }));
  };

  const exportPlan = () => {
    if (!state.currentPlan) return;
    const data = JSON.stringify(state.currentPlan, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piano_integrazione_${state.currentPlan.clientName || "cliente"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
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
  };
};

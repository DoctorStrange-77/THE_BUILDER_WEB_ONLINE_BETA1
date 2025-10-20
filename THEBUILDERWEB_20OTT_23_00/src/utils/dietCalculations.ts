import { Food, Meal, TimingRow } from "@/types/diet";

export const kcalFrom = (c: number, p: number, f: number): number => 
  Math.round((c || 0) * 4 + (p || 0) * 4 + (f || 0) * 9);

export const clamp = (v: number, min = 0, max = 99999): number => 
  Math.min(Math.max(Number(v) || 0, min), max);

export const round5 = (v: number): number => 
  Math.round((v ?? 0) / 5) * 5;

export const toNumber = (v: unknown): number => {
  if (v === "" || v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : 0;
};

export const columnSums = (timing: TimingRow[]) => {
  const c = timing.reduce((sum, t) => sum + toNumber(t.cPerc), 0);
  const p = timing.reduce((sum, t) => sum + toNumber(t.pPerc), 0);
  const f = timing.reduce((sum, t) => sum + toNumber(t.fPerc), 0);
  return { c, p, f };
};

export const calculateMealTargets = (
  timing: TimingRow[],
  totals: { carbs: number; protein: number; fat: number }
) => {
  const cTot = toNumber(totals.carbs);
  const pTot = toNumber(totals.protein);
  const fTot = toNumber(totals.fat);
  
  return timing.map((t) => ({
    c: +(cTot * (toNumber(t.cPerc) / 100)).toFixed(1),
    p: +(pTot * (toNumber(t.pPerc) / 100)).toFixed(1),
    f: +(fTot * (toNumber(t.fPerc) / 100)).toFixed(1),
  }));
};

export const calculateMealTotals = (meals: Meal[], foods: Food[]) => {
  const foodMap = Object.fromEntries(foods.map((f) => [f.id, f]));
  
  return meals.map((m) => {
    const acc = m.rows.reduce(
      (a, r) => {
        const food = foodMap[r.foodId];
        if (!food || !r.grams) return a;
        const factor = toNumber(r.grams) / 100;
        a.c += food.carbs * factor;
        a.p += food.protein * factor;
        a.f += food.fat * factor;
        return a;
      },
      { c: 0, p: 0, f: 0 }
    );
    return { c: +acc.c.toFixed(1), p: +acc.p.toFixed(1), f: +acc.f.toFixed(1) };
  });
};

export interface Food {
  id: string;
  name: string;
  category: "carb" | "protein" | "fat" | "mixed";
  carbs: number;
  protein: number;
  fat: number;
  suitable: string[];
}

export interface MealRow {
  foodId: string;
  grams: number;
}

export interface Meal {
  rows: MealRow[];
}

export interface TimingRow {
  cPerc: number;
  pPerc: number;
  fPerc: number;
}

export interface ClientData {
  nome: string;
  cognome: string;
  peso: number;
}

export interface DietState {
  client: ClientData;
  totals: {
    carbs: number;
    protein: number;
    fat: number;
  };
  timing: TimingRow[];
  foods: Food[];
  meals: Meal[];
  enforceSuitability: boolean;
}

export interface Supplement {
  id: string;
  name: string;
  category: string;
  unit: string;
  notes?: string;
}

export interface SupplementRow {
  supplementId: string;
  quantity: number;
  timing: string;
}

export interface SupplementPlan {
  id: string;
  name: string;
  clientName: string;
  rows: SupplementRow[];
}

export interface SupplementsState {
  supplements: Supplement[];
  plans: SupplementPlan[];
  currentPlan: SupplementPlan | null;
}

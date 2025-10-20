export const MEAL_NAMES = [
  "Colazione",
  "1° Spuntino",
  "Pranzo",
  "2° Spuntino",
  "Cena",
  "Prenanna"
];

export const getMealTag = (idx: number): string => {
  if (idx === 0) return "breakfast";
  if (idx === 2) return "lunch";
  if (idx === 4) return "dinner";
  if (idx === 5) return "prenanna";
  return "snack";
};

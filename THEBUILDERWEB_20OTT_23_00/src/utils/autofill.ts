import { Food, Meal } from "@/types/diet";
import { getMealTag } from "./mealNames";
import { round5 } from "./dietCalculations";

const pickFrom = <T>(list: T[], pred: (item: T) => boolean): T | undefined =>
  list.find(pred) || list[0];

const pickCarb = (foods: Food[], carbTarget: number): Food | undefined => {
  if (carbTarget >= 50) return pickFrom(foods, (f) => ["riso", "riso_basmati"].includes(f.id));
  if (carbTarget >= 25) return pickFrom(foods, (f) => ["pasta", "pane"].includes(f.id));
  if (carbTarget >= 15)
    return pickFrom(foods, (f) => ["avena", "crema_riso", "banana"].includes(f.id));
  return foods[0];
};

const pickProtein = (foods: Food[], mealTag: string, fatRemaining: number): Food | undefined => {
  if (fatRemaining <= 6)
    return pickFrom(foods, (f) => ["pollo", "tacchino", "albumi", "skyr", "yog0"].includes(f.id));
  if (mealTag === "prenanna")
    return pickFrom(foods, (f) =>
      ["caseina", "skyr", "yog0", "fiocchi_latte_light"].includes(f.id)
    );
  return pickFrom(foods, (f) => ["bresaola", "tonno", "merluzzo"].includes(f.id));
};

const pickFat = (foods: Food[], mealTag: string): Food | undefined => {
  if (mealTag === "breakfast")
    return pickFrom(foods, (f) => ["burro_arachidi", "mandorle", "evoo"].includes(f.id));
  if (mealTag === "prenanna")
    return pickFrom(foods, (f) => ["mandorle", "dark90", "burro_mandorle"].includes(f.id));
  return pickFrom(foods, (f) => ["evoo", "tahini"].includes(f.id));
};

export const autofillMeal = (
  mealIndex: number,
  target: { c: number; p: number; f: number },
  availableFoods: Food[]
): Meal => {
  const carbFoods = availableFoods.filter((f) => f.category === "carb");
  const proteinFoods = availableFoods.filter((f) => f.category === "protein");
  const fatFoods = availableFoods.filter((f) => f.category === "fat");
  const mealTag = getMealTag(mealIndex);

  const carbFood = pickCarb(carbFoods, target.c);
  let gramsCarb = carbFood ? (target.c / (carbFood.carbs || 1)) * 100 : 0;
  
  const remP = Math.max(0, target.p - (gramsCarb / 100) * (carbFood?.protein || 0));
  let remF = Math.max(0, target.f - (gramsCarb / 100) * (carbFood?.fat || 0));

  const proteinFood = pickProtein(proteinFoods, mealTag, remF);
  let gramsProt = proteinFood ? (remP / (proteinFood.protein || 1)) * 100 : 0;
  remF = Math.max(0, remF - (gramsProt / 100) * (proteinFood?.fat || 0));

  const fatFood = pickFat(fatFoods, mealTag);
  let gramsFat = fatFood ? (remF / (fatFood.fat || 1)) * 100 : 0;

  gramsCarb = round5(gramsCarb);
  gramsProt = round5(gramsProt);
  gramsFat = round5(gramsFat);

  return {
    rows: [
      { foodId: carbFood?.id || "", grams: gramsCarb },
      { foodId: proteinFood?.id || "", grams: gramsProt },
      { foodId: fatFood?.id || "", grams: gramsFat },
      { foodId: "", grams: 0 },
      { foodId: "", grams: 0 },
    ],
  };
};

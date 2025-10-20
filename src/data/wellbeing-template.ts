export type Question = {
  id: string;
  label: string;
  help?: string;
};

export const stressQuestions: Question[] = [
  { id: "sleep_quality", label: "Qualità del sonno nelle ultime 4-6 settimane" },
  { id: "motivation", label: "Quanto ti senti motivato ad allenarti in questo periodo?" },
  { id: "program_adherence", label: "Aderenza agli allenamenti: da 1 a 10 quanto hai seguito il programma?" },
  { id: "nutrition_follow", label: "Aderenza alla nutrizione: da 1 a 10 quanto hai seguito i consigli nutrizionali?" },
  { id: "fatigue_general", label: "Livello di affaticamento generale nella vita quotidiana" },
  { id: "stress_weeks", label: "Quantità di stress durante il programma nelle ultime 4-6 settimane" },
  { id: "stress_recent", label: "Livello di stress negli ultimi giorni" },
];

export const sustainabilityQuestions: Question[] = [
  { id: "adherence", label: "Aderenza al programma nell'ultimo periodo" },
  { id: "enjoyment", label: "Quanto ti è piaciuto allenarti?" },
  { id: "time", label: "Disponibilità di tempo per allenarti" },
  { id: "energy", label: "Livelli energetici percepiti" },
];


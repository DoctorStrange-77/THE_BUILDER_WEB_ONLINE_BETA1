export interface Exercise {
  name: string;
  group: string;
  video: string;
}

export interface ProgressionWeek {
  set: string | null;
  reps: string | null;
  info: string | null;
}

export interface Progression {
  name: string;
  weeks: ProgressionWeek[];
  rest: string;
  note: string | null;
}

export interface Athlete {
  firstname: string;
  lastname: string;
  email: string;
  dob: string;
  id?: string;
  phone?: string;
  gender?: 'M' | 'F' | '';
  notes?: string;
}

export interface AnthropometricData {
  date: string;
  weight: number;
  height: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  legs?: number;
  bmr?: number;
  tdee?: number;
  activityLevel?: number;
}

export interface Anamnesis {
  medicalHistory?: string;
  injuries?: string;
  medications?: string;
  allergies?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  sleepQuality?: string;
  stressLevel?: number;
  trainingExperience?: string;
  goals?: string;
  preferredExercises?: string;
  dislikedExercises?: string;
  availableEquipment?: string;
  trainingFrequency?: number;
  notes?: string;
}

export interface StressScore {
  date: string;
  physicalStress: number;
  mentalStress: number;
  sleepQuality: number;
  recovery: number;
  totalScore: number;
  // Sezione 1: Informazioni Cronologiche
  dataInizioProgramma?: string;
  dataFineProgramma?: string;
  pesoInizio?: string;
  pesoFine?: string;
  // Sezione 2: Stress Score - Dettagli
  recuperoAllenamento?: number;
  adesioneAllenamento?: number;
  riduzionePeso?: number;
  riduzioneSerie?: number;
  affaticamentoGenerale?: number;
  stressDuratoProgramma?: number;
  stressOggiAllenamento?: number;
  // Sezione 4: Esercizi e Progressioni
  eserciziMiglioriProgressioni?: string;
  // Sezione 5: Note e Osservazioni
  noteOsservazioni?: string;
  // Dati grezzi completi
  rawData?: { [key: string]: any };
}

export interface SustainabilityScore {
  date: string;
  adherence: number;
  enjoyment: number;
  timeAvailability: number;
  energyLevels: number;
  totalScore: number;
  // Sezione 3: Sustainability Score - Dettagli
  adesioneUltimiPeriodi?: number;
  mancanzeMotivazionali?: number;
  disponibilitaTempo?: number;
  livelloEnergetico?: number;
  // Dati grezzi completi
  rawData?: { [key: string]: any };
}

export interface HistoricalWorkout {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  stimulusType: string[];
  volumePerMuscleGroup: { [key: string]: number };
  createdBy?: string;
  notes?: string;
}

export interface WorkoutDay {
  exercises: Exercise[];
  progression?: Progression;
}

export interface WorkoutPlan {
  athleteId: string;
  name: string;
  days: WorkoutDay[];
  createdAt: string;
}

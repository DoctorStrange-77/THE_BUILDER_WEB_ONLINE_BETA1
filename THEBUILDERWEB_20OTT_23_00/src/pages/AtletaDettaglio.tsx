import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Activity,
  History,
  Heart,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  FileText,
  Plus,
  Calculator,
  AlertCircle,
  BarChart3,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  Athlete,
  AnthropometricData,
  Anamnesis,
  StressScore,
  SustainabilityScore,
  HistoricalWorkout
} from "@/types";
import { toast } from "sonner";
import GoogleSheetsImporter from "@/components/GoogleSheetsImporter";

export default function AtletaDettaglio() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Stati per i dati dell'atleta
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [anthropometricHistory, setAnthropometricHistory] = useState<AnthropometricData[]>([]);
  const [currentAnthropometric, setCurrentAnthropometric] = useState<AnthropometricData>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    height: 0,
    activityLevel: 1.2,
  });
  const [anamnesis, setAnamnesis] = useState<Anamnesis>({});
  const [stressScores, setStressScores] = useState<StressScore[]>([]);
  const [sustainabilityScores, setSustainabilityScores] = useState<SustainabilityScore[]>([]);
  const [historicalWorkouts, setHistoricalWorkouts] = useState<HistoricalWorkout[]>([]);
  const [selectedRow, setSelectedRow] = useState<{ stress: StressScore; sustainability: SustainabilityScore | undefined; idx: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{firstname: string; lastname: string; email: string; phone?: string; dob: string; gender: 'M'|'F'|''}>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    dob: '',
    gender: ''
  });

  // Helper per estrarre valori descrittivi dai dati grezzi del questionario
  const normalize = (s: any): string =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const getRawFromSelected = (keywords: string[]): string | undefined => {
    if (!selectedRow?.stress?.rawData) return undefined;
    const rd = selectedRow.stress.rawData;
    const kw = keywords.map(normalize);
    for (const [k, v] of Object.entries(rd)) {
      const nk = normalize(k);
      if (kw.every(w => nk.includes(w))) {
        const value = typeof v === 'string' ? v.trim() : String(v ?? '').trim();
        if (value) return value;
      }
    }
    return undefined;
  };

  // Carica dati atleta da localStorage
  useEffect(() => {
    const loadAthleteData = () => {
      try {
        const athletesData = localStorage.getItem('athletes');
        if (athletesData) {
          const athletes: Athlete[] = JSON.parse(athletesData);
          const foundAthlete = athletes.find(a => a.id === id);
          if (foundAthlete) {
            setAthlete(foundAthlete);
            setEditForm({
              firstname: foundAthlete.firstname || '',
              lastname: foundAthlete.lastname || '',
              email: foundAthlete.email || '',
              phone: foundAthlete.phone || '',
              dob: (() => { try { const d=new Date(foundAthlete.dob); if(!isNaN(d.getTime())) return d.toISOString().slice(0,10); } catch{} return ''; })(),
              gender: foundAthlete.gender || ''
            });
          }
        }

        // Carica dati antropometrici
        const anthropometricKey = `athlete:${id}:anthropometric`;
        const anthropometricData = localStorage.getItem(anthropometricKey);
        if (anthropometricData) {
          setAnthropometricHistory(JSON.parse(anthropometricData));
        }

        // Carica anamnesi
        const anamnesisKey = `athlete:${id}:anamnesis`;
        const anamnesisData = localStorage.getItem(anamnesisKey);
        if (anamnesisData) {
          setAnamnesis(JSON.parse(anamnesisData));
        }

        // Carica stress scores
        const stressKey = `athlete:${id}:stress`;
        const stressData = localStorage.getItem(stressKey);
        if (stressData) {
          setStressScores(JSON.parse(stressData));
        }

        // Carica sustainability scores
        const sustainabilityKey = `athlete:${id}:sustainability`;
        const sustainabilityData = localStorage.getItem(sustainabilityKey);
        if (sustainabilityData) {
          setSustainabilityScores(JSON.parse(sustainabilityData));
        }

        // Carica storico workout
        const workoutsKey = `athlete:${id}:workouts`;
        const workoutsData = localStorage.getItem(workoutsKey);
        if (workoutsData) {
          setHistoricalWorkouts(JSON.parse(workoutsData));
        }
      } catch (error) {
        console.error('Errore nel caricamento dati atleta:', error);
      }
    };

    loadAthleteData();
  }, [id]);

  // Calcolo BMR (Mifflin-St Jeor)
  const calculateBMR = (weight: number, height: number, age: number, gender: 'M' | 'F' | ''): number => {
    if (!weight || !height || !age) return 0;

    if (gender === 'M') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'F') {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return 0;
  };

  // Calcolo TDEE
  const calculateTDEE = (bmr: number, activityLevel: number): number => {
    return bmr * activityLevel;
  };

  const handleOpenWorkout = (workoutId: string) => {
    try {
      localStorage.setItem('schede:auto-open-id', workoutId);
    } catch (error) {
      console.error('Impossibile salvare l\'ID della scheda da aprire:', error);
    }
    navigate('/schede', { state: { openSchedaId: workoutId, athlete } });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (!id) {
      toast.error('Impossibile eliminare il macrociclo: atleta non trovato');
      return;
    }

    const confirmed = window.confirm('Sei sicuro di voler eliminare questo macrociclo?');
    if (!confirmed) return;

    const updatedWorkouts = historicalWorkouts.filter((workout) => workout.id !== workoutId);
    setHistoricalWorkouts(updatedWorkouts);

    try {
      const workoutsKey = `athlete:${id}:workouts`;
      localStorage.setItem(workoutsKey, JSON.stringify(updatedWorkouts));
      toast.success('Macrociclo eliminato');
    } catch (error) {
      console.error('Errore durante l\'eliminazione del macrociclo:', error);
      toast.error('Errore nel salvataggio dei dati aggiornati');
    }
  };

  // Calcolo età
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Salva misure antropometriche
  const saveAnthropometricData = () => {
    if (!currentAnthropometric.weight || !currentAnthropometric.height) {
      toast.error('Inserisci almeno peso e altezza');
      return;
    }

    const age = calculateAge(athlete?.dob || '');
    const bmr = calculateBMR(
      currentAnthropometric.weight,
      currentAnthropometric.height,
      age,
      athlete?.gender || ''
    );
    const tdee = calculateTDEE(bmr, currentAnthropometric.activityLevel || 1.2);

    const newData: AnthropometricData = {
      ...currentAnthropometric,
      bmr,
      tdee,
    };

    const updatedHistory = [...anthropometricHistory, newData];
    setAnthropometricHistory(updatedHistory);

    const anthropometricKey = `athlete:${id}:anthropometric`;
    localStorage.setItem(anthropometricKey, JSON.stringify(updatedHistory));

    setCurrentAnthropometric({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      height: 0,
      activityLevel: 1.2,
    });

    toast.success('Misure salvate con successo');
  };

  const openEditPersonal = () => {
    if (!athlete) return;
    setEditForm({
      firstname: athlete.firstname || '',
      lastname: athlete.lastname || '',
      email: athlete.email || '',
      phone: athlete.phone || '',
      dob: (() => { try { const d=new Date(athlete.dob); if(!isNaN(d.getTime())) return d.toISOString().slice(0,10); } catch{} return ''; })(),
      gender: athlete.gender || ''
    });
    setIsEditPersonalOpen(true);
  };

  const savePersonalInfo = () => {
    if (!athlete?.id) return;
    try {
      const athletesData = localStorage.getItem('athletes');
      const arr: Athlete[] = athletesData ? JSON.parse(athletesData) : [];
      const updated: Athlete = { ...athlete, ...editForm };
      const next = arr.map(a => a.id === athlete.id ? updated : a);
      localStorage.setItem('athletes', JSON.stringify(next));
      setAthlete(updated);
      toast.success('Informazioni personali aggiornate');
      setIsEditPersonalOpen(false);
    } catch (e) {
      toast.error('Errore nel salvataggio delle informazioni');
    }
  };

  // Salva anamnesi
  const saveAnamnesis = () => {
    const anamnesisKey = `athlete:${id}:anamnesis`;
    localStorage.setItem(anamnesisKey, JSON.stringify(anamnesis));
    toast.success('Anamnesi salvata con successo');
  };

  // Calcola stress score medio
  const getLatestStressScore = (): number => {
    if (stressScores.length === 0) return 0;
    return stressScores[stressScores.length - 1].totalScore;
  };

  // Calcola sustainability score medio
  const getLatestSustainabilityScore = (): number => {
    if (sustainabilityScores.length === 0) return 0;
    return sustainabilityScores[sustainabilityScores.length - 1].totalScore;
  };

  // Gestione dati importati da Google Sheets
  const handleDataImported = (data: any) => {
    // Ricarica i dati dopo l'importazione
    const loadAthleteData = () => {
      try {
        // Ricarica stress scores
        const stressKey = `athlete:${id}:stress`;
        const stressData = localStorage.getItem(stressKey);
        if (stressData) {
          setStressScores(JSON.parse(stressData));
        }

        // Ricarica sustainability scores
        const sustainabilityKey = `athlete:${id}:sustainability`;
        const sustainabilityData = localStorage.getItem(sustainabilityKey);
        if (sustainabilityData) {
          setSustainabilityScores(JSON.parse(sustainabilityData));
        }
      } catch (error) {
        console.error('Errore nel caricamento dati importati:', error);
      }
    };

    loadAthleteData();
  };

  // Elimina solo i dati importati da Google Sheets
  const handleDeleteImportedData = () => {
    if (!id) return;

    // Conferma dall'utente
    const confirmed = window.confirm(
      '⚠️ ATTENZIONE!\n\n' +
      'Stai per eliminare i dati importati da Google Sheets:\n' +
      '- Stress Score\n' +
      '- Sustainability Score\n' +
      '- Cronologiche\n' +
      '- Affaticamento e progressioni\n' +
      '- Note e osservazioni\n\n' +
      'Le misure antropometriche, anamnesi e workout NON verranno eliminati.\n\n' +
      'Questa operazione NON può essere annullata!\n\n' +
      'Vuoi continuare?'
    );

    if (!confirmed) return;

    try {
      // Elimina SOLO i dati importati da Google Sheets
      const keysToDelete = [
        `athlete:${id}:stress`,
        `athlete:${id}:sustainability`,
        `athlete:${id}:cronologiche`,
        `athlete:${id}:affaticamento`,
        `athlete:${id}:note`,
      ];

      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      // Reset degli stati SOLO per i dati importati
      setStressScores([]);
      setSustainabilityScores([]);

      toast.success('Dati importati eliminati con successo! Puoi ora re-importare dal Google Sheet.');
    } catch (error) {
      console.error('Errore durante l\'eliminazione dei dati:', error);
      toast.error('Errore durante l\'eliminazione dei dati');
    }
  };

  // Ottieni ultima misurazione
  const getLatestAnthropometric = (): AnthropometricData | null => {
    if (anthropometricHistory.length === 0) return null;
    return anthropometricHistory[anthropometricHistory.length - 1];
  };

  // Interpreta stress score
  const interpretStressScore = (score: number): { label: string; color: string; recommendation: string } => {
    if (score >= 8) return {
      label: 'ALTO STRESS',
      color: 'destructive',
      recommendation: 'Ridurre volume e intensità. Focus su recupero attivo.'
    };
    if (score >= 5) return {
      label: 'STRESS MODERATO',
      color: 'warning',
      recommendation: 'Mantenere volume moderato. Monitorare recupero.'
    };
    return {
      label: 'STRESS BASSO',
      color: 'default',
      recommendation: 'Buon momento per incrementare stimoli allenanti.'
    };
  };

  // Interpreta sustainability score
  const interpretSustainabilityScore = (score: number): { label: string; color: string } => {
    if (score >= 8) return { label: 'OTTIMA SOSTENIBILITÀ', color: 'default' };
    if (score >= 5) return { label: 'SOSTENIBILITÀ MEDIA', color: 'warning' };
    return { label: 'BASSA SOSTENIBILITÀ', color: 'destructive' };
  };

  if (!athlete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Atleta non trovato</h3>
            <Button onClick={() => navigate('/atleti')} className="mt-4">
              Torna alla lista atleti
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestAnthropometric = getLatestAnthropometric();
  const stressScore = getLatestStressScore();
  const sustainabilityScore = getLatestSustainabilityScore();
  const stressInterpretation = interpretStressScore(stressScore);
  const sustainabilityInterpretation = interpretSustainabilityScore(sustainabilityScore);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/atleti">Atleti</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{athlete.firstname} {athlete.lastname}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/atleti')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {athlete.firstname} {athlete.lastname}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestione completa atleta e storico allenamenti
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteImportedData}
            className="h-9"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina Dati Importati
          </Button>
          <GoogleSheetsImporter athleteId={id || ''} onDataImported={handleDataImported} />
          <Button
            onClick={() => navigate('/schede', { state: { athlete } })}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Macrociclo
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Età</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAge(athlete.dob)} anni</div>
            <p className="text-xs text-muted-foreground">
              {new Date(athlete.dob).toLocaleDateString('it-IT')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Attuale</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAnthropometric?.weight || '-'} {latestAnthropometric?.weight && 'kg'}
            </div>
            <p className="text-xs text-muted-foreground">
              BMR: {latestAnthropometric?.bmr?.toFixed(0) || '-'} kcal | TDEE: {latestAnthropometric?.tdee?.toFixed(0) || '-'} kcal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stressScore.toFixed(1)}/10</div>
              <Badge variant={stressInterpretation.color as any}>{stressInterpretation.label}</Badge>
            </div>
            <Progress value={stressScore * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sostenibilità</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{sustainabilityScore.toFixed(1)}/10</div>
              <Badge variant={sustainabilityInterpretation.color as any}>{sustainabilityInterpretation.label}</Badge>
            </div>
            <Progress value={sustainabilityScore * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Raccomandazione basata su stress */}
      {stressScore > 0 && (
        <Card className="border-l-4" style={{ borderLeftColor: stressScore >= 8 ? 'hsl(var(--destructive))' : stressScore >= 5 ? 'hsl(var(--warning))' : 'hsl(var(--primary))' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Raccomandazione Programmazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{stressInterpretation.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs principali */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="history">Storico Macrocicli</TabsTrigger>
          <TabsTrigger value="anthropometric">Misure</TabsTrigger>
          <TabsTrigger value="anamnesis">Anamnesi</TabsTrigger>
          <TabsTrigger value="scores">Score & Valutazione</TabsTrigger>
        </TabsList>

        {/* Tab Panoramica */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informazioni Personali
                  </CardTitle>
                  {athlete && (
                    <Button size="sm" variant="outline" onClick={openEditPersonal}>Modifica</Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{athlete.email || 'Non specificata'}</span>
                </div>
                {athlete.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{athlete.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(athlete.dob).toLocaleDateString('it-IT')} ({calculateAge(athlete.dob)} anni)
                  </span>
                </div>
                  {athlete.gender && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{athlete.gender === 'M' ? 'Maschio' : 'Femmina'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ultime Misure
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestAnthropometric ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">{new Date(latestAnthropometric.date).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="font-medium">{latestAnthropometric.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Altezza:</span>
                      <span className="font-medium">{latestAnthropometric.height} cm</span>
                    </div>
                    {latestAnthropometric.bodyFat && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">BF%:</span>
                        <span className="font-medium">{latestAnthropometric.bodyFat}%</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">BMR:</span>
                      <span className="font-medium">{latestAnthropometric.bmr?.toFixed(0)} kcal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TDEE:</span>
                      <span className="font-medium">{latestAnthropometric.tdee?.toFixed(0)} kcal</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nessuna misurazione disponibile</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Obiettivi e Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {anamnesis.goals || 'Nessun obiettivo specificato'}
              </p>
              {athlete.notes && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {athlete.notes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Storico Macrocicli */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Storico Macrocicli e Programmazione
                  </CardTitle>
                  <CardDescription>
                    Visualizza tutti i programmi di allenamento creati per questo atleta
                  </CardDescription>
                </div>
                <Button onClick={() => navigate('/schede', { state: { athlete } })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historicalWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Nessun macrociclo trovato</p>
                  <Button className="mt-4" onClick={() => navigate('/schede', { state: { athlete } })}>
                    Crea il primo macrociclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {historicalWorkouts.map((workout) => (
                    <Card
                      key={workout.id}
                      className="hover:border-primary/50 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{workout.name}</CardTitle>
                            <CardDescription>
                              {new Date(workout.startDate).toLocaleDateString('it-IT')} - {new Date(workout.endDate).toLocaleDateString('it-IT')}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 min-w-[150px]">
                            <Badge>{workout.duration} settimane</Badge>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenWorkout(workout.id)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Apri
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteWorkout(workout.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Elimina
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Tipi di stimolo: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {workout.stimulusType.map((type, idx) => (
                                <Badge key={idx} variant="outline">{type}</Badge>
                              ))}
                            </div>
                          </div>
                          {workout.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{workout.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Misure Antropometriche */}
        <TabsContent value="anthropometric" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Nuova Misurazione
              </CardTitle>
              <CardDescription>
                Inserisci le misure corporee e calcola BMR e TDEE
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Data Misurazione</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentAnthropometric.date}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={currentAnthropometric.weight || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altezza (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    value={currentAnthropometric.height || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, height: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={currentAnthropometric.bodyFat || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, bodyFat: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Girovita (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    value={currentAnthropometric.waist || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, waist: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Torace (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    value={currentAnthropometric.chest || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, chest: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Braccia (cm)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.1"
                    value={currentAnthropometric.arms || ''}
                    onChange={(e) => setCurrentAnthropometric({ ...currentAnthropometric, arms: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel">Livello di Attività</Label>
                <Select
                  value={currentAnthropometric.activityLevel?.toString()}
                  onValueChange={(v) => setCurrentAnthropometric({ ...currentAnthropometric, activityLevel: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">Sedentario (poco o nessun esercizio)</SelectItem>
                    <SelectItem value="1.375">Leggermente attivo (1-3 giorni/settimana)</SelectItem>
                    <SelectItem value="1.55">Moderatamente attivo (3-5 giorni/settimana)</SelectItem>
                    <SelectItem value="1.725">Molto attivo (6-7 giorni/settimana)</SelectItem>
                    <SelectItem value="1.9">Estremamente attivo (allenamento intenso quotidiano)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveAnthropometricData} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Salva Misurazione
              </Button>
            </CardContent>
          </Card>

          {/* Storico misure */}
          <Card>
            <CardHeader>
              <CardTitle>Storico Misurazioni</CardTitle>
            </CardHeader>
            <CardContent>
              {anthropometricHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nessuna misurazione salvata</p>
              ) : (
                <div className="space-y-4">
                  {anthropometricHistory.slice().reverse().map((data, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="grid gap-2 md:grid-cols-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Data</span>
                            <p className="font-medium">{new Date(data.date).toLocaleDateString('it-IT')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Peso</span>
                            <p className="font-medium">{data.weight} kg</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">BMR</span>
                            <p className="font-medium">{data.bmr?.toFixed(0)} kcal</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">TDEE</span>
                            <p className="font-medium">{data.tdee?.toFixed(0)} kcal</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Anamnesi */}
        <TabsContent value="anamnesis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anamnesi Completa</CardTitle>
              <CardDescription>
                Compila l'anamnesi dell'atleta per una programmazione personalizzata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Obiettivi</Label>
                <Textarea
                  id="goals"
                  value={anamnesis.goals || ''}
                  onChange={(e) => setAnamnesis({ ...anamnesis, goals: e.target.value })}
                  placeholder="Es: Ipertrofia muscolare, perdita di peso, miglioramento performance..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingExperience">Esperienza di Allenamento</Label>
                <Textarea
                  id="trainingExperience"
                  value={anamnesis.trainingExperience || ''}
                  onChange={(e) => setAnamnesis({ ...anamnesis, trainingExperience: e.target.value })}
                  placeholder="Descrivi l'esperienza di allenamento dell'atleta..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Storia Medica</Label>
                  <Textarea
                    id="medicalHistory"
                    value={anamnesis.medicalHistory || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, medicalHistory: e.target.value })}
                    placeholder="Patologie, condizioni mediche rilevanti..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="injuries">Infortuni</Label>
                  <Textarea
                    id="injuries"
                    value={anamnesis.injuries || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, injuries: e.target.value })}
                    placeholder="Infortuni passati o attuali..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="medications">Farmaci</Label>
                  <Input
                    id="medications"
                    value={anamnesis.medications || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, medications: e.target.value })}
                    placeholder="Farmaci assunti regolarmente..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergie</Label>
                  <Input
                    id="allergies"
                    value={anamnesis.allergies || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, allergies: e.target.value })}
                    placeholder="Allergie note..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sleepQuality">Qualità del Sonno</Label>
                  <Select
                    value={anamnesis.sleepQuality}
                    onValueChange={(v) => setAnamnesis({ ...anamnesis, sleepQuality: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Eccellente</SelectItem>
                      <SelectItem value="good">Buona</SelectItem>
                      <SelectItem value="fair">Discreta</SelectItem>
                      <SelectItem value="poor">Scarsa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smokingStatus">Fumo</Label>
                  <Select
                    value={anamnesis.smokingStatus}
                    onValueChange={(v) => setAnamnesis({ ...anamnesis, smokingStatus: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-smoker">Non fumatore</SelectItem>
                      <SelectItem value="ex-smoker">Ex fumatore</SelectItem>
                      <SelectItem value="occasional">Occasionale</SelectItem>
                      <SelectItem value="regular">Regolare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alcoholConsumption">Consumo Alcol</Label>
                  <Select
                    value={anamnesis.alcoholConsumption}
                    onValueChange={(v) => setAnamnesis({ ...anamnesis, alcoholConsumption: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      <SelectItem value="occasional">Occasionale</SelectItem>
                      <SelectItem value="moderate">Moderato</SelectItem>
                      <SelectItem value="frequent">Frequente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredExercises">Esercizi Preferiti</Label>
                  <Textarea
                    id="preferredExercises"
                    value={anamnesis.preferredExercises || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, preferredExercises: e.target.value })}
                    placeholder="Es: Squat, Panca piana..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dislikedExercises">Esercizi da Evitare</Label>
                  <Textarea
                    id="dislikedExercises"
                    value={anamnesis.dislikedExercises || ''}
                    onChange={(e) => setAnamnesis({ ...anamnesis, dislikedExercises: e.target.value })}
                    placeholder="Es: Stacchi, Corsa..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableEquipment">Attrezzatura Disponibile</Label>
                <Textarea
                  id="availableEquipment"
                  value={anamnesis.availableEquipment || ''}
                  onChange={(e) => setAnamnesis({ ...anamnesis, availableEquipment: e.target.value })}
                  placeholder="Es: Bilanciere, manubri, macchinari, home gym..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anamnesisNotes">Note Aggiuntive</Label>
                <Textarea
                  id="anamnesisNotes"
                  value={anamnesis.notes || ''}
                  onChange={(e) => setAnamnesis({ ...anamnesis, notes: e.target.value })}
                  placeholder="Altre informazioni rilevanti..."
                  rows={3}
                />
              </div>

              <Button onClick={saveAnamnesis} className="w-full">
                Salva Anamnesi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Score & Valutazione */}
        <TabsContent value="scores" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Stress Score
                </CardTitle>
                <CardDescription>
                  Valuta il livello di stress dell'atleta per adattare lo stimolo allenante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-4xl font-bold mb-2">{stressScore.toFixed(1)}/10</div>
                  <Badge variant={stressInterpretation.color as any} className="mb-4">
                    {stressInterpretation.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {stressInterpretation.recommendation}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lo Stress Score tiene conto di stress fisico, mentale, qualità del sonno e recupero.
                  Un punteggio alto indica la necessità di ridurre il carico allenante.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sustainability Score
                </CardTitle>
                <CardDescription>
                  Misura la sostenibilità del programma di allenamento nel lungo termine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-4xl font-bold mb-2">{sustainabilityScore.toFixed(1)}/10</div>
                  <Badge variant={sustainabilityInterpretation.color as any}>
                    {sustainabilityInterpretation.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Il Sustainability Score valuta aderenza, piacere, disponibilità di tempo e livelli energetici.
                  Un punteggio basso richiede una revisione del programma per migliorare la compliance.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Come Interpretare gli Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Stress Score (0-10)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li><strong>0-4:</strong> Stress basso - Momento ideale per aumentare volume e intensità</li>
                  <li><strong>5-7:</strong> Stress moderato - Mantenere carichi attuali, monitorare recupero</li>
                  <li><strong>8-10:</strong> Stress alto - Ridurre volume, focus su recupero attivo e deload</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-2">Sustainability Score (0-10)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li><strong>0-4:</strong> Bassa sostenibilità - Rivedere frequenza e volume allenamento</li>
                  <li><strong>5-7:</strong> Sostenibilità media - Buona compliance, possibile ottimizzazione</li>
                  <li><strong>8-10:</strong> Alta sostenibilità - Programma ben tollerato e sostenibile</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Importazione dati da Google Sheets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Importazione Dati</CardTitle>
              <CardDescription>Importa dati da Google Sheets per popolare automaticamente le sezioni.</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSheetsImporter athleteId={id || ''} onDataImported={handleDataImported} />
              <p className="text-xs text-muted-foreground mt-3">
                Puoi importare dati per: Informazioni Cronologiche, Affaticamento e Progressioni, Note e Osservazioni, Stress Score e Sustainability Score.
              </p>
            </CardContent>
          </Card>

          {/* Storico Dati Importati */}
          {(stressScores.length > 0 || sustainabilityScores.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Storico Inserimenti
                </CardTitle>
                <CardDescription>
                  Visualizza tutti i dati importati dal questionario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ultimi inserimenti */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Ultimo Stress Score</h4>
                    {stressScores.length > 0 && (
                      <div>
                        <div className="text-2xl font-bold">{stressScores[stressScores.length - 1].totalScore.toFixed(1)}/10</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(stressScores[stressScores.length - 1].date).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Ultimo Sustainability Score</h4>
                    {sustainabilityScores.length > 0 && (
                      <div>
                        <div className="text-2xl font-bold">{sustainabilityScores[sustainabilityScores.length - 1].totalScore.toFixed(1)}/10</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sustainabilityScores[sustainabilityScores.length - 1].date).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabella con tutti gli inserimenti */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    Tutti gli Inserimenti ({stressScores.filter(s => !isNaN(new Date(s.date).getTime())).length})
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-semibold">Data/Ora</th>
                            <th className="text-center p-2 font-semibold">Stress Score</th>
                            <th className="text-center p-2 font-semibold">Sustainability Score</th>
                            <th className="text-center p-2 font-semibold">Qualità Sonno</th>
                            <th className="text-center p-2 font-semibold">Recupero</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stressScores
                            .map((stress, idx) => {
                              const sustainability = sustainabilityScores[idx];
                              return { stress, sustainability, idx };
                            })
                            .filter(({ stress }) => !isNaN(new Date(stress.date).getTime()))
                            .reverse()
                            .map(({ stress, sustainability, idx }, displayIdx) => {
                              const dateObj = new Date(stress.date);

                              return (
                                <tr
                                  key={idx}
                                  className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedRow({ stress, sustainability, idx });
                                    setIsDialogOpen(true);
                                  }}
                                >
                                    <td className="p-2">
                                      {dateObj.toLocaleDateString('it-IT', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                    <td className="text-center p-2">
                                      <Badge variant={stress.totalScore >= 8 ? 'destructive' : stress.totalScore >= 5 ? 'default' : 'outline'}>
                                        {stress.totalScore.toFixed(1)}/10
                                      </Badge>
                                    </td>
                                    <td className="text-center p-2">
                                      <Badge variant={sustainability?.totalScore >= 8 ? 'default' : sustainability?.totalScore >= 5 ? 'outline' : 'destructive'}>
                                        {sustainability?.totalScore.toFixed(1) || '-'}/10
                                      </Badge>
                                    </td>
                                    <td className="text-center p-2">{stress.sleepQuality}/10</td>
                                    <td className="text-center p-2">{stress.recovery}/10</td>
                                  </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Dialog (Popup) per visualizzare i dettagli completi */}
                {selectedRow && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                          Dettagli Questionario Completo
                        </DialogTitle>
                        <DialogDescription className="text-base">
                          {new Date(selectedRow.stress.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Sezione 1: Informazioni Cronologiche */}
                        {(selectedRow.stress.dataInizioProgramma || selectedRow.stress.dataFineProgramma || selectedRow.stress.pesoInizio || selectedRow.stress.pesoFine) && (
                          <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                📅 Sezione 1 - Informazioni Cronologiche
                              </CardTitle>
                            </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Data Inizio Programma:</span>
                                    <span className="font-medium">{selectedRow.stress.dataInizioProgramma || getRawFromSelected(['data','inzio','programma']) || getRawFromSelected(['data','inizio','programma']) || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Data Fine Programma:</span>
                                    <span className="font-medium">{selectedRow.stress.dataFineProgramma || getRawFromSelected(['data','fine','programma']) || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Peso Inizio:</span>
                                    <span className="font-medium">{selectedRow.stress.pesoInizio || getRawFromSelected(['peso','inizio']) || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Peso Fine:</span>
                                    <span className="font-medium">{selectedRow.stress.pesoFine || getRawFromSelected(['peso','fine']) || '-'}</span>
                                  </div>
                                </div>
                              </CardContent>
                          </Card>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Sezione 2: Stress Score */}
                          <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Sezione 2 - Stress Score
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qualità del Sonno:</span>
                                <span className="font-semibold">{selectedRow.stress.sleepQuality}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Recupero:</span>
                                <span className="font-semibold">{selectedRow.stress.recovery}/10</span>
                              </div>
                              {selectedRow.stress.adesioneAllenamento !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Adesione Allenamento:</span>
                                  <span className="font-semibold">{selectedRow.stress.adesioneAllenamento}/10</span>
                                </div>
                              )}
                              {selectedRow.stress.riduzionePeso !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Riduzione Peso:</span>
                                  <span className="font-semibold">{selectedRow.stress.riduzionePeso}/10</span>
                                </div>
                              )}
                              {selectedRow.stress.riduzioneSerie !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Riduzione Serie:</span>
                                  <span className="font-semibold">{selectedRow.stress.riduzioneSerie}/10</span>
                                </div>
                              )}
                              {selectedRow.stress.affaticamentoGenerale !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Affaticamento Generale:</span>
                                  <span className="font-semibold">{selectedRow.stress.affaticamentoGenerale}/10</span>
                                </div>
                              )}
                              {selectedRow.stress.stressDuratoProgramma !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stress Durato Programma:</span>
                                  <span className="font-semibold">{selectedRow.stress.stressDuratoProgramma}/10</span>
                                </div>
                              )}
                              {selectedRow.stress.stressOggiAllenamento !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stress Oggi Allenamento:</span>
                                  <span className="font-semibold">{selectedRow.stress.stressOggiAllenamento}/10</span>
                                </div>
                              )}
                              <Separator className="my-3" />
                              <div className="flex justify-between text-base">
                                <span className="font-semibold">Totale Stress Score:</span>
                                <Badge variant={selectedRow.stress.totalScore >= 8 ? 'destructive' : selectedRow.stress.totalScore >= 5 ? 'default' : 'outline'} className="text-base px-3">
                                  {selectedRow.stress.totalScore.toFixed(1)}/10
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Sezione 3: Sustainability Score */}
                          <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Sezione 3 - Sustainability Score
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              {selectedRow.sustainability && (
                                <>
                                  {selectedRow.sustainability.adesioneUltimiPeriodi !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Adesione Ultimi Periodi:</span>
                                      <span className="font-semibold">{selectedRow.sustainability.adesioneUltimiPeriodi}/10</span>
                                    </div>
                                  )}
                                  {selectedRow.sustainability.mancanzeMotivazionali !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Mancanze Motivazionali:</span>
                                      <span className="font-semibold">{selectedRow.sustainability.mancanzeMotivazionali}/10</span>
                                    </div>
                                  )}
                                  {selectedRow.sustainability.disponibilitaTempo !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Disponibilità Tempo:</span>
                                      <span className="font-semibold">{selectedRow.sustainability.disponibilitaTempo}/10</span>
                                    </div>
                                  )}
                                  {selectedRow.sustainability.livelloEnergetico !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Livello Energetico:</span>
                                      <span className="font-semibold">{selectedRow.sustainability.livelloEnergetico}/10</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Aderenza:</span>
                                    <span className="font-semibold">{selectedRow.sustainability.adherence}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Piacere:</span>
                                    <span className="font-semibold">{selectedRow.sustainability.enjoyment.toFixed(1)}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Disponibilità Tempo:</span>
                                    <span className="font-semibold">{selectedRow.sustainability.timeAvailability}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Livelli Energetici:</span>
                                    <span className="font-semibold">{selectedRow.sustainability.energyLevels}/10</span>
                                  </div>
                                  <Separator className="my-3" />
                                  <div className="flex justify-between text-base">
                                    <span className="font-semibold">Totale Sustainability Score:</span>
                                    <Badge variant={selectedRow.sustainability.totalScore >= 8 ? 'default' : selectedRow.sustainability.totalScore >= 5 ? 'outline' : 'destructive'} className="text-base px-3">
                                      {selectedRow.sustainability.totalScore.toFixed(1)}/10
                                    </Badge>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Sezione 4: Esercizi con migliori progressioni */}
                          {true && (
                          <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Dumbbell className="h-5 w-5" />
                                💪 Sezione 4 - Esercizi con Migliori Progressioni
                              </CardTitle>
                            </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{(selectedRow.stress.eserciziMiglioriProgressioni && selectedRow.stress.eserciziMiglioriProgressioni.trim().length > 0) ? selectedRow.stress.eserciziMiglioriProgressioni : 'Nulla di rilevante'}</p>
                            <Separator className="my-3" />
                            <div className="space-y-2">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MUSCOLI PIÙ AFFATICATI IN QUESTA PROGRAMMAZIONE:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['muscoli','piu','affaticati','programmazion']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">ESERCIZI CON MINORI PROGRESSI DI CARICO IN QUESTA PROGRAMMAZIONE:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['esercizi','minori','progressi','carico']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MUSCOLI MENO AFFATICATI IN QUESTA PROGRAMMAZIONE:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['muscoli','meno','affaticati','programmazion']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">QUAL È LA SEDUTA DEL PROGRAMMA CHE PERCEPISCI COME LA PIÙ PESANTE IN ASSOLUTO:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['seduta','piu','pesante']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">QUAL È LA SEDUTA DEL PROGRAMMA TI PIACE PIU' IN ASSOLUTO:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['seduta','piace','piu']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">QUALI SONO GLI ESERCIZI CHE TROVI PIÙ FATICOSI, TASSANTI O CHE NON GRADISCI PARTICOLARMENTE IN QUESTO PROGRAMMA?</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['esercizi','piu','faticosi']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">CI SONO ESERCIZI IN CUI PERCEPISCI UNA PERDITA DI FORZA?</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['esercizi','perdita','forza']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">NEL PROSSIMO PROGRAMMA HAI ESIGENZE SPECIFICHE SUL NUMERO DI ALLENAMENTI SETTIMANALI?</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['prossimo','programma','allenamenti','settimanali']) ?? '-'}</span>
                              </div>
                            </div>
                          </CardContent>
                          </Card>
                        )}

                        {/* Sezione 5: Note e Osservazioni */}
                          {true && (
                          <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                📝 Sezione 5 - Note e Osservazioni
                              </CardTitle>
                            </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{(selectedRow.stress.noteOsservazioni && selectedRow.stress.noteOsservazioni.trim().length > 0) ? selectedRow.stress.noteOsservazioni : 'Nulla di rilevante'}</p>
                            <Separator className="my-3" />
                            <div className="space-y-2">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Note aggiuntive Workout:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['note','aggiuntive','workout']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Note aggiuntive Salute e Alimentazione:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['note','aggiuntive','salute']) ?? getRawFromSelected(['note','aggiuntive','alimentazione']) ?? '-'}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Note aggiuntive Generali:</span>
                                <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{getRawFromSelected(['note','aggiuntive','generali']) ?? '-'}</span>
                              </div>
                            </div>
                          </CardContent>
                          </Card>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Statistiche */}
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Media Stress Score</div>
                    <div className="text-lg font-bold">
                      {(() => {
                        const validScores = stressScores.filter(s => !isNaN(new Date(s.date).getTime()));
                        return validScores.length > 0
                          ? (validScores.reduce((acc, s) => acc + s.totalScore, 0) / validScores.length).toFixed(1)
                          : '0.0';
                      })()}/10
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Media Sustainability</div>
                    <div className="text-lg font-bold">
                      {(() => {
                        const validScores = sustainabilityScores.filter(s => !isNaN(new Date(s.date).getTime()));
                        return validScores.length > 0
                          ? (validScores.reduce((acc, s) => acc + s.totalScore, 0) / validScores.length).toFixed(1)
                          : '0.0';
                      })()}/10
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Totale Inserimenti</div>
                    <div className="text-lg font-bold">
                      {stressScores.filter(s => !isNaN(new Date(s.date).getTime())).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      {/* Dialog: Modifica Informazioni Personali */}
      <Dialog open={isEditPersonalOpen} onOpenChange={setIsEditPersonalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Informazioni Personali</DialogTitle>
            <DialogDescription>Aggiorna i dati dell'atleta</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome</Label>
                <Input value={editForm.firstname} onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })} />
              </div>
              <div>
                <Label>Cognome</Label>
                <Input value={editForm.lastname} onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefono</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data di nascita</Label>
                <Input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
              </div>
              <div>
                <Label>Genere</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                >
                  <option value="">Non specificato</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditPersonalOpen(false)}>Annulla</Button>
              <Button onClick={savePersonalInfo}>Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

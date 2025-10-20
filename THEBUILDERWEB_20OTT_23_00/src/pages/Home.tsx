import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Dumbbell, TrendingUp, Target, Apple, Columns, MoveRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Action = { title: string; description: string; icon: any; href: string; gradient?: string };

const gestione: Action[] = [
  { title: "Gestisci Atleti", description: "Visualizza e gestisci i tuoi atleti", icon: Users, href: "/atleti", gradient: "from-primary to-secondary" },
  { title: "Crea Scheda", description: "Genera nuove schede di allenamento", icon: ClipboardList, href: "/schede", gradient: "from-secondary to-primary" },
  { title: "Database Esercizi", description: "Esplora il database completo", icon: Dumbbell, href: "/esercizi", gradient: "from-primary via-secondary to-primary" },
  { title: "Progressioni", description: "Gestisci le progressioni di allenamento", icon: TrendingUp, href: "/progressioni", gradient: "from-secondary via-primary to-secondary" },
];

const strumenti: Action[] = [
  { title: "Distretti", description: "Gestisci i distretti muscolari", icon: Target, href: "/distretti" },
  { title: "Dieta", description: "Strumenti per alimentazione e timing", icon: Apple, href: "/dieta" },
  { title: "Template Split", description: "Crea rapidamente split e progressioni", icon: Columns, href: "/template-split" },
];

function HomeActionCard({ a }: { a: Action }) {
  const Icon = a.icon;
  return (
    <Link to={a.href} className="block">
      <Card className="group relative h-full overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.gradient ?? "from-primary/20 to-secondary/20"} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        <CardHeader className="relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{a.title}</CardTitle>
              <CardDescription className="mt-1">{a.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
        <CardContent className="py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">
                Benvenuto in <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">The Builder Web</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Crea, gestisci e monitora programmi di allenamento con strumenti pensati per professionisti.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/schede')} className="gap-2">
                Crea Scheda
                <MoveRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/atleti')} className="gap-2">
                Gestisci Atleti
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Gestione */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Gestione</h2>
          <Link to="/atleti" className="text-sm text-primary hover:underline">Vai agli Atleti</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {gestione.map((a) => (
            <HomeActionCard key={a.title} a={a} />
          ))}
        </div>
      </div>

      {/* Sezione Strumenti */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Strumenti</h2>
          <Link to="/dieta" className="text-sm text-primary hover:underline">Apri sezione Dieta</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {strumenti.map((a) => (
            <HomeActionCard key={a.title} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

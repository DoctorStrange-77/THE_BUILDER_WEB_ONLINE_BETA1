import { DietBreadcrumbs } from "@/components/diet/DietBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Clock, Database, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Gestione Dieta",
      description: "Crea e gestisci diete personalizzate per i tuoi atleti con calcolo automatico dei macronutrienti",
      icon: UtensilsCrossed,
      path: "/dieta/diet",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Gestione Integrazione",
      description: "Crea piani di integrazione professionali con timing giornaliero e database integratori",
      icon: Pill,
      path: "/dieta/supplements",
      gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      title: "Gestione Timing",
      description: "Crea template di timing per i macronutrienti da utilizzare nelle diete dei tuoi clienti",
      icon: Clock,
      path: "/dieta/timing-templates",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "Tabella Alimentare",
      description: "Gestisci il database degli alimenti con tutti i valori nutrizionali per 100g",
      icon: Database,
      path: "/dieta/food-database",
      gradient: "from-green-500/20 to-green-500/5",
    },
  ];

  return (<>
    <DietBreadcrumbs />
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">THE BUILDER WEB</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Gestionale <span className="text-primary">Diete</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Il tuo strumento professionale per creare diete personalizzate, 
              gestire timing e database alimentari
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.path}
                  className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50"
                  onClick={() => navigate(section.path)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.path);
                      }}
                    >
                      Apri
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 p-8 rounded-2xl border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Come funziona?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Gestione Timing:</strong> Crea template di distribuzione
                dei macronutrienti che potrai richiamare velocemente nelle diete
              </p>
              <p>
                <strong className="text-foreground">2. Tabella Alimentare:</strong> Personalizza il database
                degli alimenti aggiungendo o modificando i valori nutrizionali
              </p>
              <p>
                <strong className="text-foreground">3. Gestione Dieta:</strong> Crea diete complete inserendo
                i dati dell'atleta, selezionando un template di timing e configurando i pasti
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025 The Builder Web - Gestionale Diete Professionale
        </div>
      </footer>
    </div>
  
  </>
);
};

export default Index;

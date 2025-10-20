import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function Distretti() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distretti Muscolari</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci i distretti muscolari
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Funzionalità in arrivo</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Il modulo per la gestione dei distretti muscolari sarà disponibile a breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Clock } from "lucide-react";
import progressionsData from "@/data/progressions.json";
import { filterAndRank } from "@/utils/search";
import type { Progression } from "@/types";

const progressions = progressionsData as Progression[];

export default function Progressioni() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProgressions = useMemo(() => {
    return filterAndRank(progressions, (p) => p.name, searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progressioni di Allenamento</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci {progressions.length} schemi di progressione
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca progressioni..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredProgressions.map((progression, index) => (
          <Card
            key={index}
            className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors mt-1">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {progression.name}
                  </CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Clock className="h-3 w-3 mr-1" />
                      {progression.rest}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                      {progression.weeks.filter((w) => w.set).length} Settimane
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {progression.note && (
                <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                  <strong>Nota:</strong> {progression.note}
                </div>
              )}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Settimana</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Set</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Reps</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progression.weeks.map((week, weekIndex) => {
                      if (!week.set && !week.reps && !week.info) return null;
                      return (
                        <tr key={weekIndex} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-2 px-3 font-medium">Sett. {weekIndex + 1}</td>
                          <td className="py-2 px-3">{week.set || "-"}</td>
                          <td className="py-2 px-3">{week.reps || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground">{week.info || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProgressions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna progressione trovata</h3>
            <p className="text-muted-foreground text-center">
              Prova a modificare i criteri di ricerca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, UserCircle, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Athlete } from "@/types";

export default function Atleti() {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Carica atleti da localStorage
  useEffect(() => {
    const loadAthletes = () => {
      try {
        const athletesData = localStorage.getItem('athletes');
        if (athletesData) {
          setAthletes(JSON.parse(athletesData));
        }
      } catch (error) {
        console.error('Errore nel caricamento atleti:', error);
      }
    };
    loadAthletes();
  }, []);

  // Salva atleti in localStorage ogni volta che cambiano
  useEffect(() => {
    try {
      localStorage.setItem('athletes', JSON.stringify(athletes));
    } catch (error) {
      console.error('Errore nel salvataggio atleti:', error);
    }
  }, [athletes]);

  const [newAthlete, setNewAthlete] = useState<Athlete>({
    firstname: "",
    lastname: "",
    email: "",
    dob: "",
  });

  const handleAddAthlete = () => {
    if (!newAthlete.firstname || !newAthlete.lastname) {
      toast({
        title: "Errore",
        description: "Nome e cognome sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    const athlete = {
      ...newAthlete,
      id: Date.now().toString(),
    };

    setAthletes([...athletes, athlete]);
    setNewAthlete({ firstname: "", lastname: "", email: "", dob: "" });
    setDialogOpen(false);
    
    toast({
      title: "Atleta aggiunto",
      description: `${athlete.firstname} ${athlete.lastname} è stato aggiunto con successo`,
    });
  };

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Atleti</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i tuoi atleti e le loro informazioni
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Atleta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Atleta</DialogTitle>
              <DialogDescription>
                Inserisci i dati del nuovo atleta
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstname">Nome *</Label>
                <Input
                  id="firstname"
                  value={newAthlete.firstname}
                  onChange={(e) => setNewAthlete({ ...newAthlete, firstname: e.target.value })}
                  placeholder="Mario"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Cognome *</Label>
                <Input
                  id="lastname"
                  value={newAthlete.lastname}
                  onChange={(e) => setNewAthlete({ ...newAthlete, lastname: e.target.value })}
                  placeholder="Rossi"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAthlete.email}
                  onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                  placeholder="mario.rossi@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Data di Nascita</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newAthlete.dob}
                  onChange={(e) => setNewAthlete({ ...newAthlete, dob: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleAddAthlete} className="bg-gradient-to-r from-primary to-secondary">
                Aggiungi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca atleti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredAthletes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun atleta trovato</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? "Prova a modificare i criteri di ricerca"
                : "Inizia aggiungendo il tuo primo atleta"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAthletes.map((athlete) => (
            <Card
              key={athlete.id}
              className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
              onClick={() => navigate(`/atleti/${athlete.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                      <UserCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {athlete.firstname} {athlete.lastname}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        {athlete.email && (
                          <>
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{athlete.email}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {athlete.dob && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(athlete.dob).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

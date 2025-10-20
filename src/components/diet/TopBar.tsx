import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Wand2, X } from "lucide-react";
import { useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TopBarProps {
  onAutofill: () => void;
  onClearMeals: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  enforceSuitability: boolean;
  onToggleEnforce: () => void;
}

export const TopBar = ({
  onAutofill,
  onClearMeals,
  onReset,
  onExport,
  onImport,
  enforceSuitability,
  onToggleEnforce,
}: TopBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight">THE BUILDER WEB</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAutofill}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Crea menu automatico</span>
              <span className="sm:hidden">Auto</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearMeals}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancella menu</span>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              RESET
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Esporta
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Importa
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
              <Switch
                id="enforce-suitability"
                checked={enforceSuitability}
                onCheckedChange={onToggleEnforce}
              />
              <Label htmlFor="enforce-suitability" className="text-xs cursor-pointer">
                Limita alimenti per pasto
              </Label>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

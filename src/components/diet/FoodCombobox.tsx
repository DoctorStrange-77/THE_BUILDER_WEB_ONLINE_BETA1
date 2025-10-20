import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Food } from "@/types/diet";

interface FoodComboboxProps {
  foods: Food[];
  value: string;
  onValueChange: (value: string) => void;
}

export const FoodCombobox = ({ foods, value, onValueChange }: FoodComboboxProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedFood = foods.find((food) => food.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedFood ? (
            <span className="truncate">{selectedFood.name}</span>
          ) : (
            <span className="text-muted-foreground">Cerca alimento...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Cerca alimento..." />
          <CommandList>
            <CommandEmpty>Nessun alimento trovato.</CommandEmpty>
            <CommandGroup>
              {foods.map((food) => (
                <CommandItem
                  key={food.id}
                  value={`${food.name} ${food.category}`}
                  onSelect={() => {
                    onValueChange(food.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === food.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{food.name}</span>
                    <span className="text-xs text-muted-foreground">{food.category}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

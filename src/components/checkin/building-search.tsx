"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
import type { Building } from "@/lib/types";

interface BuildingSearchProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelect: (building: Building) => void;
}

export function BuildingSearch({ buildings, selectedBuilding, onSelect }: BuildingSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBuilding ? (
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedBuilding.name}</span>
              <span className="text-xs text-muted-foreground">({selectedBuilding.code})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Search buildings...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type building name or code..." />
          <CommandList>
            <CommandEmpty>No building found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {buildings.map((building) => (
                <CommandItem
                  key={building.id}
                  value={`${building.name} ${building.code}`}
                  onSelect={() => {
                    onSelect(building);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedBuilding?.id === building.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{building.name}</span>
                    <span className="text-xs text-muted-foreground">{building.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

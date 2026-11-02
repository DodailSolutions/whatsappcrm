"use client";

import { useEffect, useState } from "react";
import { MapPin, Check, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BusinessLocation } from "@/types/business";

export function LocationSwitcher() {
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [activeLocation, setActiveLocation] = useState<BusinessLocation | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          const list = data.locations || [];
          setLocations(list);
          if (list.length > 0) {
            const primary = list.find((l: BusinessLocation) => l.is_primary) || list[0];
            setActiveLocation(primary);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLocations();
  }, []);

  if (locations.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 px-2 rounded-md text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none">
        <MapPin className="size-3.5 text-primary" />
        <span className="max-w-[120px] truncate">{activeLocation?.name || "Main Location"}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
          Practice Locations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locations.map((loc) => {
          const isSelected = activeLocation?.id === loc.id;
          return (
            <DropdownMenuItem
              key={loc.id}
              onClick={() => setActiveLocation(loc)}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <span className="truncate">{loc.name}</span>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


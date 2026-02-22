"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Building } from "@/lib/types";

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchBuildings() {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("name");

      if (!error && data) {
        // Deduplicate by building code in case seed was run multiple times
        const seen = new Set<string>();
        const unique = data.filter((b) => {
          if (seen.has(b.code)) return false;
          seen.add(b.code);
          return true;
        });
        setBuildings(unique);
      }
      setLoading(false);
    }

    fetchBuildings();
  }, []);

  return { buildings, loading };
}

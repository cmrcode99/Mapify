"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBuildings } from "./use-buildings";
import { generateSyntheticCheckins, mergeWithSynthetic } from "@/lib/synthetic-occupancy";
import type { ActiveCheckinData } from "@/lib/types";

export function useCheckins() {
  const [rawCheckinData, setRawCheckinData] = useState<ActiveCheckinData[]>([]);
  const [loading, setLoading] = useState(true);
  const { buildings } = useBuildings();

  const fetchCheckins = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_active_checkins");

    if (!error && data) {
      setRawCheckinData(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCheckins();

    const supabase = createClient();
    const channel = supabase
      .channel("checkins-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checkins",
        },
        () => {
          fetchCheckins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCheckins]);

  // Generate synthetic data and merge with real checkins
  const checkinData = useMemo(() => {
    if (buildings.length === 0) return rawCheckinData;

    const synthetic = generateSyntheticCheckins(buildings);
    return mergeWithSynthetic(rawCheckinData, synthetic);
  }, [rawCheckinData, buildings]);

  return { checkinData, loading, refetch: fetchCheckins };
}

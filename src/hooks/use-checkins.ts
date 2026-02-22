"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActiveCheckinData } from "@/lib/types";

export function useCheckins() {
  const [checkinData, setCheckinData] = useState<ActiveCheckinData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_active_checkins");

    if (!error && data) {
      setCheckinData(data);
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

  return { checkinData, loading, refetch: fetchCheckins };
}

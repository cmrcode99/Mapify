"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MyActiveCheckin } from "@/lib/types";

export function useActiveCheckin() {
  const [activeCheckin, setActiveCheckin] = useState<MyActiveCheckin | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveCheckin = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setActiveCheckin(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("checkins")
      .select("id, building_id, room_number, checked_in_at, buildings(name)")
      .eq("user_id", user.id)
      .is("checked_out_at", null)
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      const building = data.buildings as unknown as { name: string } | null;
      setActiveCheckin({
        checkin_id: data.id,
        building_id: data.building_id,
        building_name: building?.name ?? "",
        room_number: data.room_number,
        checked_in_at: data.checked_in_at,
      });
    } else {
      setActiveCheckin(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActiveCheckin();

    const supabase = createClient();
    const channel = supabase
      .channel("my-checkin-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checkins",
        },
        () => {
          fetchActiveCheckin();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveCheckin]);

  const checkIn = useCallback(async (buildingId: string, roomNumber: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Auto-checkout any active checkin
    await supabase
      .from("checkins")
      .update({ checked_out_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("checked_out_at", null);

    // Create new checkin
    const { error } = await supabase
      .from("checkins")
      .insert({
        user_id: user.id,
        building_id: buildingId,
        room_number: roomNumber,
      });

    if (error) throw error;
    await fetchActiveCheckin();
  }, [fetchActiveCheckin]);

  const checkOut = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("checkins")
      .update({ checked_out_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("checked_out_at", null);

    if (error) throw error;
    await fetchActiveCheckin();
  }, [fetchActiveCheckin]);

  return { activeCheckin, loading, checkIn, checkOut, refetch: fetchActiveCheckin };
}

"use client";

import { useEffect, useState } from "react";

export interface FootTrafficData {
  available: boolean;
  live_busyness: number | null;
  forecasted_busyness: number | null;
  peak_busyness: number | null;
  venue_open: string | null;
  hours_text: string | null;
  venue_name_matched: string | null;
  day_mean: number | null;
}

const cache = new Map<string, { data: FootTrafficData; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

export function useFootTraffic(
  venueName: string | null,
  venueAddress: string | null
) {
  const [data, setData] = useState<FootTrafficData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venueName) {
      setData(null);
      return;
    }

    const address = venueAddress || venueName;
    const key = `${venueName}|${address}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      venue_name: venueName,
      venue_address: address,
    });

    fetch(`/api/foot-traffic?${params}`)
      .then((res) => res.json())
      .then((result: FootTrafficData) => {
        if (!cancelled) {
          cache.set(key, { data: result, ts: Date.now() });
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [venueName, venueAddress]);

  return { data, loading };
}

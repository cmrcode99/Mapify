"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Sparkles, Leaf, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomCard } from "@/components/recommended/room-card";
import { scoreRooms } from "./score";
import { buildRecommendedBuildings } from "./data";
import { useBuildings } from "@/hooks/use-buildings";
import { useCheckins } from "@/hooks/use-checkins";

// Dynamic import keeps Mapbox out of SSR
const MiniMap = dynamic(
  () => import("@/components/recommended/mini-map").then((m) => ({ default: m.MiniMap })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-none" />,
  }
);

// ── Legend chip ───────────────────────────────────────────────────────────────
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export function RecommendedDashboard() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Live data from Supabase
  const { buildings, loading: buildingsLoading } = useBuildings();
  const { checkinData, loading: checkinsLoading } = useCheckins();

  const isLoading = buildingsLoading || checkinsLoading;

  // Build recommended buildings from live data
  const recommendedBuildings = useMemo(
    () => buildRecommendedBuildings(buildings, checkinData),
    [buildings, checkinData]
  );

  const scoredRooms = useMemo(
    () => scoreRooms(recommendedBuildings),
    [recommendedBuildings]
  );

  const energySmartCount = scoredRooms.filter((r) => r.isEnergySmart).length;
  const totalPowerKw = useMemo(
    () => {
      const seen = new Set<string>();
      let total = 0;
      for (const b of recommendedBuildings) {
        if (!seen.has(b.id)) {
          seen.add(b.id);
          total += b.powerUsageKw;
        }
      }
      return Math.round(total * 10) / 10;
    },
    [recommendedBuildings]
  );

  // Card tapped → highlight pin and fly map
  const handleCardClick = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
  }, []);

  // Pin tapped → scroll to first card for that building
  const handlePinClick = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
    const card = listRef.current?.querySelector<HTMLElement>(
      `[data-building-id="${buildingId}"]`
    );
    card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b bg-background/90 backdrop-blur-md px-4 py-2.5 z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to map">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">Recommended</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 hidden sm:flex">
            <Leaf className="h-3 w-3 text-green-500" />
            {energySmartCount} energy-smart
          </Badge>
          <Badge variant="secondary" className="gap-1 hidden md:flex">
            <Zap className="h-3 w-3 text-amber-500" />
            {totalPowerKw} kW total
          </Badge>
          <Badge variant="outline" className="tabular-nums">
            {scoredRooms.length} rooms
          </Badge>
        </div>
      </header>

      {/* ── Algorithm note ── */}
      <div className="shrink-0 border-b bg-muted/40 px-4 py-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Ranked by <strong className="text-foreground">blended score</strong>: 55% availability
            (sweet spot ~35% occupancy) + 45% energy efficiency (prefer buildings already heated).
            Occupancy data is <strong className="text-foreground">live</strong> from check-ins.
          </span>
        </div>
      </div>

      {/* ── Split view ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top — scrollable card list */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : scoredRooms.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              No recommended rooms available right now.
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {scoredRooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  rank={i + 1}
                  isSelected={selectedBuildingId === room.building.id}
                  onClick={() => handleCardClick(room.building.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider with legend */}
        <div className="shrink-0 border-t bg-background">
          <div className="flex items-center justify-between px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Nearby locations</span>
            <div className="flex items-center gap-3">
              <LegendDot color="#22c55e" label="Top (≥70)" />
              <LegendDot color="#eab308" label="Mid (40–69)" />
              <LegendDot color="#6b7280" label="Low (<40)" />
            </div>
          </div>
        </div>

        {/* Bottom — mini map */}
        <div className="shrink-0" style={{ height: "38%" }}>
          <MiniMap
            scoredRooms={scoredRooms}
            selectedBuildingId={selectedBuildingId}
            onPinClick={handlePinClick}
          />
        </div>
      </div>
    </div>
  );
}

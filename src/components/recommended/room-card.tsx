"use client";

import { Leaf, Zap, Snowflake } from "lucide-react";
import type { ScoredRoom } from "./score";

// ── Score ring ────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#eab308";
  return "#6b7280";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: 36, height: 36 }}>
      <svg viewBox="0 0 36 36" width={36} height={36} className="absolute inset-0">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="relative text-[10px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// ── Amenity pill ──────────────────────────────────────────────────────────────

const AMENITY_LABELS: Record<string, string> = {
  outlets: "Outlets",
  quiet: "Quiet",
  whiteboard: "Whiteboard",
  projector: "Projector",
  "group study": "Group",
};

function AmenityPill({ amenity }: { amenity: string }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {AMENITY_LABELS[amenity] ?? amenity}
    </span>
  );
}

// ── Occupancy bar ─────────────────────────────────────────────────────────────

function OccupancyBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const barColor =
    pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {current}/{max}
      </span>
    </div>
  );
}

// ── Room card ─────────────────────────────────────────────────────────────────

interface RoomCardProps {
  room: ScoredRoom;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}

export function RoomCard({ room, rank, isSelected, onClick }: RoomCardProps) {
  return (
    <button
      data-building-id={room.building.id}
      onClick={onClick}
      className={`
        w-full rounded-xl border p-3 text-left transition-all
        hover:border-primary/40 hover:bg-muted/40 active:scale-[0.99]
        ${isSelected
          ? "border-primary/60 bg-muted/60 ring-1 ring-primary/30"
          : "border-border bg-card"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Rank number */}
        <span className="mt-0.5 shrink-0 text-xs font-semibold text-muted-foreground w-4 text-right">
          {rank}
        </span>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Room name + badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold leading-tight">{room.name}</span>
            {room.isEnergySmart && (
              <span className="flex items-center gap-0.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                <Leaf className="h-2.5 w-2.5" />
                Energy Smart
              </span>
            )}
          </div>

          {/* Building name */}
          <p className="text-xs text-muted-foreground truncate">{room.building.name}</p>

          {/* Occupancy bar */}
          <OccupancyBar current={room.currentOccupancy} max={room.maxCapacity} />

          {/* Amenity pills + power info */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {room.amenities.map((a) => (
              <AmenityPill key={a} amenity={a} />
            ))}
            {room.building.energyActive ? (
              <span className="flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <Zap className="h-2.5 w-2.5" />
                {room.building.powerUsageKw} kW
              </span>
            ) : (
              <span className="flex items-center gap-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                <Snowflake className="h-2.5 w-2.5" />
                Not heated
              </span>
            )}
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing score={room.blendedScore} />
      </div>
    </button>
  );
}

"use client";

import { useMemo } from "react";

interface TrafficChartProps {
    /** Used to seed deterministic data */
    venueName: string;
    /** Optional current busyness to anchor the curve */
    currentBusyness?: number | null;
}

/* ── Seeded PRNG (same as in the foot-traffic API route) ── */
function seedFromString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h >>> 0;
}

function mulberry32(seed: number) {
    let t = seed;
    return () => {
        t = (t + 0x6d2b79f5) | 0;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/* ── Synthetic 24-hour traffic curve ── */

/** Baseline busyness curve for a campus building — peaks around 10am and 2pm. */
const BASE_CURVE = [
    5, 3, 2, 2, 3, 5,       // 0–5   (midnight–5am)
    10, 20, 40, 60, 75, 70,  // 6–11  (morning ramp)
    55, 65, 80, 72, 58, 45,  // 12–17 (afternoon)
    30, 20, 15, 12, 8, 6,    // 18–23 (evening wind-down)
];

function generate24hTraffic(venueName: string, currentBusyness?: number | null): number[] {
    const rand = mulberry32(seedFromString(venueName));

    // Building "personality" — scale the base curve
    const popularity = 0.6 + rand() * 0.8; // 0.6–1.4x

    const raw = BASE_CURVE.map((v) => {
        const noise = (rand() - 0.5) * 15; // ±7.5% jitter
        return Math.round(Math.max(0, Math.min(100, v * popularity + noise)));
    });

    // If we have a current busyness reading, nudge the current hour to match
    if (currentBusyness != null) {
        const now = new Date().getHours();
        const diff = currentBusyness - raw[now];
        // Smooth the adjustment across nearby hours
        for (let offset = -2; offset <= 2; offset++) {
            const hr = (now + offset + 24) % 24;
            const factor = 1 - Math.abs(offset) * 0.3;
            raw[hr] = Math.round(Math.max(0, Math.min(100, raw[hr] + diff * factor)));
        }
    }

    return raw;
}

/* ── Chart component ── */

function barColor(value: number): string {
    if (value >= 75) return "#ef4444"; // red
    if (value >= 50) return "#f97316"; // orange
    if (value >= 25) return "#eab308"; // yellow
    return "#22c55e"; // green
}

export function TrafficChart({ venueName, currentBusyness }: TrafficChartProps) {
    const now = new Date().getHours();

    const data = useMemo(
        () => generate24hTraffic(venueName, currentBusyness),
        [venueName, currentBusyness]
    );

    const maxVal = Math.max(...data, 1);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-medium">24h Forecast</span>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Quiet
                    </span>
                    <span className="flex items-center gap-0.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                        Busy
                    </span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-px" style={{ height: 48 }}>
                {data.map((value, hour) => {
                    const heightPct = (value / maxVal) * 100;
                    const isCurrent = hour === now;
                    const isPast = hour < now;

                    return (
                        <div
                            key={hour}
                            className="group relative flex-1 flex flex-col items-center justify-end"
                            style={{ height: "100%" }}
                        >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                                <div className="rounded bg-popover border border-border px-1.5 py-0.5 text-[9px] font-medium shadow-lg whitespace-nowrap">
                                    {hour % 12 || 12}{hour < 12 ? "a" : "p"}: {value}%
                                </div>
                            </div>
                            <div
                                className="w-full rounded-sm transition-all"
                                style={{
                                    height: `${Math.max(heightPct, 3)}%`,
                                    backgroundColor: isCurrent
                                        ? "#3b82f6" // blue for current hour
                                        : isPast
                                            ? `${barColor(value)}66` // faded for past hours
                                            : barColor(value),
                                    opacity: isCurrent ? 1 : isPast ? 0.5 : 0.85,
                                    boxShadow: isCurrent ? "0 0 4px rgba(59, 130, 246, 0.5)" : "none",
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Time labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground px-0.5">
                <span>12a</span>
                <span>6a</span>
                <span>12p</span>
                <span>6p</span>
                <span>12a</span>
            </div>
        </div>
    );
}

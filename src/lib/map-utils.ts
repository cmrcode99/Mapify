import type { ActiveCheckinData } from "./types";

export const UIUC_CENTER = {
  latitude: 40.1074,
  longitude: -88.2272,
  zoom: 15,
} as const;

export function buildHeatmapGeoJSON(data: ActiveCheckinData[]) {
  return {
    type: "FeatureCollection" as const,
    features: data
      .filter((b) => b.active_count > 0)
      .map((b) => ({
        type: "Feature" as const,
        properties: {
          weight: b.active_count,
          name: b.building_name,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [b.longitude, b.latitude],
        },
      })),
  };
}

export const HEATMAP_LAYER = {
  id: "checkins-heat",
  type: "heatmap" as const,
  maxzoom: 20,
  paint: {
    // Weight: how much each point contributes
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "weight"],
      0, 0,
      2, 0.1,
      8, 0.3,
      20, 0.6,
      50, 1,
    ],
    // Intensity scales with zoom
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      11, 1,
      14, 2.5,
      16, 4,
    ],
    // Thermal camera palette: dark blue → cyan → green → yellow → orange → bright red
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0, 0, 0, 0)",
      0.05, "rgba(10, 10, 80, 0.5)",
      0.15, "rgba(20, 40, 160, 0.6)",
      0.25, "rgba(0, 120, 200, 0.65)",
      0.35, "rgba(0, 190, 180, 0.7)",
      0.45, "rgba(40, 210, 80, 0.75)",
      0.55, "rgba(160, 230, 30, 0.8)",
      0.65, "rgba(240, 220, 20, 0.82)",
      0.75, "rgba(255, 160, 10, 0.85)",
      0.85, "rgba(255, 90, 10, 0.9)",
      0.95, "rgba(230, 20, 10, 0.92)",
      1, "rgba(255, 50, 50, 0.95)",
    ],
    // Large radius for wide thermal bleed
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      11, 25,
      14, 60,
      16, 90,
      18, 110,
    ],
    // High opacity so it really pops
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      12, 0.85,
      15, 0.75,
      18, 0.55,
    ],
  },
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

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
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "weight"],
      0, 0,
      5, 0.5,
      20, 1,
    ],
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      11, 1,
      15, 3,
    ],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0, 0, 0, 0)",
      0.1, "rgba(34, 197, 94, 0.4)",
      0.3, "rgba(250, 204, 21, 0.6)",
      0.5, "rgba(249, 115, 22, 0.7)",
      0.7, "rgba(239, 68, 68, 0.8)",
      1, "rgba(220, 38, 38, 0.9)",
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      11, 15,
      15, 40,
      18, 70,
    ],
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14, 0.8,
      18, 0.4,
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

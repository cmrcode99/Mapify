"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { buildHeatmapGeoJSON, HEATMAP_LAYER } from "@/lib/map-utils";
import type { ActiveCheckinData } from "@/lib/types";

interface HeatmapLayerProps {
  data: ActiveCheckinData[];
}

export function HeatmapLayer({ data }: HeatmapLayerProps) {
  const geojson = buildHeatmapGeoJSON(data);

  if (geojson.features.length === 0) return null;

  return (
    <Source id="checkins-source" type="geojson" data={geojson}>
      {/* @ts-expect-error - Mapbox heatmap paint types are complex */}
      <Layer {...HEATMAP_LAYER} />
    </Source>
  );
}

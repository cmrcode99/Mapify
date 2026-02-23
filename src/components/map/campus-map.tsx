"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { UIUC_CENTER } from "@/lib/map-utils";
import { BuildingMarkers } from "./building-markers";
import { HeatmapLayer } from "./heatmap-layer";
import { BuildingPopup } from "./building-popup";
import type { ActiveCheckinData, Building } from "@/lib/types";

interface CampusMapProps {
  checkinData: ActiveCheckinData[];
  buildings: Building[];
  onCheckin: (buildingId: string, buildingName: string) => void;
  onView3D?: () => void;
  mapStyle: string;
  focusBuildingId: string | null;
  focusCounter: number;
  showHeatmap?: boolean;
}

export function CampusMap({
  checkinData,
  buildings,
  onCheckin,
  onView3D,
  mapStyle,
  focusBuildingId,
  focusCounter,
  showHeatmap = false,
}: CampusMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<ActiveCheckinData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const focusOnBuilding = useCallback((building: ActiveCheckinData) => {
    setSelectedBuilding(building);
    mapRef.current?.flyTo({
      center: [building.longitude, building.latitude],
      zoom: 17,
      duration: 800,
    });
  }, []);

  // React to external focus requests
  useEffect(() => {
    if (!focusBuildingId || !mapLoaded) return;

    // Try checkinData first (has room info)
    let building = checkinData.find((b) => b.building_id === focusBuildingId);

    // Fallback: construct from buildings list
    if (!building) {
      const raw = buildings.find((b) => b.id === focusBuildingId);
      if (raw) {
        building = {
          building_id: raw.id,
          building_name: raw.name,
          building_code: raw.code,
          latitude: raw.latitude,
          longitude: raw.longitude,
          active_count: 0,
          rooms: [],
          address: raw.address,
        };
      }
    }

    if (building) {
      focusOnBuilding(building);
    }
    // focusCounter is in deps so re-selecting the same building re-triggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusBuildingId, focusCounter, mapLoaded]);

  const handleMarkerClick = useCallback((building: ActiveCheckinData) => {
    focusOnBuilding(building);
  }, [focusOnBuilding]);

  const handleClosePopup = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  const handleMapClick = useCallback(() => {
    // Close popup when clicking on empty map area
    if (selectedBuilding) {
      setSelectedBuilding(null);
    }
  }, [selectedBuilding]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedBuilding) {
        setSelectedBuilding(null);
        // Reset view on ESC
        mapRef.current?.flyTo({
          center: [UIUC_CENTER.longitude, UIUC_CENTER.latitude],
          zoom: UIUC_CENTER.zoom,
          duration: 800,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBuilding]);

  return (
    <Map
      ref={mapRef}
      onLoad={() => setMapLoaded(true)}
      onClick={handleMapClick}
      initialViewState={{
        latitude: UIUC_CENTER.latitude,
        longitude: UIUC_CENTER.longitude,
        zoom: UIUC_CENTER.zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      maxBounds={[
        [-88.30, 40.06],
        [-88.18, 40.16],
      ]}
      minZoom={13}
      maxZoom={20}
      interactiveLayerIds={[]}
      cursor={selectedBuilding ? "pointer" : "grab"}
    >
      {showHeatmap && <HeatmapLayer data={checkinData} />}
      <BuildingMarkers
        data={checkinData}
        onMarkerClick={handleMarkerClick}
      />
      {selectedBuilding && (
        <BuildingPopup
          building={selectedBuilding}
          onClose={handleClosePopup}
          onCheckin={onCheckin}
          onView3D={onView3D}
        />
      )}
    </Map>
  );
}

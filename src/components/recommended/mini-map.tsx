"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import ReactMap, { Marker, Popup, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { UIUC_CENTER } from "@/lib/map-utils";
import type { ScoredRoom } from "./score";

interface BuildingPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bestScore: number;
  roomCount: number;
}

interface MiniMapProps {
  scoredRooms: ScoredRoom[];
  selectedBuildingId: string | null;
  onPinClick: (buildingId: string) => void;
}

function pinColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#eab308";
  return "#6b7280";
}

export function MiniMap({ scoredRooms, selectedBuildingId, onPinClick }: MiniMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupPin, setPopupPin] = useState<BuildingPin | null>(null);

  // Aggregate per-room scores into one pin per building
  const pins = useMemo<BuildingPin[]>(() => {
    const byBuilding: Record<string, BuildingPin> = {};
    for (const room of scoredRooms) {
      const entry = byBuilding[room.buildingId];
      if (!entry) {
        byBuilding[room.buildingId] = {
          id: room.buildingId,
          name: room.building.name,
          lat: room.building.lat,
          lng: room.building.lng,
          bestScore: room.blendedScore,
          roomCount: 1,
        };
      } else {
        entry.roomCount++;
        entry.bestScore = Math.max(entry.bestScore, room.blendedScore);
      }
    }
    return Object.values(byBuilding);
  }, [scoredRooms]);

  // Fly to selected building whenever it changes
  useEffect(() => {
    if (!selectedBuildingId) return;
    const pin = pins.find((p) => p.id === selectedBuildingId);
    if (pin) {
      mapRef.current?.flyTo({
        center: [pin.lng, pin.lat],
        zoom: 16,
        duration: 600,
      });
    }
  }, [selectedBuildingId, pins]);

  return (
    <ReactMap
      ref={mapRef}
      initialViewState={{
        latitude: UIUC_CENTER.latitude,
        longitude: UIUC_CENTER.longitude,
        zoom: 14,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      maxBounds={[[-88.30, 40.06], [-88.18, 40.16]]}
    >
      {pins.map((pin) => {
        const color = pinColor(pin.bestScore);
        const isSelected = selectedBuildingId === pin.id;

        return (
          <Marker
            key={pin.id}
            latitude={pin.lat}
            longitude={pin.lng}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupPin(pin);
              onPinClick(pin.id);
            }}
          >
            <div
              style={{
                width: isSelected ? 22 : 14,
                height: isSelected ? 22 : 14,
                borderRadius: "50%",
                backgroundColor: color,
                border: `2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.45)"}`,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isSelected
                  ? `0 0 0 4px ${color}55, 0 2px 8px rgba(0,0,0,0.4)`
                  : "0 1px 4px rgba(0,0,0,0.35)",
              }}
            />
          </Marker>
        );
      })}

      {popupPin && (
        <Popup
          latitude={popupPin.lat}
          longitude={popupPin.lng}
          anchor="top"
          onClose={() => setPopupPin(null)}
          closeOnClick={false}
          offset={14}
        >
          <div className="px-0.5 py-0.5 min-w-[140px]">
            <p className="text-sm font-semibold leading-tight">{popupPin.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {popupPin.roomCount} recommended room{popupPin.roomCount !== 1 ? "s" : ""}
            </p>
            <p
              className="mt-1 text-xs font-bold"
              style={{ color: pinColor(popupPin.bestScore) }}
            >
              Best score: {popupPin.bestScore}
            </p>
          </div>
        </Popup>
      )}
    </ReactMap>
  );
}

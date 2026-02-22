"use client";

import { Marker } from "react-map-gl/mapbox";
import type { ActiveCheckinData } from "@/lib/types";

interface BuildingMarkersProps {
  data: ActiveCheckinData[];
  onMarkerClick: (building: ActiveCheckinData) => void;
}

export function BuildingMarkers({ data, onMarkerClick }: BuildingMarkersProps) {
  return (
    <>
      {data.map((building) => (
        <Marker
          key={building.building_id}
          latitude={building.latitude}
          longitude={building.longitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onMarkerClick(building);
          }}
        >
          <button
            className="group relative flex items-center justify-center"
            aria-label={`${building.building_name}: ${building.active_count} people checked in`}
          >
            <div
              className={`
                flex h-8 w-8 items-center justify-center rounded-full
                border-2 border-white shadow-lg transition-transform
                group-hover:scale-110
                ${building.active_count > 0
                  ? building.active_count > 10
                    ? "bg-red-500"
                    : building.active_count > 5
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  : "bg-slate-400"
                }
              `}
            >
              <span className="text-xs font-bold text-white">
                {building.active_count > 0 ? building.active_count : ""}
              </span>
            </div>
            {building.active_count > 0 && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {building.building_code}
              </span>
            )}
          </button>
        </Marker>
      ))}
    </>
  );
}

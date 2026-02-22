"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloorControls from "./FloorControls";
import Legend from "./Legend";
import LoadingOverlay from "./LoadingOverlay";
import type { FloorData, Config, RoomInfo } from "./BuildingViewer";
import { getActiveClass } from "@/lib/class-schedules";

const BuildingViewer = dynamic(() => import("./BuildingViewer"), {
  ssr: false,
});

interface ApiResponse {
  floors: FloorData[];
  config: Config;
}

interface RoomMapData {
  floors: { label: string; rooms: RoomInfo[] }[];
}

interface RoomIdsData {
  roomGrids: (string | null)[][][];
}

interface BuildingViewerModalProps {
  onClose: () => void;
}

export default function BuildingViewerModal({ onClose }: BuildingViewerModalProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [visibleFloors, setVisibleFloors] = useState<boolean[]>([]);
  const [roomMap, setRoomMap] = useState<RoomMapData | null>(null);
  const [roomGrids, setRoomGrids] = useState<(string | null)[][][] | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<Record<string, "available" | "in-use">>({});

  // Compute availability for all rooms
  const computeAvailability = useCallback((roomMapData: RoomMapData) => {
    const avail: Record<string, "available" | "in-use"> = {};
    for (const floor of roomMapData.floors) {
      for (const room of floor.rooms) {
        // Skip corridors and circulation
        if (room.id.startsWith("C") || room.id.startsWith("STAIR") || room.id.startsWith("ELEV")) continue;
        const activeClass = getActiveClass("ECEB", room.id);
        avail[room.id] = activeClass ? "in-use" : "available";
      }
    }
    return avail;
  }, []);

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      fetch("/api/floors").then((r) => r.json()) as Promise<ApiResponse>,
      fetch("/room-map.json").then((r) => r.json()) as Promise<RoomMapData>,
      fetch("/room-ids.json").then((r) => r.json()) as Promise<RoomIdsData>,
    ]).then(([floorsData, roomMapData, roomIdsData]) => {
      setData(floorsData);
      setVisibleFloors(floorsData.floors.map(() => true));
      setRoomMap(roomMapData);
      setRoomGrids(roomIdsData.roomGrids);
      setRoomAvailability(computeAvailability(roomMapData));
    });
  }, [computeAvailability]);

  // Update availability every 30 seconds
  useEffect(() => {
    if (!roomMap) return;
    const interval = setInterval(() => {
      setRoomAvailability(computeAvailability(roomMap));
    }, 30000);
    return () => clearInterval(interval);
  }, [roomMap, computeAvailability]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      {/* 3D Viewer */}
      <div className="absolute inset-0">
        {!data ? (
          <LoadingOverlay />
        ) : (
          <>
            <BuildingViewer
              floors={data.floors}
              config={data.config}
              visibleFloors={visibleFloors}
              roomAvailability={roomAvailability}
              roomGrids={roomGrids ?? undefined}
              roomMap={roomMap ?? undefined}
            />
            <Legend />
            <FloorControls
              labels={data.floors.map((f) => f.label)}
              visibleFloors={visibleFloors}
              onChange={setVisibleFloors}
            />
            <div className="absolute bottom-4 right-4 text-[#666699] text-xs text-right pointer-events-none">
              Drag to orbit · Scroll to zoom · Right-drag to pan
            </div>
          </>
        )}
      </div>

      {/* Header bar — z-20 above canvas, pointer-events-none so orbit still works, but buttons are clickable */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-lg font-semibold text-[#e0e8ff] tracking-wide">
            ECEB Building Viewer
          </h2>
          <p className="text-xs text-[#8888bb]">
            Electrical &amp; Computer Engineering Building — UIUC
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 pointer-events-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

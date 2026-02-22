"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloorControls from "./FloorControls";
import Legend from "./Legend";
import LoadingOverlay from "./LoadingOverlay";
import RoomDetailPanel from "./RoomDetailPanel";
import type { FloorData, Config, RoomInfo } from "./BuildingViewer";
import type { ActiveCheckinData } from "@/lib/types";
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
  checkinData?: ActiveCheckinData[];
}

export default function BuildingViewerModal({ onClose, checkinData }: BuildingViewerModalProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [visibleFloors, setVisibleFloors] = useState<boolean[]>([]);
  const [roomMap, setRoomMap] = useState<RoomMapData | null>(null);
  const [roomGrids, setRoomGrids] = useState<(string | null)[][][] | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<Record<string, "available" | "in-use">>({});
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Extract ECEB checked-in rooms from live data
  const checkedInRooms = useMemo(() => {
    const map: Record<string, number> = {};
    if (!checkinData) return map;
    const eceb = checkinData.find((b) => b.building_code === "ECEB");
    if (eceb) {
      for (const r of eceb.rooms) {
        map[r.room] = (map[r.room] || 0) + r.count;
      }
    }
    return map;
  }, [checkinData]);

  // Compute availability for all rooms — merges class schedules + live checkins
  const computeAvailability = useCallback(
    (roomMapData: RoomMapData) => {
      const avail: Record<string, "available" | "in-use"> = {};
      for (const floor of roomMapData.floors) {
        for (const room of floor.rooms) {
          // Skip corridors and circulation
          if (room.id.startsWith("C") || room.id.startsWith("STAIR") || room.id.startsWith("ELEV")) continue;
          const activeClass = getActiveClass("ECEB", room.id);
          const hasCheckins = (checkedInRooms[room.id] ?? 0) > 0;
          avail[room.id] = activeClass || hasCheckins ? "in-use" : "available";
        }
      }
      return avail;
    },
    [checkedInRooms]
  );

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

  // Recompute availability when computeAvailability changes (e.g. new checkin data)
  // and also on a 30-second interval to track class schedule changes
  useEffect(() => {
    if (!roomMap) return;
    // Immediately recompute
    setRoomAvailability(computeAvailability(roomMap));
    const interval = setInterval(() => {
      setRoomAvailability(computeAvailability(roomMap));
    }, 30000);
    return () => clearInterval(interval);
  }, [roomMap, computeAvailability]);

  // Close on Escape — close panel first, then modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedRoomId) {
          setSelectedRoomId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedRoomId]);

  // Handle room click from 3D viewer
  const handleRoomClick = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
  }, []);

  // Look up room info for selected room
  const selectedRoomInfo = useMemo(() => {
    if (!selectedRoomId || !roomMap) return undefined;
    for (const floor of roomMap.floors) {
      const room = floor.rooms.find((r) => r.id === selectedRoomId);
      if (room) return room;
    }
    return undefined;
  }, [selectedRoomId, roomMap]);

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
              onRoomClick={handleRoomClick}
            />
            <Legend />
            <FloorControls
              labels={data.floors.map((f) => f.label)}
              visibleFloors={visibleFloors}
              onChange={setVisibleFloors}
            />
            <div className="absolute bottom-4 right-4 text-[#666699] text-xs text-right pointer-events-none space-y-0.5">
              <div>Drag to orbit · Scroll to zoom · Right-drag to pan</div>
              <div className="text-[10px] opacity-75">Click a room for details · Press ESC to close</div>
            </div>
            {selectedRoomId && (
              <RoomDetailPanel
                roomId={selectedRoomId}
                roomInfo={selectedRoomInfo}
                checkinCount={checkedInRooms[selectedRoomId] ?? 0}
                onClose={() => setSelectedRoomId(null)}
              />
            )}
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
          className="text-white hover:bg-white/20 pointer-events-auto bg-black/30 backdrop-blur-sm transition-all hover:scale-110 shrink-0"
          aria-label="Close building viewer"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

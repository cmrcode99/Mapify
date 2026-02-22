"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloorControls from "./FloorControls";
import Legend from "./Legend";
import LoadingOverlay from "./LoadingOverlay";
import type { FloorData, Config } from "./BuildingViewer";

const BuildingViewer = dynamic(() => import("./BuildingViewer"), {
  ssr: false,
});

interface ApiResponse {
  floors: FloorData[];
  config: Config;
}

interface BuildingViewerModalProps {
  onClose: () => void;
}

export default function BuildingViewerModal({ onClose }: BuildingViewerModalProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [visibleFloors, setVisibleFloors] = useState<boolean[]>([]);

  useEffect(() => {
    fetch("/api/floors")
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        setData(json);
        setVisibleFloors(json.floors.map(() => true));
      });
  }, []);

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
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3">
        <div>
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
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

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
    </div>
  );
}

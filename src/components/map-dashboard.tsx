"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  BarChart3,
  Map,
  Globe,
  User,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useBuildings } from "@/hooks/use-buildings";
import { useCheckins } from "@/hooks/use-checkins";
import { useActiveCheckin } from "@/hooks/use-active-checkin";
import { CheckinPanel } from "@/components/checkin/checkin-panel";
import { signOut } from "@/app/actions";

const BuildingViewerModal = dynamic(
  () => import("@/components/building-viewer/building-viewer-modal"),
  { ssr: false }
);

const CampusMap = dynamic(
  () => import("@/components/map/campus-map").then((mod) => ({ default: mod.CampusMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);

const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const STREETS_STYLE = "mapbox://styles/mapbox/streets-v12";

interface MapDashboardProps {
  userEmail: string;
}

export function MapDashboard({ userEmail }: MapDashboardProps) {
  const { buildings } = useBuildings();
  const { checkinData } = useCheckins();
  const { activeCheckin, checkIn, checkOut } = useActiveCheckin();
  const [satellite, setSatellite] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [preselectedBuildingId, setPreselectedBuildingId] = useState<string | null>(null);
  const [preselectedBuildingName, setPreselectedBuildingName] = useState<string | null>(null);
  // Incremented to re-trigger the map focus even for the same building
  const [focusBuildingId, setFocusBuildingId] = useState<string | null>(null);
  const [focusCounter, setFocusCounter] = useState(0);
  const [show3DViewer, setShow3DViewer] = useState(false);

  const totalActive = checkinData.reduce((sum, b) => sum + b.active_count, 0);

  const requestMapFocus = useCallback((buildingId: string) => {
    setFocusBuildingId(buildingId);
    setFocusCounter((c) => c + 1);
  }, []);

  const handleMapCheckin = useCallback((buildingId: string, buildingName: string) => {
    setPreselectedBuildingId(buildingId);
    setPreselectedBuildingName(buildingName);
    setSidebarOpen(true);
  }, []);

  const handleClearPreselection = useCallback(() => {
    setPreselectedBuildingId(null);
    setPreselectedBuildingName(null);
  }, []);

  const handleSidebarBuildingSelect = useCallback((buildingId: string) => {
    requestMapFocus(buildingId);
  }, [requestMapFocus]);

  const handleActiveBuildingClick = useCallback((buildingId: string, buildingName: string) => {
    setPreselectedBuildingId(buildingId);
    setPreselectedBuildingName(buildingName);
    requestMapFocus(buildingId);
    setSidebarOpen(true);
  }, [requestMapFocus]);

  const handleView3D = useCallback(() => {
    setShow3DViewer(true);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur-md border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Mapify</span>
          </div>
          <Badge variant="secondary" className="hidden sm:flex gap-1">
            <Users className="h-3 w-3" />
            {totalActive} on campus
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSatellite(!satellite)}
            title={satellite ? "Street map" : "Satellite map"}
          >
            {satellite ? <Map className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </Button>
          <Link href="/trends">
            <Button variant="ghost" size="icon" title="View trends">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          absolute top-[49px] bottom-0 left-0 z-10 w-80 shrink-0
          transform transition-transform duration-300 ease-in-out
          bg-background/95 backdrop-blur-md border-r overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4">
          <CheckinPanel
            buildings={buildings}
            activeCheckin={activeCheckin}
            onCheckin={checkIn}
            onCheckout={checkOut}
            preselectedBuildingId={preselectedBuildingId}
            preselectedBuildingName={preselectedBuildingName}
            onClearPreselection={handleClearPreselection}
            onBuildingSelect={handleSidebarBuildingSelect}
          />

          <div className="mt-4 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Buildings
            </h3>
            {checkinData
              .filter((b) => b.active_count > 0)
              .sort((a, b) => b.active_count - a.active_count)
              .map((b) => (
                <button
                  key={b.building_id}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleActiveBuildingClick(b.building_id, b.building_name)}
                >
                  <div>
                    <p className="text-sm font-medium">{b.building_name}</p>
                    <p className="text-xs text-muted-foreground">{b.building_code}</p>
                  </div>
                  <Badge variant="secondary">{b.active_count}</Badge>
                </button>
              ))}
            {checkinData.filter((b) => b.active_count > 0).length === 0 && (
              <p className="text-xs text-muted-foreground py-2">
                No active check-ins yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Map */}
      <main className="absolute inset-0 top-[49px]">
        <CampusMap
          checkinData={checkinData}
          buildings={buildings}
          onCheckin={handleMapCheckin}
          onView3D={handleView3D}
          mapStyle={satellite ? SATELLITE_STYLE : STREETS_STYLE}
          focusBuildingId={focusBuildingId}
          focusCounter={focusCounter}
        />
      </main>

      {show3DViewer && (
        <BuildingViewerModal onClose={() => setShow3DViewer(false)} />
      )}
    </div>
  );
}

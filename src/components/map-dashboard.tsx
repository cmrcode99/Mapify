"use client";

import { useState, useCallback, useEffect } from "react";
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
  Sparkles,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close sidebar on mobile
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      // 'S' to toggle satellite view
      if (e.key === "s" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in an input
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setSatellite((prev) => !prev);
        }
      }
      // 'M' to toggle sidebar
      if (e.key === "m" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setSidebarOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur-md border-b px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-transform hover:scale-105"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
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
            title={satellite ? "Switch to street map" : "Switch to satellite map"}
            aria-label={satellite ? "Switch to street map" : "Switch to satellite map"}
            className="transition-transform hover:scale-105"
          >
            {satellite ? <Map className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </Button>
          <Link href="/recommended">
            <Button
              variant="ghost"
              size="icon"
              title="Recommended rooms"
              aria-label="View recommended rooms"
              className="transition-transform hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/trends">
            <Button
              variant="ghost"
              size="icon"
              title="View trends"
              aria-label="View building trends"
              className="transition-transform hover:scale-105"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="User menu"
                className="transition-transform hover:scale-105"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Manage your account</p>
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

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 top-[49px] bg-black/50 z-[9] backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          absolute top-[49px] bottom-0 left-0 z-10 w-80 shrink-0
          transform transition-transform duration-300 ease-in-out
          bg-background/95 backdrop-blur-md border-r overflow-y-auto
          shadow-lg md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Check-in sidebar"
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
              Active Buildings ({checkinData.filter((b) => b.active_count > 0).length})
            </h3>
            {checkinData
              .filter((b) => b.active_count > 0)
              .sort((a, b) => b.active_count - a.active_count)
              .map((b) => (
                <button
                  key={b.building_id}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-muted/70 hover:shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleActiveBuildingClick(b.building_id, b.building_name)}
                  aria-label={`View ${b.building_name} with ${b.active_count} active check-ins`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{b.building_name}</p>
                    <p className="text-xs text-muted-foreground">{b.building_code}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    <Users className="mr-1 h-3 w-3" />
                    {b.active_count}
                  </Badge>
                </button>
              ))}
            {checkinData.filter((b) => b.active_count > 0).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No active check-ins yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Be the first to check in!
                </p>
              </div>
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
        <BuildingViewerModal
          onClose={() => setShow3DViewer(false)}
          checkinData={checkinData}
        />
      )}
    </div>
  );
}

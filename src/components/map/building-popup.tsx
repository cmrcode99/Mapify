"use client";

import { Popup } from "react-map-gl/mapbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Activity, Loader2, Box } from "lucide-react";
import { useFootTraffic } from "@/hooks/use-foot-traffic";
import { TrafficChart } from "./traffic-chart";
import type { ActiveCheckinData } from "@/lib/types";

interface BuildingPopupProps {
  building: ActiveCheckinData;
  onClose: () => void;
  onCheckin: (buildingId: string, buildingName: string) => void;
  onView3D?: () => void;
}

function BusynessBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));

  const color =
    clamped >= 75 ? "bg-red-500" :
      clamped >= 50 ? "bg-orange-500" :
        clamped >= 25 ? "bg-yellow-500" :
          "bg-emerald-500";

  const text =
    clamped >= 75 ? "Very Busy" :
      clamped >= 50 ? "Busy" :
        clamped >= 25 ? "Moderate" :
          "Quiet";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{text} ({clamped}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function BuildingPopup({ building, onClose, onCheckin, onView3D }: BuildingPopupProps) {
  const { data: traffic, loading: trafficLoading } = useFootTraffic(
    building.building_name,
    building.address
  );

  const uniqueRooms = building.rooms
    .filter((r, i, arr) => arr.findIndex((x) => x.room === r.room) === i)
    .sort((a, b) => b.count - a.count);

  const hasAnyTrafficData = traffic?.available && (
    traffic.live_busyness !== null ||
    traffic.forecasted_busyness !== null ||
    traffic.day_mean !== null
  );

  return (
    <Popup
      latitude={building.latitude}
      longitude={building.longitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      className="mapify-popup"
      maxWidth="300px"
    >
      <div className="p-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm leading-tight">
              {building.building_name}
            </h3>
            <p className="text-xs text-muted-foreground">{building.building_code}</p>
          </div>
          <Badge
            variant={building.active_count > 0 ? "default" : "secondary"}
            className="shrink-0"
          >
            <Users className="mr-1 h-3 w-3" />
            {building.active_count}
          </Badge>
        </div>

        {/* Foot traffic section */}
        <div className="mt-2 rounded-md border bg-muted/30 p-2 space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-medium">
            <Activity className="h-3 w-3" />
            Foot Traffic
          </div>
          {trafficLoading ? (
            <div className="flex items-center justify-center py-1">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="ml-1.5 text-[10px] text-muted-foreground">Loading...</span>
            </div>
          ) : hasAnyTrafficData ? (
            <div className="space-y-1.5">
              {traffic!.live_busyness !== null && (
                <BusynessBar value={traffic!.live_busyness} label="Live" />
              )}
              {traffic!.forecasted_busyness !== null && (
                <BusynessBar
                  value={traffic!.forecasted_busyness}
                  label={traffic!.live_busyness !== null ? "Typical now" : "Right now (forecast)"}
                />
              )}
              {traffic!.forecasted_busyness === null && traffic!.day_mean !== null && (
                <BusynessBar value={traffic!.day_mean} label="Today avg" />
              )}
              {traffic!.peak_busyness !== null && (
                <p className="text-[10px] text-muted-foreground">
                  Peak today: {traffic!.peak_busyness}%
                </p>
              )}
              {traffic!.venue_open && (
                <p className="text-[10px] text-muted-foreground">
                  {traffic!.venue_open}
                  {traffic!.hours_text && ` \u00B7 ${traffic!.hours_text}`}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              {traffic?.available && traffic.venue_open
                ? `${traffic.venue_open} \u00B7 No busyness data right now`
                : "No foot traffic data for this venue"}
            </p>
          )}

          {/* 24-hour chart — always show when traffic data loaded */}
          {!trafficLoading && (
            <div className="mt-1.5 pt-1.5 border-t border-border/50">
              <TrafficChart
                venueName={building.building_name}
                currentBusyness={traffic?.forecasted_busyness ?? traffic?.day_mean}
              />
            </div>
          )}
        </div>

        {uniqueRooms.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Active rooms:</p>
            <div className="flex flex-wrap gap-1">
              {uniqueRooms.slice(0, 6).map((room) => (
                <Badge key={room.room} variant="outline" className="text-xs">
                  <MapPin className="mr-0.5 h-2.5 w-2.5" />
                  {room.room}
                  <span className="ml-1 text-muted-foreground">({room.count})</span>
                </Badge>
              ))}
              {uniqueRooms.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{uniqueRooms.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {building.building_code === "ECEB" && onView3D && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full transition-all hover:scale-[1.02]"
            onClick={onView3D}
            aria-label="Open 3D building viewer"
          >
            <Box className="mr-1.5 h-3.5 w-3.5" />
            View 3D Model
          </Button>
        )}

        <Button
          size="sm"
          className={`${building.building_code === "ECEB" && onView3D ? "mt-2" : "mt-3"} w-full transition-all hover:scale-[1.02]`}
          onClick={() => onCheckin(building.building_id, building.building_name)}
          aria-label={`Check in to ${building.building_name}`}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Check in here
        </Button>
      </div>
    </Popup>
  );
}

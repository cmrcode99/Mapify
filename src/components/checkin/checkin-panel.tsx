"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, LogOut, Clock, Loader2, BookOpen, AlertTriangle } from "lucide-react";
import { BuildingSearch } from "./building-search";
import { getActiveClass, getNextClass, formatClassTime } from "@/lib/class-schedules";
import type { Building, MyActiveCheckin } from "@/lib/types";

interface CheckinPanelProps {
  buildings: Building[];
  activeCheckin: MyActiveCheckin | null;
  onCheckin: (buildingId: string, roomNumber: string) => Promise<void>;
  onCheckout: () => Promise<void>;
  preselectedBuildingId?: string | null;
  preselectedBuildingName?: string | null;
  onClearPreselection?: () => void;
  onBuildingSelect?: (buildingId: string) => void;
}

export function CheckinPanel({
  buildings,
  activeCheckin,
  onCheckin,
  onCheckout,
  preselectedBuildingId,
  preselectedBuildingName,
  onClearPreselection,
  onBuildingSelect,
}: CheckinPanelProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedBuildingId) {
      const building = buildings.find((b) => b.id === preselectedBuildingId);
      if (building) {
        setSelectedBuilding(building);
      }
    }
  }, [preselectedBuildingId, buildings]);

  const classInfo = useMemo(() => {
    if (!selectedBuilding || !roomNumber.trim()) return null;
    const active = getActiveClass(selectedBuilding.code, roomNumber.trim());
    const next = !active ? getNextClass(selectedBuilding.code, roomNumber.trim()) : null;
    return { active, next };
  }, [selectedBuilding, roomNumber]);

  function handleBuildingSelect(building: Building) {
    setSelectedBuilding(building);
    onBuildingSelect?.(building.id);
  }

  async function handleCheckin() {
    if (!selectedBuilding || !roomNumber.trim()) {
      toast.error("Please select a building and enter a room number");
      return;
    }

    if (classInfo?.active) {
      toast.warning(
        `Heads up: ${classInfo.active.course} (${classInfo.active.title}) is in session in this room until ${formatClassTime(classInfo.active).split("–")[1].trim()}.`,
        { duration: 6000 }
      );
    }

    setSubmitting(true);
    try {
      await onCheckin(selectedBuilding.id, roomNumber.trim());
      toast.success(`Checked in to ${selectedBuilding.name} - Room ${roomNumber.trim()}`);
      setRoomNumber("");
      setSelectedBuilding(null);
      onClearPreselection?.();
    } catch {
      toast.error("Failed to check in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckout() {
    setSubmitting(true);
    try {
      await onCheckout();
      toast.success("Checked out successfully");
    } catch {
      toast.error("Failed to check out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          Check In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCheckin && (
          <>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{activeCheckin.building_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Room {activeCheckin.room_number}
                  </p>
                </div>
                <Badge variant="default" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(activeCheckin.checked_in_at)}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-3 w-3" />
                )}
                Check Out
              </Button>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Switch to a different location:
            </p>
          </>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Building</Label>
            {preselectedBuildingId && preselectedBuildingName && !selectedBuilding ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {preselectedBuildingName}
              </div>
            ) : (
              <BuildingSearch
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onSelect={handleBuildingSelect}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-number" className="text-xs">Room Number</Label>
            <Input
              id="room-number"
              placeholder="e.g. 1404"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheckin();
              }}
            />
          </div>

          {/* Class in session alert */}
          {classInfo?.active && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Class in session
                </p>
                <p className="text-xs font-medium">
                  {classInfo.active.course}: {classInfo.active.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatClassTime(classInfo.active)}
                </p>
              </div>
            </div>
          )}

          {/* Next class info */}
          {!classInfo?.active && classInfo?.next && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-2.5">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  Upcoming class
                </p>
                <p className="text-xs font-medium">
                  {classInfo.next.course}: {classInfo.next.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Starts at {formatClassTime(classInfo.next).split("–")[0].trim()}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleCheckin}
            disabled={submitting || (!selectedBuilding && !preselectedBuildingId)}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking in...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Check In
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

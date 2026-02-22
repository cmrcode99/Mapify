"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Map,
  User,
  LogOut,
  TrendingUp,
  Clock,
  Calendar,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { DAY_NAMES, formatHour } from "@/lib/map-utils";
import { signOut } from "@/app/actions";
import type { CampusTrend, BuildingTrend } from "@/lib/types";

interface TrendsDashboardProps {
  userEmail: string;
}

export function TrendsDashboard({ userEmail }: TrendsDashboardProps) {
  const [campusTrends, setCampusTrends] = useState<CampusTrend[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildingTrends, setBuildingTrends] = useState<BuildingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingLoading, setBuildingLoading] = useState(false);

  useEffect(() => {
    async function fetchCampusTrends() {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_campus_trends");
      if (data) setCampusTrends(data);
      setLoading(false);
    }
    fetchCampusTrends();
  }, []);

  const fetchBuildingTrends = useCallback(async (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setBuildingLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("get_building_trends", {
      p_building_id: buildingId,
    });
    if (data) setBuildingTrends(data);
    setBuildingLoading(false);
  }, []);

  const selectedBuilding = campusTrends.find((b) => b.building_id === selectedBuildingId);

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const matchingHours = buildingTrends.filter((t) => t.hour_of_day === hour);
    const avgCount = matchingHours.length > 0
      ? matchingHours.reduce((sum, t) => sum + t.avg_count, 0) / matchingHours.length
      : 0;
    return {
      hour: formatHour(hour),
      count: Math.round(avgCount * 10) / 10,
    };
  });

  const dailyData = DAY_NAMES.map((name, dow) => {
    const matchingDays = buildingTrends.filter((t) => t.day_of_week === dow);
    const total = matchingDays.reduce((sum, t) => sum + t.avg_count, 0);
    return {
      day: name.slice(0, 3),
      count: Math.round(total * 10) / 10,
    };
  });

  const barColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur-md border-b px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Mapify</span>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Trends
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" title="Back to map">
              <Map className="h-4 w-4" />
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

      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        {/* Top buildings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Most Popular Buildings
            </CardTitle>
            <CardDescription>
              Buildings ranked by total check-ins. Click one to see detailed trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : campusTrends.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No check-in data yet. Be the first to check in!
              </p>
            ) : (
              <div className="space-y-2">
                {campusTrends.slice(0, 15).map((trend, i) => (
                  <button
                    key={trend.building_id}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedBuildingId === trend.building_id ? "border-primary bg-muted/50" : ""
                    }`}
                    onClick={() => fetchBuildingTrends(trend.building_id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{trend.building_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{trend.building_code}</span>
                          {trend.peak_hour !== null && (
                            <>
                              <span className="text-border">|</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                Peak: {formatHour(trend.peak_hour)}
                              </span>
                            </>
                          )}
                          {trend.busiest_day !== null && (
                            <>
                              <span className="text-border">|</span>
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3" />
                                {DAY_NAMES[trend.busiest_day]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {trend.total_checkins} check-ins
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Building detail */}
        {selectedBuilding && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Hourly Activity - {selectedBuilding.building_name}
                </CardTitle>
                <CardDescription>Average check-ins by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                {buildingLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10 }}
                        interval={2}
                        className="fill-muted-foreground"
                      />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {hourlyData.map((_, i) => (
                          <Cell key={i} fill={barColors[i % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Daily Activity - {selectedBuilding.building_name}
                </CardTitle>
                <CardDescription>Average check-ins by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                {buildingLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {dailyData.map((_, i) => (
                          <Cell key={i} fill={barColors[i % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

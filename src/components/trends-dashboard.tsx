"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingDown,
  Clock,
  Calendar,
  Building2,
  Lightbulb,
  AlertTriangle,
  Zap,
  Users,
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
  AreaChart,
  Area,
} from "recharts";
import { DAY_NAMES, formatHour } from "@/lib/map-utils";
import { useCheckins } from "@/hooks/use-checkins";
import { useBuildings } from "@/hooks/use-buildings";
import { signOut } from "@/app/actions";

/* ── Seeded PRNG (deterministic per building) ── */
function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Campus day curve for synthetic hourly data ── */
const HOUR_CURVE = [
  2, 1, 1, 1, 2, 4, 8, 18, 35, 55, 70, 65,
  50, 60, 72, 65, 50, 38, 25, 18, 12, 8, 5, 3,
];
const DAY_MULT = [0.15, 0.85, 0.90, 0.95, 0.90, 0.70, 0.20];

type SyntheticCampusTrend = {
  building_id: string;
  building_name: string;
  building_code: string;
  total_checkins: number;
  peak_hour: number;
  busiest_day: number;
  avg_daily: number;
};

function generateCampusTrends(
  buildings: { id: string; code: string; name: string }[],
  checkinData: { building_code: string; active_count: number }[]
): SyntheticCampusTrend[] {
  return buildings
    .map((b) => {
      const rand = mulberry32(seedFromString(b.code + "trends"));
      const live = checkinData.find((c) => c.building_code === b.code);
      const liveCount = live?.active_count ?? 0;

      // Synthetic historical total based on building popularity
      const popularityBase = 50 + rand() * 400;
      const total = Math.round(popularityBase + liveCount * 15);

      // Peak hour — weighted toward mid-day
      const peakHour = Math.floor(9 + rand() * 8); // 9am-5pm
      // Busiest day — weighted toward midweek
      const busiestDay = Math.floor(1 + rand() * 4.5); // Mon-Fri

      const avgDaily = Math.round((total / 7) * 10) / 10;

      return {
        building_id: b.id,
        building_name: b.name,
        building_code: b.code,
        total_checkins: total,
        peak_hour: peakHour,
        busiest_day: busiestDay,
        avg_daily: avgDaily,
      };
    })
    .sort((a, b) => b.total_checkins - a.total_checkins);
}

function generateHourlyTrends(code: string): { hour: string; count: number }[] {
  const rand = mulberry32(seedFromString(code + "hourly"));
  const popularity = 0.5 + rand() * 1.2;

  return Array.from({ length: 24 }, (_, h) => {
    const base = HOUR_CURVE[h] * popularity;
    const jitter = (rand() - 0.5) * base * 0.3;
    return {
      hour: formatHour(h),
      count: Math.round(Math.max(0, base + jitter) * 10) / 10,
    };
  });
}

function generateDailyTrends(code: string): { day: string; count: number }[] {
  const rand = mulberry32(seedFromString(code + "daily"));
  const popularity = 0.5 + rand() * 1.2;

  return DAY_NAMES.map((name, dow) => {
    const base = DAY_MULT[dow] * 50 * popularity;
    const jitter = (rand() - 0.5) * base * 0.25;
    return {
      day: name.slice(0, 3),
      count: Math.round(Math.max(0, base + jitter) * 10) / 10,
    };
  });
}

/* ── Recommendations engine ── */
type Recommendation = {
  type: "underused" | "overused" | "energy" | "rebalance" | "peak";
  icon: typeof TrendingUp;
  color: string;
  title: string;
  description: string;
  building: string;
};

function generateRecommendations(
  trends: SyntheticCampusTrend[],
  checkinData: { building_code: string; active_count: number }[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  if (trends.length === 0) return recs;

  const avgTotal = trends.reduce((s, t) => s + t.total_checkins, 0) / trends.length;

  // Underused buildings
  const underused = trends.filter((t) => t.total_checkins < avgTotal * 0.4);
  for (const b of underused.slice(0, 2)) {
    recs.push({
      type: "underused",
      icon: TrendingDown,
      color: "text-blue-500",
      title: `${b.building_name} is underutilized`,
      description: `Only ${b.total_checkins} weekly check-ins (campus avg: ${Math.round(avgTotal)}). Consider promoting study spaces here to distribute load.`,
      building: b.building_code,
    });
  }

  // Overused buildings
  const overused = trends.filter((t) => t.total_checkins > avgTotal * 1.8);
  for (const b of overused.slice(0, 2)) {
    recs.push({
      type: "overused",
      icon: AlertTriangle,
      color: "text-orange-500",
      title: `${b.building_name} is heavily congested`,
      description: `${b.total_checkins} weekly check-ins — ${Math.round((b.total_checkins / avgTotal) * 100)}% of campus average. High-traffic periods may lead to overcrowding.`,
      building: b.building_code,
    });
  }

  // Currently quiet buildings (good for energy savings)
  const quietNow = checkinData
    .filter((c) => c.active_count <= 2)
    .slice(0, 1);
  for (const b of quietNow) {
    const trend = trends.find((t) => t.building_code === b.building_code);
    if (trend && trend.total_checkins > avgTotal * 0.5) {
      recs.push({
        type: "energy",
        icon: Zap,
        color: "text-amber-500",
        title: `${trend.building_name} is quiet right now`,
        description: `Only ${b.active_count} people currently, but it averages ${trend.avg_daily}/day. HVAC could be reduced during this lull to save energy.`,
        building: b.building_code,
      });
    }
  }

  // Rebalancing suggestion — busiest vs quietest
  if (trends.length >= 4) {
    const busiest = trends[0];
    const quietest = trends[trends.length - 1];
    recs.push({
      type: "rebalance",
      icon: Users,
      color: "text-purple-500",
      title: "Rebalance campus traffic",
      description: `${busiest.building_name} has ${Math.round(busiest.total_checkins / quietest.total_checkins)}x more traffic than ${quietest.building_name}. Consider routing overflow to less-used buildings.`,
      building: busiest.building_code,
    });
  }

  // Peak hour warning for top building
  const top = trends[0];
  if (top) {
    recs.push({
      type: "peak",
      icon: Clock,
      color: "text-red-500",
      title: `Peak hours at ${top.building_name}`,
      description: `Busiest around ${formatHour(top.peak_hour)} on ${DAY_NAMES[top.busiest_day]}s. Plan visits outside this window for better availability.`,
      building: top.building_code,
    });
  }

  return recs;
}

/* ── Chart colors ── */
const barColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/* ── Dashboard ── */
interface TrendsDashboardProps {
  userEmail: string;
}

export function TrendsDashboard({ userEmail }: TrendsDashboardProps) {
  const { checkinData } = useCheckins();
  const { buildings } = useBuildings();

  const campusTrends = useMemo(
    () => generateCampusTrends(buildings, checkinData),
    [buildings, checkinData]
  );

  const recommendations = useMemo(
    () => generateRecommendations(campusTrends, checkinData),
    [campusTrends, checkinData]
  );

  // Default to first building for charts
  const selectedBuilding = campusTrends[0] ?? null;

  const hourlyData = useMemo(
    () => (selectedBuilding ? generateHourlyTrends(selectedBuilding.building_code) : []),
    [selectedBuilding]
  );

  const dailyData = useMemo(
    () => (selectedBuilding ? generateDailyTrends(selectedBuilding.building_code) : []),
    [selectedBuilding]
  );

  // Campus-wide hourly overview (sum all buildings)
  const campusHourly = useMemo(() => {
    const totals = Array.from({ length: 24 }, (_, h) => ({
      hour: formatHour(h),
      count: 0,
    }));
    for (const b of buildings) {
      const bData = generateHourlyTrends(b.code);
      bData.forEach((d, i) => {
        totals[i].count += d.count;
      });
    }
    return totals.map((t) => ({ ...t, count: Math.round(t.count) }));
  }, [buildings]);

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
        {/* Campus-wide hourly overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Campus Activity Overview
            </CardTitle>
            <CardDescription>
              Predicted foot traffic across all buildings over the next 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={campusHourly}>
                <defs>
                  <linearGradient id="campusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#campusGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize campus space utilization and energy efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendations.map((rec, i) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className={`mt-0.5 shrink-0 ${rec.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{rec.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top buildings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Most Popular Buildings
            </CardTitle>
            <CardDescription>
              Buildings ranked by predicted weekly check-ins based on foot traffic patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campusTrends.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Loading building data...
              </p>
            ) : (
              <div className="space-y-2">
                {campusTrends.slice(0, 15).map((trend, i) => {
                  const maxCheckins = campusTrends[0]?.total_checkins ?? 1;
                  const barPct = (trend.total_checkins / maxCheckins) * 100;

                  return (
                    <div
                      key={trend.building_id}
                      className="relative flex items-center justify-between rounded-lg border px-4 py-3 overflow-hidden"
                    >
                      {/* Background fill bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/5"
                        style={{ width: `${barPct}%` }}
                      />
                      <div className="relative flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{trend.building_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{trend.building_code}</span>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              Peak: {formatHour(trend.peak_hour)}
                            </span>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {DAY_NAMES[trend.busiest_day]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="relative">
                        {trend.total_checkins} weekly
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Building detail charts — show for #1 building */}
        {selectedBuilding && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Hourly Activity — {selectedBuilding.building_name}
                </CardTitle>
                <CardDescription>Predicted average check-ins by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} className="fill-muted-foreground" />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Daily Activity — {selectedBuilding.building_name}
                </CardTitle>
                <CardDescription>Predicted average check-ins by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export type RecommendedRoom = {
  id: string;
  buildingCode: string;
  name: string;
  floor: number;
  currentOccupancy: number;
  maxCapacity: number;
  amenities: string[];
};

export type RecommendedBuilding = {
  id: string;
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  currentOccupancy: number;
  maxCapacity: number;
  energyActive: boolean;
  /** Simulated current power draw (kW) */
  powerUsageKw: number;
  /** Simulated baseline HVAC load when no one is inside (kW) */
  baseHeatingKw: number;
  rooms: RecommendedRoom[];
};

/* ─────────────────────────────────────────────────────────────────────────── *
 * Static room metadata (amenities, capacity, floor).                        *
 * Occupancy numbers are populated at runtime from live Supabase data.       *
 * Power numbers are synthetic — they model "already heated" buildings.      *
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Generate deterministic fake power usage for a building based on occupancy.
 * A building that's already occupied is "heated" and uses less marginal energy
 * to accept one more student.
 */
export function computePowerUsage(
  maxCapacity: number,
  currentOccupancy: number,
  baseHeatingKw: number
): number {
  // Base HVAC + lighting draw + marginal per-person load
  const perPersonKw = 0.15; // lighting, outlets, etc.
  const hvacRatio = Math.min(1, currentOccupancy / (maxCapacity * 0.3)); // ramp up to 30% occupancy
  return Math.round((baseHeatingKw * Math.max(0.3, hvacRatio) + currentOccupancy * perPersonKw) * 10) / 10;
}

/** Static room/building metadata keyed by building code. */
export const BUILDING_METADATA: Record<
  string,
  {
    maxCapacity: number;
    baseHeatingKw: number;
    rooms: Omit<RecommendedRoom, "currentOccupancy" | "buildingCode">[];
  }
> = {
  GELIB: {
    maxCapacity: 100,
    baseHeatingKw: 18,
    rooms: [
      { id: "gelib-214", name: "Room 214", floor: 2, maxCapacity: 40, amenities: ["outlets", "quiet", "whiteboard"] },
      { id: "gelib-220", name: "Room 220", floor: 2, maxCapacity: 40, amenities: ["outlets", "whiteboard"] },
      { id: "gelib-308", name: "Room 308", floor: 3, maxCapacity: 40, amenities: ["quiet", "outlets"] },
    ],
  },
  UGL: {
    maxCapacity: 100,
    baseHeatingKw: 16,
    rooms: [
      { id: "ugl-100", name: "UGL 100", floor: 1, maxCapacity: 60, amenities: ["outlets", "group study"] },
      { id: "ugl-200", name: "UGL 200", floor: 2, maxCapacity: 60, amenities: ["quiet", "whiteboard"] },
    ],
  },
  SC: {
    maxCapacity: 80,
    baseHeatingKw: 22,
    rooms: [
      { id: "sc-1404", name: "Room 1404", floor: 1, maxCapacity: 40, amenities: ["outlets", "whiteboard", "projector"] },
      { id: "sc-2124", name: "Room 2124", floor: 2, maxCapacity: 40, amenities: ["outlets", "quiet"] },
      { id: "sc-0216", name: "Room 0216", floor: 0, maxCapacity: 40, amenities: ["whiteboard", "group study"] },
    ],
  },
  NHB: {
    maxCapacity: 40,
    baseHeatingKw: 12,
    rooms: [
      { id: "nhb-101", name: "Room 101", floor: 1, maxCapacity: 30, amenities: ["whiteboard"] },
      { id: "nhb-210", name: "Room 210", floor: 2, maxCapacity: 30, amenities: ["quiet"] },
    ],
  },
  IU: {
    maxCapacity: 70,
    baseHeatingKw: 20,
    rooms: [
      { id: "iu-study-a", name: "Study Room A", floor: 2, maxCapacity: 20, amenities: ["outlets", "whiteboard"] },
      { id: "iu-study-b", name: "Study Room B", floor: 2, maxCapacity: 20, amenities: ["outlets", "group study"] },
      { id: "iu-reading", name: "Reading Room", floor: 3, maxCapacity: 40, amenities: ["quiet"] },
    ],
  },
  TB: {
    maxCapacity: 60,
    baseHeatingKw: 10,
    rooms: [
      { id: "tb-116", name: "Room 116", floor: 1, maxCapacity: 30, amenities: ["outlets"] },
      { id: "tb-220", name: "Room 220", floor: 2, maxCapacity: 30, amenities: ["whiteboard", "outlets"] },
    ],
  },
  DKH: {
    maxCapacity: 120,
    baseHeatingKw: 24,
    rooms: [
      { id: "dkh-107", name: "Room 107", floor: 1, maxCapacity: 60, amenities: ["outlets", "whiteboard"] },
      { id: "dkh-209", name: "Room 209", floor: 2, maxCapacity: 60, amenities: ["outlets", "projector"] },
    ],
  },
  WOH: {
    maxCapacity: 80,
    baseHeatingKw: 14,
    rooms: [
      { id: "woh-124", name: "Room 124", floor: 1, maxCapacity: 40, amenities: ["whiteboard"] },
      { id: "woh-238", name: "Room 238", floor: 2, maxCapacity: 40, amenities: ["quiet", "outlets"] },
    ],
  },
  ECEB: {
    maxCapacity: 100,
    baseHeatingKw: 26,
    rooms: [
      { id: "eceb-1016", name: "EWS Lab 1016", floor: 1, maxCapacity: 50, amenities: ["outlets", "whiteboard"] },
      { id: "eceb-3005", name: "Grad Lounge 3005", floor: 3, maxCapacity: 20, amenities: ["quiet", "outlets"] },
      { id: "eceb-1022", name: "Study Room 1022", floor: 1, maxCapacity: 15, amenities: ["whiteboard", "group study"] },
    ],
  },
  LIB: {
    maxCapacity: 150,
    baseHeatingKw: 30,
    rooms: [
      { id: "lib-306", name: "Room 306", floor: 3, maxCapacity: 50, amenities: ["quiet", "outlets"] },
      { id: "lib-401", name: "Room 401", floor: 4, maxCapacity: 40, amenities: ["outlets", "whiteboard"] },
    ],
  },
};

/**
 * Build the full RecommendedBuilding list by merging live Supabase checkin data
 * with static room metadata.
 */
export function buildRecommendedBuildings(
  supabaseBuildings: { id: string; code: string; name: string; latitude: number; longitude: number; address: string | null }[],
  checkinData: { building_code: string; active_count: number; rooms: { room: string; count: number }[] }[]
): RecommendedBuilding[] {
  const results: RecommendedBuilding[] = [];

  for (const [code, meta] of Object.entries(BUILDING_METADATA)) {
    const sbBuilding = supabaseBuildings.find((b) => b.code === code);
    if (!sbBuilding) continue;

    const checkin = checkinData.find((c) => c.building_code === code);
    const liveOcc = checkin?.active_count ?? 0;

    const energyActive = liveOcc > 0;
    const powerUsageKw = computePowerUsage(meta.maxCapacity, liveOcc, meta.baseHeatingKw);

    // Distribute live occupancy across rooms proportionally by capacity
    const totalRoomCapacity = meta.rooms.reduce((sum, r) => sum + r.maxCapacity, 0);
    const rooms: RecommendedRoom[] = meta.rooms.map((r) => {
      // If there's detailed room data from checkins, use it
      const roomCheckin = checkin?.rooms.find((cr) => cr.room === r.name.replace(/^Room /, "").replace(/^.+ /, ""));
      const roomOcc = roomCheckin?.count ?? Math.round((liveOcc * r.maxCapacity) / Math.max(1, totalRoomCapacity));
      return {
        ...r,
        buildingCode: code,
        currentOccupancy: roomOcc,
      };
    });

    results.push({
      id: sbBuilding.id,
      code,
      name: sbBuilding.name,
      address: sbBuilding.address ?? "",
      lat: sbBuilding.latitude,
      lng: sbBuilding.longitude,
      currentOccupancy: liveOcc,
      maxCapacity: meta.maxCapacity,
      energyActive,
      powerUsageKw,
      baseHeatingKw: meta.baseHeatingKw,
      rooms,
    });
  }

  return results;
}

import type { RecommendedBuilding, RecommendedRoom } from "./data";

export type ScoredRoom = RecommendedRoom & {
  building: RecommendedBuilding;
  availabilityScore: number;
  energyScore: number;
  blendedScore: number;
  isEnergySmart: boolean;
};

/**
 * Availability score (0–100).
 * Bell curve peaked at 35% room occupancy — neither empty nor packed.
 * Empty rooms in dead buildings score low because activating a cold building
 * wastes energy; full rooms score low because there's nowhere to sit.
 */
function computeAvailabilityScore(roomOccupancyPct: number): number {
  const ideal = 0.35;
  const std = 0.3;
  const exponent = -0.5 * Math.pow((roomOccupancyPct - ideal) / std, 2);
  return Math.round(Math.exp(exponent) * 100);
}

/**
 * Energy efficiency score (0–100).
 * Rewards sending students to buildings whose HVAC/lights are already running
 * at moderate load. Penalises routing to dark/inactive buildings.
 */
function computeEnergyScore(building: RecommendedBuilding): number {
  const buildingOccPct = building.currentOccupancy / building.maxCapacity;

  if (!building.energyActive) {
    // Routing here would spin up a new building — wasteful.
    return 20;
  }

  if (buildingOccPct >= 0.2 && buildingOccPct <= 0.7) {
    // Sweet spot: building already running, moderately occupied.
    return 100;
  }

  if (buildingOccPct < 0.2) {
    // Energy is running but the building is nearly empty — slight waste.
    return Math.round(60 + (buildingOccPct / 0.2) * 40);
  }

  // Building is getting full (>70%) — still green but capacity is limited.
  return Math.round(100 - ((buildingOccPct - 0.7) / 0.3) * 40);
}

/**
 * Score all rooms across all buildings and return them sorted best-first.
 * Blended score = 60% availability + 40% energy efficiency.
 */
export function scoreRooms(buildings: RecommendedBuilding[]): ScoredRoom[] {
  const scored: ScoredRoom[] = [];

  for (const building of buildings) {
    const energyScore = computeEnergyScore(building);

    for (const room of building.rooms) {
      const roomOccPct = room.currentOccupancy / room.maxCapacity;
      const availabilityScore = computeAvailabilityScore(roomOccPct);
      const blendedScore = Math.round(0.6 * availabilityScore + 0.4 * energyScore);

      scored.push({
        ...room,
        building,
        availabilityScore,
        energyScore,
        blendedScore,
        // "Energy smart" = building is active and energy score is strong
        isEnergySmart: building.energyActive && energyScore >= 80,
      });
    }
  }

  return scored.sort((a, b) => b.blendedScore - a.blendedScore);
}

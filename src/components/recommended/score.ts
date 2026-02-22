import type { RecommendedBuilding, RecommendedRoom } from "./data";

export type ScoredRoom = RecommendedRoom & {
  building: RecommendedBuilding;
  availabilityScore: number;
  energyScore: number;
  blendedScore: number;
  isEnergySmart: boolean;
  /** Marginal kW cost to add one more person to this building */
  marginalPowerKw: number;
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
 * at moderate load. Uses live power usage data.
 */
function computeEnergyScore(building: RecommendedBuilding): number {
  const buildingOccPct = building.currentOccupancy / building.maxCapacity;

  if (!building.energyActive) {
    // Routing here would spin up HVAC in a cold building — very wasteful.
    return 15;
  }

  // Building is already heated — great! Score based on how efficiently loaded it is.
  // Sweet spot: 20–70% gives best marginal efficiency.
  if (buildingOccPct >= 0.2 && buildingOccPct <= 0.7) {
    return 100;
  }

  if (buildingOccPct < 0.2) {
    // Energy running but nearly empty — slightly wasteful but HVAC is warm.
    return Math.round(60 + (buildingOccPct / 0.2) * 40);
  }

  // >70% — still green but getting crowded.
  return Math.round(100 - ((buildingOccPct - 0.7) / 0.3) * 40);
}

/**
 * Marginal power cost: how many extra kW does adding one person cost?
 * Pre-heated buildings cost almost nothing; cold buildings cost the HVAC ramp-up.
 */
function computeMarginalPower(building: RecommendedBuilding): number {
  const perPersonKw = 0.15;
  if (building.energyActive) {
    // Building already on — just the marginal per-person load.
    return Math.round(perPersonKw * 100) / 100;
  }
  // Cold building — need to turn on HVAC first (amortised over expected occupants).
  return Math.round((building.baseHeatingKw * 0.3 + perPersonKw) * 100) / 100;
}

/**
 * Score all rooms across all buildings and return them sorted best-first.
 * Blended score = 55% availability + 45% energy efficiency.
 */
export function scoreRooms(buildings: RecommendedBuilding[]): ScoredRoom[] {
  const scored: ScoredRoom[] = [];

  for (const building of buildings) {
    const energyScore = computeEnergyScore(building);
    const marginalPowerKw = computeMarginalPower(building);

    for (const room of building.rooms) {
      const roomOccPct = room.maxCapacity > 0
        ? room.currentOccupancy / room.maxCapacity
        : 0;
      const availabilityScore = computeAvailabilityScore(roomOccPct);
      const blendedScore = Math.round(0.55 * availabilityScore + 0.45 * energyScore);

      scored.push({
        ...room,
        building,
        availabilityScore,
        energyScore,
        blendedScore,
        marginalPowerKw,
        // "Energy smart" = building is already heated and energy score is strong
        isEnergySmart: building.energyActive && energyScore >= 80,
      });
    }
  }

  return scored.sort((a, b) => b.blendedScore - a.blendedScore);
}

#!/usr/bin/env node
/**
 * Build SC room metadata + room-id lookup grid from identified flood-fill regions.
 * Inputs:  scripts/room-regions-sc.json
 * Outputs: public/room-map-sc.json, public/room-ids-sc.json
 */
import { readFileSync, writeFileSync } from "fs";

const regionData = JSON.parse(readFileSync("scripts/room-regions-sc.json", "utf8"));

function createPicker(floorIdx) {
  const floor = regionData[floorIdx];
  const used = new Set();

  function pick({ id, name, type, centroid, minCells = 15, maxDist = 80 }) {
    let best = null;
    let bestDist = Infinity;

    for (let i = 0; i < floor.regions.length; i++) {
      if (used.has(i)) continue;
      const reg = floor.regions[i];
      if (reg.type !== type) continue;
      if (reg.cellCount < minCells) continue;

      const dr = reg.centroid[0] - centroid[0];
      const dc = reg.centroid[1] - centroid[1];
      const dist = Math.sqrt(dr * dr + dc * dc);
      if (dist <= maxDist && dist < bestDist) {
        best = { index: i, reg };
        bestDist = dist;
      }
    }

    if (!best) {
      console.warn(`WARN: could not map ${id} on floor ${floorIdx}`);
      return null;
    }

    used.add(best.index);
    return {
      id,
      name,
      centroid: best.reg.centroid,
      cellCount: best.reg.cellCount,
      cells: best.reg.cells,
    };
  }

  return { pick };
}

const mappedFloors = [];

// Basement
{
  const { pick } = createPicker(0);
  const rooms = [
    pick({ id: "405", name: "Auditorium", type: "C", centroid: [90, 112], minCells: 600 }),
    pick({ id: "401", name: "Lecture Hall", type: "C", centroid: [82, 78], minCells: 150 }),
    pick({ id: "407", name: "Lecture Hall", type: "C", centroid: [100, 78], minCells: 120 }),
    pick({ id: "409", name: "Lecture Hall", type: "C", centroid: [100, 58], minCells: 100 }),
    pick({ id: "224", name: "Teaching Lab", type: "L", centroid: [36, 24], minCells: 80 }),
    pick({ id: "226", name: "Teaching Lab", type: "L", centroid: [50, 24], minCells: 80 }),
    pick({ id: "228", name: "Teaching Lab", type: "L", centroid: [36, 54], minCells: 80 }),
    pick({ id: "230", name: "Teaching Lab", type: "L", centroid: [50, 54], minCells: 80 }),
    pick({ id: "232", name: "Teaching Lab", type: "L", centroid: [64, 54], minCells: 80 }),
    pick({ id: "105", name: "Server Room", type: "A", centroid: [78, 26], minCells: 40 }),
    pick({ id: "109", name: "Server Room", type: "A", centroid: [86, 40], minCells: 40 }),
    pick({ id: "C000", name: "Corridor", type: "G", centroid: [68, 44], minCells: 800 }),
    pick({ id: "STAIR1", name: "Stair", type: "R", centroid: [26, 28], minCells: 5 }),
    pick({ id: "STAIR2", name: "Stair", type: "R", centroid: [96, 28], minCells: 5 }),
  ].filter(Boolean);

  mappedFloors.push({ label: "Basement", rooms });
}

// First
{
  const { pick } = createPicker(1);
  const rooms = [
    pick({ id: "1404", name: "Large Lecture Hall", type: "C", centroid: [92, 112], minCells: 600 }),
    pick({ id: "1302", name: "Lecture Hall", type: "C", centroid: [86, 80], minCells: 200 }),
    pick({ id: "1109", name: "Lecture Hall", type: "C", centroid: [94, 32], minCells: 200 }),
    pick({ id: "ACM", name: "ACM Room", type: "S", centroid: [64, 82], minCells: 120 }),
    pick({ id: "1112", name: "Faculty Office", type: "O", centroid: [29, 24], minCells: 60 }),
    pick({ id: "1114", name: "Faculty Office", type: "O", centroid: [39, 24], minCells: 60 }),
    pick({ id: "1128", name: "Faculty Office", type: "O", centroid: [49, 54], minCells: 60 }),
    pick({ id: "1201", name: "Admin", type: "A", centroid: [59, 67], minCells: 50 }),
    pick({ id: "C1000", name: "Lobby / Corridor", type: "G", centroid: [68, 44], minCells: 900 }),
    pick({ id: "STAIR1", name: "Stair", type: "R", centroid: [24, 28], minCells: 5 }),
    pick({ id: "STAIR2", name: "Stair", type: "R", centroid: [71, 55], minCells: 5 }),
  ].filter(Boolean);

  mappedFloors.push({ label: "First Floor", rooms });
}

// Second
{
  const { pick } = createPicker(2);
  const rooms = [
    pick({ id: "2405", name: "Classroom", type: "C", centroid: [86, 112], minCells: 300 }),
    pick({ id: "2401", name: "Conference Room", type: "C", centroid: [81, 88], minCells: 120 }),
    pick({ id: "2403", name: "Conference Room", type: "C", centroid: [95, 88], minCells: 120 }),
    pick({ id: "2101", name: "Faculty Office", type: "O", centroid: [29, 24], minCells: 60 }),
    pick({ id: "2103", name: "Faculty Office", type: "O", centroid: [39, 24], minCells: 60 }),
    pick({ id: "2105", name: "Faculty Office", type: "O", centroid: [49, 24], minCells: 60 }),
    pick({ id: "2111", name: "Faculty Office", type: "O", centroid: [69, 54], minCells: 60 }),
    pick({ id: "2411", name: "Faculty Office", type: "O", centroid: [79, 132], minCells: 40 }),
    pick({ id: "2413", name: "Faculty Office", type: "O", centroid: [89, 132], minCells: 40 }),
    pick({ id: "2415", name: "Faculty Office", type: "O", centroid: [99, 132], minCells: 40 }),
    pick({ id: "DEAN", name: "Admin", type: "A", centroid: [58, 66], minCells: 80 }),
    pick({ id: "C2000", name: "Corridor", type: "G", centroid: [68, 44], minCells: 900 }),
    pick({ id: "STAIR1", name: "Stair", type: "R", centroid: [23, 28], minCells: 5 }),
    pick({ id: "STAIR2", name: "Stair", type: "R", centroid: [97, 28], minCells: 5 }),
  ].filter(Boolean);

  mappedFloors.push({ label: "Second Floor", rooms });
}

// Third
{
  const { pick } = createPicker(3);
  const rooms = [
    pick({ id: "3401", name: "Conference Room", type: "C", centroid: [82, 110], minCells: 240 }),
    pick({ id: "3101", name: "Faculty Office", type: "O", centroid: [29, 24], minCells: 60 }),
    pick({ id: "3103", name: "Faculty Office", type: "O", centroid: [39, 24], minCells: 60 }),
    pick({ id: "3111", name: "Faculty Office", type: "O", centroid: [91, 54], minCells: 60 }),
    pick({ id: "3403", name: "Faculty Office", type: "O", centroid: [79, 132], minCells: 40 }),
    pick({ id: "3405", name: "Faculty Office", type: "O", centroid: [89, 132], minCells: 40 }),
    pick({ id: "3407", name: "Faculty Office", type: "O", centroid: [99, 132], minCells: 40 }),
    pick({ id: "C3000", name: "Corridor", type: "G", centroid: [68, 44], minCells: 700 }),
    pick({ id: "STAIR1", name: "Stair", type: "R", centroid: [23, 28], minCells: 5 }),
    pick({ id: "STAIR2", name: "Stair", type: "R", centroid: [71, 54], minCells: 5 }),
  ].filter(Boolean);

  mappedFloors.push({ label: "Third Floor", rooms });
}

// Fourth
{
  const { pick } = createPicker(4);
  const rooms = [
    pick({ id: "4401", name: "Conference Room", type: "C", centroid: [82, 110], minCells: 200 }),
    pick({ id: "4403", name: "Conference Room", type: "C", centroid: [98, 110], minCells: 200 }),
    pick({ id: "4101", name: "Faculty Office", type: "O", centroid: [29, 24], minCells: 60 }),
    pick({ id: "4103", name: "Faculty Office", type: "O", centroid: [39, 24], minCells: 60 }),
    pick({ id: "4105", name: "Faculty Office", type: "O", centroid: [49, 24], minCells: 60 }),
    pick({ id: "4111", name: "Faculty Office", type: "O", centroid: [91, 54], minCells: 60 }),
    pick({ id: "4405", name: "Faculty Office", type: "O", centroid: [79, 132], minCells: 40 }),
    pick({ id: "4407", name: "Faculty Office", type: "O", centroid: [89, 132], minCells: 40 }),
    pick({ id: "4409", name: "Faculty Office", type: "O", centroid: [99, 132], minCells: 40 }),
    pick({ id: "C4000", name: "Corridor", type: "G", centroid: [68, 44], minCells: 700 }),
    pick({ id: "STAIR1", name: "Stair", type: "R", centroid: [23, 28], minCells: 5 }),
    pick({ id: "STAIR2", name: "Stair", type: "R", centroid: [74, 56], minCells: 5 }),
  ].filter(Boolean);

  mappedFloors.push({ label: "Fourth Floor", rooms });
}

const roomMap = {
  floors: mappedFloors.map((f) => ({
    label: f.label,
    rooms: f.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      centroid: r.centroid,
      cellCount: r.cellCount,
    })),
  })),
};

const roomGrids = mappedFloors.map((floor, fi) => {
  const [rows, cols] = regionData[fi].gridSize;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const room of floor.rooms) {
    for (const [r, c] of room.cells) {
      grid[r][c] = room.id;
    }
  }
  return grid;
});

writeFileSync("public/room-map-sc.json", `${JSON.stringify(roomMap)}\n`);
writeFileSync("public/room-ids-sc.json", `${JSON.stringify({ roomGrids })}\n`);

for (const floor of roomMap.floors) {
  console.log(`${floor.label}: ${floor.rooms.length} rooms mapped`);
}
console.log("Wrote public/room-map-sc.json and public/room-ids-sc.json");

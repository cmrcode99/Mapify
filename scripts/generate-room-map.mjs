#!/usr/bin/env node
/**
 * Generate room-map.json from room-regions.json + manual room number assignments.
 * Maps identified grid regions to actual ECEB room numbers from the 2014 floor plan PDF.
 */
import { readFileSync, writeFileSync } from "fs";

const regions = JSON.parse(readFileSync("scripts/room-regions.json", "utf8"));

// Helper: find region closest to a centroid with matching type and minimum cell count
function findRegion(floorIdx, type, approxCentroid, minCells = 5, maxDist = 30) {
  const floor = regions[floorIdx];
  let best = null;
  let bestDist = Infinity;
  for (const reg of floor.regions) {
    if (reg.type !== type) continue;
    if (reg.cellCount < minCells) continue;
    const dr = reg.centroid[0] - approxCentroid[0];
    const dc = reg.centroid[1] - approxCentroid[1];
    const dist = Math.sqrt(dr * dr + dc * dc);
    if (dist < bestDist && dist < maxDist) {
      bestDist = dist;
      best = reg;
    }
  }
  return best;
}

// Helper: find all small regions of a type in a bounding box area
function findRegionsInArea(floorIdx, type, bbox, minCells = 1, maxCells = Infinity) {
  const floor = regions[floorIdx];
  return floor.regions.filter(reg => {
    if (reg.type !== type) return false;
    if (reg.cellCount < minCells || reg.cellCount > maxCells) return false;
    return reg.centroid[0] >= bbox.minR && reg.centroid[0] <= bbox.maxR &&
           reg.centroid[1] >= bbox.minC && reg.centroid[1] <= bbox.maxC;
  });
}

const roomMap = { floors: [] };

// ============ LEVEL 01 ============
{
  const rooms = [];

  // 1002 - Auditorium (largest C region)
  const r1002 = findRegion(0, "C", [102, 152], 1000);
  if (r1002) rooms.push({ id: "1002", name: "Auditorium", cells: r1002.cells });

  // 1013 - Small Auditorium (second largest C region)
  const r1013 = findRegion(0, "C", [106, 64], 500);
  if (r1013) rooms.push({ id: "1013", name: "Small Auditorium", cells: r1013.cells });

  // 1005 - ECE Store / Cafe area
  const r1005 = findRegion(0, "G", [88, 56], 50);
  if (r1005) rooms.push({ id: "1005", name: "Cafe", cells: r1005.cells });

  // 1014 - Projects Instructional Lab (large L region, upper right)
  const r1014 = findRegion(0, "L", [34, 145], 500);
  if (r1014) rooms.push({ id: "1014", name: "Projects Instructional Lab", cells: r1014.cells });

  // 1016 - EWS Computer Lab (large L region, center)
  const r1016 = findRegion(0, "L", [70, 97], 1000);
  if (r1016) rooms.push({ id: "1016", name: "EWS Computer Lab", cells: r1016.cells });

  // 1001 - Office area (large A region, top right)
  const r1001 = findRegion(0, "A", [6, 167], 200);
  if (r1001) rooms.push({ id: "1001", name: "ECE 110 Office", cells: r1001.cells });

  // 1031 - TA Meeting Room area (A region, left side)
  const r1031 = findRegion(0, "A", [34, 65], 100);
  if (r1031) rooms.push({ id: "1031", name: "TA Meeting Room", cells: r1031.cells });

  // 1036 - Student Organizational Office (S region)
  const r1036 = findRegion(0, "S", [28, 105], 100);
  if (r1036) rooms.push({ id: "1036", name: "Student Organizational Office", cells: r1036.cells });

  // 1022 - Group Study Room (G region near center)
  const r1022 = findRegion(0, "G", [82, 128], 50);
  if (r1022) rooms.push({ id: "1022", name: "Group Study Room", cells: r1022.cells });

  // 1024 - Group Study Room
  const r1024 = findRegion(0, "G", [101, 127], 50);
  if (r1024) rooms.push({ id: "1024", name: "Group Study Room", cells: r1024.cells });

  // 1034 - Instructional Support
  const r1034 = findRegion(0, "G", [107, 106], 200);
  if (r1034) rooms.push({ id: "1034", name: "Instructional Support", cells: r1034.cells });

  // 1006 - Furniture Storage (G region, bottom right)
  const r1006 = findRegion(0, "G", [83, 174], 50);
  if (r1006) rooms.push({ id: "1006", name: "Furniture Storage", cells: r1006.cells });

  // Corridor / lobby areas
  const r1000 = findRegion(0, "G", [16, 71], 2000);
  if (r1000) rooms.push({ id: "C1000", name: "Lobby / Corridor", cells: r1000.cells });

  // Stairwells and circulation
  const stair1 = findRegion(0, "R", [117, 29], 40);
  if (stair1) rooms.push({ id: "STAIR1", name: "Stair 1", cells: stair1.cells });
  const stair2 = findRegion(0, "R", [10, 37], 15);
  if (stair2) rooms.push({ id: "STAIR2", name: "Stair 2", cells: stair2.cells });
  const stair4 = findRegion(0, "R", [103, 29], 40);
  if (stair4) rooms.push({ id: "STAIR4", name: "Stair 4", cells: stair4.cells });

  roomMap.floors.push({ label: "Level 01", rooms });
}

// ============ LEVEL 02 ============
{
  const rooms = [];

  // 2070/2076 - Large Lab areas
  const r2070 = findRegion(1, "L", [34, 64], 1000);
  if (r2070) rooms.push({ id: "2070", name: "Large Lab", cells: r2070.cells });

  const r2076 = findRegion(1, "L", [34, 145], 500);
  if (r2076) rooms.push({ id: "2076", name: "Class Lab", cells: r2076.cells });

  // 2015/2017 - Medium Classrooms
  const r2015 = findRegion(1, "C", [107, 64], 500);
  if (r2015) rooms.push({ id: "2015", name: "Large Classroom", cells: r2015.cells });

  // 2080-2110 - Admin area (large A region)
  const r2080 = findRegion(1, "A", [102, 151], 1000);
  if (r2080) rooms.push({ id: "2080", name: "Administration", cells: r2080.cells });

  // 2014 - Open to below / Lobby
  const r2014 = findRegion(1, "G", [11, 74], 200);
  if (r2014) rooms.push({ id: "2014", name: "Lobby", cells: r2014.cells });

  // 2034 - Instructional Support area
  const r2034 = findRegion(1, "G", [107, 104], 200);
  if (r2034) rooms.push({ id: "2034", name: "Instructional Support", cells: r2034.cells });

  // 2022 - Clean Room area
  const r2022 = findRegion(1, "G", [13, 147], 30);
  if (r2022) rooms.push({ id: "2022", name: "Clean Room Support", cells: r2022.cells });

  // Research offices along the top
  const offices2 = findRegionsInArea(1, "G", { minR: 0, maxR: 25, minC: 95, maxC: 180 }, 5, 100);
  const officeNums2 = ["2038", "2040", "2042", "2044", "2046", "2048", "2050", "2052", "2054", "2056", "2058", "2060", "2062", "2064", "2066", "2068"];
  offices2.sort((a, b) => a.centroid[1] - b.centroid[1]);
  for (let i = 0; i < Math.min(offices2.length, officeNums2.length); i++) {
    rooms.push({ id: officeNums2[i], name: "Research Office", cells: offices2[i].cells });
  }

  // Corridor
  const c2000 = findRegion(1, "G", [121, 41], 100);
  if (c2000) rooms.push({ id: "C2000", name: "Corridor", cells: c2000.cells });

  roomMap.floors.push({ label: "Level 02", rooms });
}

// ============ LEVEL 03 ============
{
  const rooms = [];

  // 3017 - 120 Seat Lab (largest L region) - THIS IS A SCHEDULED ROOM
  const r3017 = findRegion(2, "L", [125, 144], 1000);
  if (r3017) rooms.push({ id: "3017", name: "120 Seat Lab", cells: r3017.cells });

  // 3013 - Medium Classroom
  const r3013 = findRegion(2, "C", [30, 40], 200);
  if (r3013) rooms.push({ id: "3013", name: "Medium Classroom", cells: r3013.cells });

  // 3015 - Medium Classroom
  const r3015 = findRegion(2, "C", [30, 61], 200);
  if (r3015) rooms.push({ id: "3015", name: "Medium Classroom", cells: r3015.cells });

  // 3008 - Large Classroom
  const r3008 = findRegion(2, "C", [31, 80], 200);
  if (r3008) rooms.push({ id: "3008", name: "Large Classroom", cells: r3008.cells });

  // 3070-3077 - Instructional Labs (large C region)
  const r3070 = findRegion(2, "C", [35, 149], 800);
  if (r3070) rooms.push({ id: "3070", name: "Instructional Labs", cells: r3070.cells });

  // 3001 - Faculty Lounge / Admin area
  const r3001 = findRegion(2, "A", [9, 162], 200);
  if (r3001) rooms.push({ id: "3001", name: "Faculty Lounge", cells: r3001.cells });

  // 3005 - Group Study Room
  const r3005 = findRegion(2, "G", [33, 126], 100);
  if (r3005) rooms.push({ id: "3005", name: "Group Study Room / Grad Lounge", cells: r3005.cells });

  // 3014 - Computer Lab
  const r3014 = findRegion(2, "L", [101, 169], 50);
  if (r3014) rooms.push({ id: "3014", name: "Computer Lab", cells: r3014.cells });

  // Research office areas along the top
  const offices3top = findRegionsInArea(2, "G", { minR: 0, maxR: 20, minC: 90, maxC: 180 }, 5, 80);
  const officeNums3top = ["3040", "3042", "3044", "3046", "3048", "3050", "3052", "3054", "3056", "3058", "3060", "3062", "3064", "3066"];
  offices3top.sort((a, b) => a.centroid[1] - b.centroid[1]);
  for (let i = 0; i < Math.min(offices3top.length, officeNums3top.length); i++) {
    rooms.push({ id: officeNums3top[i], name: "Research Office", cells: offices3top[i].cells });
  }

  // Instructional Lab area bottom
  const r3072 = findRegion(2, "G", [102, 141], 200);
  if (r3072) rooms.push({ id: "3072", name: "Instructional Support", cells: r3072.cells });

  // Corridor
  const c3000 = findRegion(2, "G", [22, 124], 500);
  if (c3000) rooms.push({ id: "C3000", name: "Corridor", cells: c3000.cells });

  const c3080 = findRegion(2, "G", [28, 90], 300);
  if (c3080) rooms.push({ id: "C3080", name: "Corridor", cells: c3080.cells });

  // Circulation
  const stair1_3 = findRegion(2, "R", [43, 122], 20);
  if (stair1_3) rooms.push({ id: "STAIR2", name: "Stair 2", cells: stair1_3.cells });
  const stair4_3 = findRegion(2, "R", [100, 109], 30);
  if (stair4_3) rooms.push({ id: "STAIR4", name: "Stair 4", cells: stair4_3.cells });
  const elev = findRegion(2, "R", [100, 116], 20);
  if (elev) rooms.push({ id: "ELEV1", name: "Elevator 1", cells: elev.cells });

  roomMap.floors.push({ label: "Level 03", rooms });
}

// ============ LEVEL 04 ============
{
  const rooms = [];

  // 4070 - Instructional Lab area (large L)
  const r4070 = findRegion(3, "L", [125, 22], 500);
  if (r4070) rooms.push({ id: "4070", name: "Instructional Labs", cells: r4070.cells });

  // 4020 - Power Lab area (A region)
  const r4020 = findRegion(3, "A", [125, 50], 200);
  if (r4020) rooms.push({ id: "4020", name: "Power Electronics Lab", cells: r4020.cells });

  // 4080/4082/4084 - Instructional Lab (L region)
  const r4080 = findRegion(3, "L", [152, 119], 50);
  if (r4080) rooms.push({ id: "4080", name: "Instructional Lab", cells: r4080.cells });

  // Research offices
  const offices4 = findRegionsInArea(3, "G", { minR: 0, maxR: 60, minC: 90, maxC: 130 }, 10, 500);
  if (offices4.length > 0) {
    const officeNums4 = ["4038", "4040", "4042", "4044", "4046", "4048", "4050", "4052", "4054", "4056", "4058", "4060", "4062", "4064", "4066", "4068"];
    offices4.sort((a, b) => a.centroid[1] - b.centroid[1] || a.centroid[0] - b.centroid[0]);
    for (let i = 0; i < Math.min(offices4.length, officeNums4.length); i++) {
      rooms.push({ id: officeNums4[i], name: "Research Office", cells: offices4[i].cells });
    }
  }

  // Classroom
  const r4c = findRegion(3, "C", [152, 48], 30);
  if (r4c) rooms.push({ id: "4026", name: "Classroom", cells: r4c.cells });

  // Circulation
  const circ4 = findRegion(3, "R", [101, 43], 50);
  if (circ4) rooms.push({ id: "STAIR4", name: "Stair 4", cells: circ4.cells });
  const circ4b = findRegion(3, "R", [39, 117], 30);
  if (circ4b) rooms.push({ id: "STAIR2", name: "Stair 2", cells: circ4b.cells });

  roomMap.floors.push({ label: "Level 04", rooms });
}

// ============ LEVEL 05 ============
{
  const rooms = [];

  // 5020 - Large Optics Lab (large L, center)
  const r5020 = findRegion(4, "L", [59, 48], 500);
  if (r5020) rooms.push({ id: "5020", name: "Large Optics Lab", cells: r5020.cells });

  // 5070 - Electronics Lab (L region, right)
  const r5070 = findRegion(4, "L", [57, 137], 300);
  if (r5070) rooms.push({ id: "5070", name: "Electronics Lab", cells: r5070.cells });

  // 5072-5076 - Instructional Labs (L region, far left)
  const r5072 = findRegion(4, "L", [57, 12], 300);
  if (r5072) rooms.push({ id: "5072", name: "Instructional Labs", cells: r5072.cells });

  // 5078 - Conference (C region)
  const r5078 = findRegion(4, "C", [83, 57], 200);
  if (r5078) rooms.push({ id: "5078", name: "Conference / Classroom", cells: r5078.cells });

  // 5086/5088 - Library / Work Room (A region)
  const r5086 = findRegion(4, "A", [103, 79], 40);
  if (r5086) rooms.push({ id: "5086", name: "Library / Work Room", cells: r5086.cells });

  // Research offices along the top
  const offices5 = findRegionsInArea(4, "G", { minR: 0, maxR: 20, minC: 0, maxC: 100 }, 10, 50);
  const officeNums5 = ["5040", "5042", "5044", "5046", "5048", "5050", "5052", "5054", "5056", "5058", "5060", "5062", "5064", "5066", "5068"];
  offices5.sort((a, b) => a.centroid[1] - b.centroid[1]);
  for (let i = 0; i < Math.min(offices5.length, officeNums5.length); i++) {
    rooms.push({ id: officeNums5[i], name: "Research Office", cells: offices5[i].cells });
  }

  // Corridors
  const c5000 = findRegion(4, "G", [103, 53], 100);
  if (c5000) rooms.push({ id: "C5000", name: "Corridor", cells: c5000.cells });

  // More areas
  const r5030 = findRegion(4, "G", [36, 61], 40);
  if (r5030) rooms.push({ id: "5030", name: "Work Room", cells: r5030.cells });

  const r5034 = findRegion(4, "G", [41, 26], 20);
  if (r5034) rooms.push({ id: "5034", name: "Conference", cells: r5034.cells });

  // Circulation
  const circ5a = findRegion(4, "R", [35, 141], 40);
  if (circ5a) rooms.push({ id: "STAIR3", name: "Stair 3", cells: circ5a.cells });
  const circ5b = findRegion(4, "R", [32, 69], 20);
  if (circ5b) rooms.push({ id: "STAIR2", name: "Stair 2", cells: circ5b.cells });
  const circ5c = findRegion(4, "R", [32, 134], 20);
  if (circ5c) rooms.push({ id: "ELEV2", name: "Elevator 2", cells: circ5c.cells });

  roomMap.floors.push({ label: "Level 05", rooms });
}

// Write result
writeFileSync("public/room-map.json", JSON.stringify(roomMap, null, 2));

// Summary
for (const floor of roomMap.floors) {
  console.log(`${floor.label}: ${floor.rooms.length} rooms mapped`);
  for (const room of floor.rooms) {
    console.log(`  ${room.id} - ${room.name} (${room.cells.length} cells)`);
  }
}

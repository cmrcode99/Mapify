#!/usr/bin/env node
/**
 * Generate a schematic Siebel Center floor grid for the 3D viewer.
 * Output: public/floors-sc.json (Basement through Fourth Floor).
 */
import { writeFileSync } from "fs";

const GRID_H = 120;
const GRID_W = 150;

function createGrid() {
  return Array.from({ length: GRID_H }, () => Array(GRID_W).fill(null));
}

function inBounds(r, c) {
  return r >= 0 && r < GRID_H && c >= 0 && c < GRID_W;
}

function setCell(grid, r, c, value) {
  if (!inBounds(r, c)) return;
  grid[r][c] = value;
}

function fillRect(grid, r0, r1, c0, c1, value) {
  for (let r = r0; r < r1; r++) {
    for (let c = c0; c < c1; c++) {
      setCell(grid, r, c, value);
    }
  }
}

function strokeRect(grid, r0, r1, c0, c1, value) {
  for (let c = c0; c < c1; c++) {
    setCell(grid, r0, c, value);
    setCell(grid, r1 - 1, c, value);
  }
  for (let r = r0; r < r1; r++) {
    setCell(grid, r, c0, value);
    setCell(grid, r, c1 - 1, value);
  }
}

function addRoom(grid, { r0, r1, c0, c1, type, wall = "B" }) {
  strokeRect(grid, r0, r1, c0, c1, wall);
  fillRect(grid, r0 + 1, r1 - 1, c0 + 1, c1 - 1, type);
}

function carveDoor(grid, r, c) {
  if (!inBounds(r, c)) return;
  grid[r][c] = "G";
}

function drawFootprint(grid) {
  // L-shaped shell: west wing + south wing.
  fillRect(grid, 16, 110, 16, 64, "G");
  fillRect(grid, 62, 110, 16, 138, "G");

  // Exterior wall shell.
  strokeRect(grid, 16, 110, 16, 64, "W");
  strokeRect(grid, 62, 110, 16, 138, "W");

  // Interior circulation spines.
  fillRect(grid, 64, 72, 20, 132, "G");
  fillRect(grid, 20, 104, 36, 46, "G");
  fillRect(grid, 52, 72, 46, 64, "G");
}

function addCirculationCore(grid) {
  addRoom(grid, { r0: 22, r1: 30, c0: 24, c1: 32, type: "R" });
  addRoom(grid, { r0: 92, r1: 102, c0: 24, c1: 32, type: "R" });
  addRoom(grid, { r0: 66, r1: 76, c0: 52, c1: 60, type: "R" });
  carveDoor(grid, 25, 32);
  carveDoor(grid, 96, 32);
  carveDoor(grid, 71, 52);
}

function withStandardOffices(grid, rows, colStart, colEnd, prefixType = "O") {
  for (let i = 0; i < rows.length; i++) {
    const [r0, r1] = rows[i];
    addRoom(grid, { r0, r1, c0: colStart, c1: colEnd, type: prefixType });
    carveDoor(grid, Math.floor((r0 + r1) / 2), colEnd - 1);
  }
}

function buildBasement() {
  const grid = createGrid();
  drawFootprint(grid);
  addCirculationCore(grid);

  // Auditorium cluster.
  addRoom(grid, { r0: 74, r1: 108, c0: 90, c1: 134, type: "C" }); // 405
  addRoom(grid, { r0: 74, r1: 92, c0: 68, c1: 88, type: "C" }); // 401
  addRoom(grid, { r0: 92, r1: 108, c0: 68, c1: 88, type: "C" }); // 407
  addRoom(grid, { r0: 92, r1: 108, c0: 50, c1: 66, type: "C" }); // 409

  // Labs 224-232.
  addRoom(grid, { r0: 30, r1: 44, c0: 18, c1: 34, type: "L" });
  addRoom(grid, { r0: 44, r1: 58, c0: 18, c1: 34, type: "L" });
  addRoom(grid, { r0: 30, r1: 44, c0: 46, c1: 62, type: "L" });
  addRoom(grid, { r0: 44, r1: 58, c0: 46, c1: 62, type: "L" });
  addRoom(grid, { r0: 58, r1: 72, c0: 46, c1: 62, type: "L" });

  // Server/mechanical pockets.
  addRoom(grid, { r0: 74, r1: 84, c0: 20, c1: 34, type: "A" }); // 105
  addRoom(grid, { r0: 84, r1: 94, c0: 20, c1: 34, type: "A" }); // 105B-D
  addRoom(grid, { r0: 74, r1: 94, c0: 34, c1: 46, type: "A" }); // 109

  return { label: "Basement", gridW: GRID_W, gridH: GRID_H, grid };
}

function buildFirstFloor() {
  const grid = createGrid();
  drawFootprint(grid);
  addCirculationCore(grid);

  // Major classrooms.
  addRoom(grid, { r0: 76, r1: 108, c0: 94, c1: 134, type: "C" }); // 1404
  addRoom(grid, { r0: 76, r1: 98, c0: 70, c1: 92, type: "C" }); // 1302
  addRoom(grid, { r0: 84, r1: 106, c0: 20, c1: 44, type: "C" }); // 1109

  // ACM/student and lobby-adjacent spaces.
  addRoom(grid, { r0: 56, r1: 74, c0: 74, c1: 92, type: "S" });
  addRoom(grid, { r0: 56, r1: 74, c0: 60, c1: 74, type: "A" });

  // Office bands in west wing.
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
    ],
    18,
    34,
    "O"
  );
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
    ],
    46,
    62,
    "O"
  );

  // Open lobby zone.
  fillRect(grid, 62, 76, 58, 86, "G");

  return { label: "First Floor", gridW: GRID_W, gridH: GRID_H, grid };
}

function buildSecondFloor() {
  const grid = createGrid();
  drawFootprint(grid);
  addCirculationCore(grid);

  // Scheduled room.
  addRoom(grid, { r0: 74, r1: 98, c0: 100, c1: 126, type: "C" }); // 2405

  // Conference pockets.
  addRoom(grid, { r0: 74, r1: 88, c0: 78, c1: 98, type: "C" });
  addRoom(grid, { r0: 88, r1: 102, c0: 78, c1: 98, type: "C" });

  // 2100 wing offices.
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [64, 74],
    ],
    18,
    34,
    "O"
  );
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [64, 74],
    ],
    46,
    62,
    "O"
  );

  // 2400 wing offices.
  withStandardOffices(
    grid,
    [
      [74, 84],
      [84, 94],
      [94, 104],
    ],
    126,
    138,
    "O"
  );

  addRoom(grid, { r0: 52, r1: 66, c0: 60, c1: 74, type: "A" });

  return { label: "Second Floor", gridW: GRID_W, gridH: GRID_H, grid };
}

function buildThirdFloor() {
  const grid = createGrid();
  drawFootprint(grid);
  addCirculationCore(grid);

  // Atrium open-to-below.
  fillRect(grid, 62, 86, 56, 82, null);
  strokeRect(grid, 62, 86, 56, 82, "B");

  // 3100 offices (west wing).
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [86, 96],
      [96, 106],
    ],
    18,
    34,
    "O"
  );
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [86, 96],
      [96, 106],
    ],
    46,
    62,
    "O"
  );

  // 3400 offices and conference.
  withStandardOffices(
    grid,
    [
      [74, 84],
      [84, 94],
      [94, 104],
    ],
    126,
    138,
    "O"
  );
  addRoom(grid, { r0: 74, r1: 92, c0: 98, c1: 124, type: "C" });

  return { label: "Third Floor", gridW: GRID_W, gridH: GRID_H, grid };
}

function buildFourthFloor() {
  const grid = createGrid();
  drawFootprint(grid);
  addCirculationCore(grid);

  // 4100/4400 office-heavy floors.
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [64, 74],
      [86, 96],
      [96, 106],
    ],
    18,
    34,
    "O"
  );
  withStandardOffices(
    grid,
    [
      [24, 34],
      [34, 44],
      [44, 54],
      [54, 64],
      [64, 74],
      [86, 96],
      [96, 106],
    ],
    46,
    62,
    "O"
  );
  withStandardOffices(
    grid,
    [
      [74, 84],
      [84, 94],
      [94, 104],
    ],
    126,
    138,
    "O"
  );

  addRoom(grid, { r0: 74, r1: 90, c0: 98, c1: 124, type: "C" });
  addRoom(grid, { r0: 90, r1: 106, c0: 98, c1: 124, type: "C" });

  return { label: "Fourth Floor", gridW: GRID_W, gridH: GRID_H, grid };
}

const floors = [
  buildBasement(),
  buildFirstFloor(),
  buildSecondFloor(),
  buildThirdFloor(),
  buildFourthFloor(),
];

const data = {
  floors,
  config: {
    voxelH: 2.5,
    floorGap: 16,
    roomTypes: {
      A: { name: "Admin", color: "#002060" },
      C: { name: "Classroom", color: "#4472C4" },
      R: { name: "Circulation", color: "#00B0F0" },
      L: { name: "Lab", color: "#E48F24" },
      O: { name: "Office", color: "#70AD47" },
      S: { name: "Student", color: "#FF66CC" },
      G: { name: "General", color: "#B0B8C0" },
      W: { name: "Wall" },
      B: { name: "Outline" },
    },
  },
};

writeFileSync("public/floors-sc.json", `${JSON.stringify(data)}\n`);

console.log("Wrote public/floors-sc.json");
for (const floor of floors) {
  console.log(`${floor.label}: ${floor.gridH} x ${floor.gridW}`);
}

#!/usr/bin/env node
/**
 * Flood-fill room region identification for ECEB floors.json
 * Outputs region centroids, bounding boxes, cell counts, and type codes.
 */
import { readFileSync, writeFileSync } from "fs";

const data = JSON.parse(readFileSync("public/floors.json", "utf8"));
const BOUNDARY = new Set(["W", "B", null]);

function floodFill(grid, visited, startR, startC) {
  const type = grid[startR][startC];
  const cells = [];
  const stack = [[startR, startC]];
  visited[startR][startC] = true;

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    cells.push([r, c]);
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) continue;
      if (visited[nr][nc]) continue;
      if (grid[nr][nc] !== type) continue;
      visited[nr][nc] = true;
      stack.push([nr, nc]);
    }
  }
  return { type, cells };
}

const results = [];

for (let fi = 0; fi < data.floors.length; fi++) {
  const floor = data.floors[fi];
  const grid = floor.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

  const regions = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c]) continue;
      const cell = grid[r][c];
      if (BOUNDARY.has(cell)) {
        visited[r][c] = true;
        continue;
      }
      const region = floodFill(grid, visited, r, c);
      const minR = Math.min(...region.cells.map(([r]) => r));
      const maxR = Math.max(...region.cells.map(([r]) => r));
      const minC = Math.min(...region.cells.map(([, c]) => c));
      const maxC = Math.max(...region.cells.map(([, c]) => c));
      const centroidR = region.cells.reduce((s, [r]) => s + r, 0) / region.cells.length;
      const centroidC = region.cells.reduce((s, [, c]) => s + c, 0) / region.cells.length;

      regions.push({
        type: region.type,
        cellCount: region.cells.length,
        centroid: [Math.round(centroidR * 10) / 10, Math.round(centroidC * 10) / 10],
        bbox: { minR, maxR, minC, maxC },
        cells: region.cells,
      });
    }
  }

  // Sort top-to-bottom, left-to-right by centroid
  regions.sort((a, b) => a.centroid[0] - b.centroid[0] || a.centroid[1] - b.centroid[1]);

  results.push({
    floor: fi,
    label: floor.label,
    gridSize: [rows, cols],
    regionCount: regions.length,
    regions,
  });

  console.log(`${floor.label}: ${regions.length} regions`);
  for (const reg of regions) {
    console.log(`  ${reg.type} cells=${reg.cellCount} centroid=[${reg.centroid}] bbox=[${reg.bbox.minR}-${reg.bbox.maxR}, ${reg.bbox.minC}-${reg.bbox.maxC}]`);
  }
}

writeFileSync("scripts/room-regions.json", JSON.stringify(results, null, 2));
console.log("\nWritten to scripts/room-regions.json");

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface FloorData {
  label: string;
  gridW: number;
  gridH: number;
  grid: (string | null)[][];
}

export interface Config {
  voxelH: number;
  floorGap: number;
  roomTypes: Record<string, { name: string; color?: string }>;
}

export interface RoomInfo {
  id: string;
  name: string;
  centroid: [number, number];
  cellCount: number;
}

interface Props {
  floors: FloorData[];
  config: Config;
  visibleFloors: boolean[];
  roomAvailability?: Record<string, "available" | "in-use">;
  roomGrids?: (string | null)[][][];
  roomMap?: { floors: { label: string; rooms: RoomInfo[] }[] };
  onRoomClick?: (roomId: string, floorIndex: number) => void;
}

// Room type codes that have colored tiles (not walls/outline)
const ROOM_CODES = ["A", "C", "R", "L", "O", "S", "G"];

const COLOR_AVAILABLE = new THREE.Color(0x22c55e);
const COLOR_IN_USE = new THREE.Color(0xef4444);

export default function BuildingViewer({
  floors,
  config,
  visibleFloors,
  roomAvailability,
  roomGrids,
  roomMap,
  onRoomClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshGroupsRef = useRef<{ meshes: THREE.Object3D[] }[]>([]);
  const onRoomClickRef = useRef(onRoomClick);
  onRoomClickRef.current = onRoomClick;

  // Toggle floor visibility
  useEffect(() => {
    const groups = meshGroupsRef.current;
    for (let i = 0; i < groups.length; i++) {
      const visible = visibleFloors[i] ?? true;
      for (const m of groups[i].meshes) {
        m.visible = visible;
      }
    }
  }, [visibleFloors]);

  // Build scene on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { voxelH, floorGap, roomTypes } = config;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 800, 2000);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
    sun.position.set(200, 400, 150);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xb0c8ff, 0.4);
    fill.position.set(-200, 100, -150);
    scene.add(fill);
    const back = new THREE.DirectionalLight(0xffffff, 0.3);
    back.position.set(0, 200, -300);
    scene.add(back);

    // Max grid dimensions
    let maxGW = 0,
      maxGH = 0;
    for (const f of floors) {
      if (f.gridW > maxGW) maxGW = f.gridW;
      if (f.gridH > maxGH) maxGH = f.gridH;
    }

    // Geometries
    const wallGeo = new THREE.BoxGeometry(1, voxelH, 1);
    const outlineGeo = new THREE.BoxGeometry(1, voxelH, 1);
    const floorGeo = new THREE.BoxGeometry(1, 0.5, 1);
    const dummy = new THREE.Object3D();

    // Materials
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0xc0d0e0,
      transparent: true,
      opacity: 0.45,
      roughness: 0.6,
      metalness: 0.1,
    });
    const outlineMat = new THREE.MeshPhysicalMaterial({
      color: 0xd0d8e8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.4,
      metalness: 0.15,
    });

    const roomMats: Record<string, THREE.MeshPhysicalMaterial> = {};
    for (const key of ROOM_CODES) {
      const rt = roomTypes[key];
      if (!rt?.color) continue;
      roomMats[key] = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(rt.color),
        transparent: true,
        opacity: 0.65,
        roughness: 0.5,
        metalness: 0.0,
      });
    }

    // Availability materials
    const availableMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_AVAILABLE,
      transparent: true,
      opacity: 0.7,
      roughness: 0.4,
      metalness: 0.0,
    });
    const inUseMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_IN_USE,
      transparent: true,
      opacity: 0.7,
      roughness: 0.4,
      metalness: 0.0,
    });

    // Categorize cells: for each floor, split into wall/outline/available/inuse/regular-type
    const meshGroups: { meshes: THREE.Object3D[] }[] = [];

    // Track instanced mesh → room ID mapping for click detection
    type RoomMeshMap = { mesh: THREE.InstancedMesh; roomIds: (string | null)[]; floorIndex: number };
    const roomMeshMaps: RoomMeshMap[] = [];

    for (let fi = 0; fi < floors.length; fi++) {
      const { grid, gridW, gridH } = floors[fi];
      const roomGrid = roomGrids?.[fi];
      const floorMeshes: THREE.Object3D[] = [];

      // Collect cells by category (with room ID for clickable cells)
      const wallCells: [number, number][] = [];
      const outlineCells: [number, number][] = [];
      const availCells: { pos: [number, number]; roomId: string | null }[] = [];
      const inUseCells: { pos: [number, number]; roomId: string | null }[] = [];
      const typeCells: Record<string, [number, number][]> = {};
      for (const key of ROOM_CODES) typeCells[key] = [];

      for (let gy = 0; gy < grid.length; gy++) {
        for (let gx = 0; gx < grid[gy].length; gx++) {
          const t = grid[gy][gx];
          if (!t) continue;

          if (t === "W") {
            wallCells.push([gy, gx]);
          } else if (t === "B") {
            outlineCells.push([gy, gx]);
          } else if (roomGrid && roomAvailability) {
            const roomId = roomGrid[gy]?.[gx];
            if (roomId && roomAvailability[roomId]) {
              if (roomAvailability[roomId] === "in-use") {
                inUseCells.push({ pos: [gy, gx], roomId });
              } else {
                availCells.push({ pos: [gy, gx], roomId });
              }
            } else if (roomId) {
              // Room mapped but no availability data — default to available
              availCells.push({ pos: [gy, gx], roomId });
            } else {
              typeCells[t]?.push([gy, gx]);
            }
          } else {
            typeCells[t]?.push([gy, gx]);
          }
        }
      }

      const offsetX = (maxGW - gridW) / 2;
      const offsetZ = (maxGH - gridH) / 2;
      const yBaseWall = fi * floorGap + voxelH / 2;
      const yBaseFloor = fi * floorGap + 0.2;

      const placeCell = (gy: number, gx: number, isWall: boolean) => {
        const posX = gridW - gx - 1 + offsetX + 0.5;
        const posZ = maxGH - (gy + offsetZ) - 0.5;
        dummy.position.set(posX, isWall ? yBaseWall : yBaseFloor, posZ);
        dummy.updateMatrix();
      };

      // Walls
      if (wallCells.length > 0) {
        const mesh = new THREE.InstancedMesh(wallGeo, wallMat, wallCells.length);
        wallCells.forEach(([gy, gx], idx) => {
          placeCell(gy, gx, true);
          mesh.setMatrixAt(idx, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        floorMeshes.push(mesh);
      }

      // Outlines
      if (outlineCells.length > 0) {
        const mesh = new THREE.InstancedMesh(outlineGeo, outlineMat, outlineCells.length);
        outlineCells.forEach(([gy, gx], idx) => {
          placeCell(gy, gx, true);
          mesh.setMatrixAt(idx, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        floorMeshes.push(mesh);
      }

      // Available rooms (green)
      if (availCells.length > 0) {
        const mesh = new THREE.InstancedMesh(floorGeo, availableMat, availCells.length);
        const roomIds: (string | null)[] = [];
        availCells.forEach(({ pos: [gy, gx], roomId }, idx) => {
          placeCell(gy, gx, false);
          mesh.setMatrixAt(idx, dummy.matrix);
          roomIds.push(roomId);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        floorMeshes.push(mesh);
        roomMeshMaps.push({ mesh, roomIds, floorIndex: fi });
      }

      // In-use rooms (red)
      if (inUseCells.length > 0) {
        const mesh = new THREE.InstancedMesh(floorGeo, inUseMat, inUseCells.length);
        const roomIds: (string | null)[] = [];
        inUseCells.forEach(({ pos: [gy, gx], roomId }, idx) => {
          placeCell(gy, gx, false);
          mesh.setMatrixAt(idx, dummy.matrix);
          roomIds.push(roomId);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        floorMeshes.push(mesh);
        roomMeshMaps.push({ mesh, roomIds, floorIndex: fi });
      }

      // Regular type cells (not assigned to a room with availability)
      for (const key of ROOM_CODES) {
        const cells = typeCells[key];
        if (cells.length === 0 || !roomMats[key]) continue;
        const mesh = new THREE.InstancedMesh(floorGeo, roomMats[key], cells.length);
        cells.forEach(([gy, gx], idx) => {
          placeCell(gy, gx, false);
          mesh.setMatrixAt(idx, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        floorMeshes.push(mesh);
      }

      // Floor slab
      const slabGeo = new THREE.BoxGeometry(gridW, 0.12, gridH);
      const slabMat = new THREE.MeshPhysicalMaterial({
        color: 0x8899aa,
        transparent: true,
        opacity: 0.12,
        roughness: 0.8,
        metalness: 0.0,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(
        gridW / 2 + offsetX,
        fi * floorGap,
        gridH / 2 + offsetZ
      );
      scene.add(slab);
      floorMeshes.push(slab);

      meshGroups.push({ meshes: floorMeshes });
    }

    // Floor label sprites
    for (let fi = 0; fi < floors.length; fi++) {
      const sprite = makeTextSprite(floors[fi].label);
      sprite.position.set(-18, fi * floorGap + voxelH / 2, maxGH / 2);
      sprite.scale.set(30, 10, 1);
      scene.add(sprite);
      meshGroups[fi].meshes.push(sprite);
    }

    // Room number labels
    if (roomMap) {
      for (let fi = 0; fi < roomMap.floors.length; fi++) {
        const { gridW, gridH } = floors[fi];
        const offsetX = (maxGW - gridW) / 2;
        const offsetZ = (maxGH - gridH) / 2;

        for (const room of roomMap.floors[fi].rooms) {
          // Skip corridors and circulation
          if (room.id.startsWith("C") || room.id.startsWith("STAIR") || room.id.startsWith("ELEV")) continue;

          const [centR, centC] = room.centroid;

          const posX = gridW - centC - 1 + offsetX + 0.5;
          const posZ = maxGH - (centR + offsetZ) - 0.5;
          const posY = fi * floorGap + voxelH + 0.5;

          const sprite = makeRoomLabel(room.id);
          sprite.position.set(posX, posY, posZ);

          // Scale based on room size
          const scale = room.cellCount > 200 ? 14 : room.cellCount > 50 ? 10 : 7;
          sprite.scale.set(scale, scale * 0.4, 1);
          scene.add(sprite);
          meshGroups[fi].meshes.push(sprite);
        }
      }
    }

    meshGroupsRef.current = meshGroups;

    // Camera
    const cx = maxGW / 2,
      cy = ((floors.length - 1) * floorGap) / 2,
      cz = maxGH / 2;
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      1,
      3000
    );
    camera.position.set(cx + 220, cy + 160, cz + 250);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(cx, cy, cz);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 30;
    controls.maxDistance = 1200;
    controls.update();

    // Resize
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Raycaster click handling for room selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      // Ignore if the user was dragging (orbit)
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 25) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Test against all room meshes
      for (const { mesh, roomIds, floorIndex } of roomMeshMaps) {
        if (!mesh.visible) continue;
        const hits = raycaster.intersectObject(mesh);
        if (hits.length > 0 && hits[0].instanceId != null) {
          const roomId = roomIds[hits[0].instanceId];
          if (roomId && onRoomClickRef.current) {
            onRoomClickRef.current(roomId, floorIndex);
            return;
          }
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("click", onClick);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors, config, roomAvailability, roomGrids, roomMap]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

function makeTextSprite(text: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0008";
  ctx.beginPath();
  ctx.roundRect(0, 0, 256, 64, 10);
  ctx.fill();
  ctx.fillStyle = "#aaccff";
  ctx.font = "bold 28px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  return new THREE.Sprite(mat);
}

function makeRoomLabel(roomId: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 48;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.roundRect(4, 4, 120, 40, 6);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(roomId, 64, 24);

  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
  });
  return new THREE.Sprite(mat);
}

#!/usr/bin/env node
process.argv[2] = "public/floors-sc.json";
process.argv[3] = "scripts/room-regions-sc.json";
await import("./identify-rooms.mjs");

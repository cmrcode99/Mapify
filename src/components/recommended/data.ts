export type RecommendedRoom = {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  currentOccupancy: number;
  maxCapacity: number;
  amenities: string[];
};

export type RecommendedBuilding = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  currentOccupancy: number;
  maxCapacity: number;
  energyActive: boolean;
  rooms: RecommendedRoom[];
};

export const RECOMMENDED_BUILDINGS: RecommendedBuilding[] = [
  {
    id: "grainger",
    name: "Grainger Library",
    address: "1301 W Springfield Ave, Urbana, IL",
    lat: 40.11317,
    lng: -88.22849,
    currentOccupancy: 45,
    maxCapacity: 100,
    energyActive: true,
    rooms: [
      {
        id: "grainger-214",
        buildingId: "grainger",
        name: "Room 214",
        floor: 2,
        currentOccupancy: 12,
        maxCapacity: 40,
        amenities: ["outlets", "quiet", "whiteboard"],
      },
      {
        id: "grainger-220",
        buildingId: "grainger",
        name: "Room 220",
        floor: 2,
        currentOccupancy: 28,
        maxCapacity: 40,
        amenities: ["outlets", "whiteboard"],
      },
      {
        id: "grainger-308",
        buildingId: "grainger",
        name: "Room 308",
        floor: 3,
        currentOccupancy: 5,
        maxCapacity: 40,
        amenities: ["quiet", "outlets"],
      },
    ],
  },
  {
    id: "ugl",
    name: "Undergraduate Library",
    address: "1402 W Gregory Dr, Urbana, IL",
    lat: 40.10487,
    lng: -88.22909,
    currentOccupancy: 50,
    maxCapacity: 100,
    energyActive: true,
    rooms: [
      {
        id: "ugl-100",
        buildingId: "ugl",
        name: "UGL 100",
        floor: 1,
        currentOccupancy: 35,
        maxCapacity: 60,
        amenities: ["outlets", "group study"],
      },
      {
        id: "ugl-200",
        buildingId: "ugl",
        name: "UGL 200",
        floor: 2,
        currentOccupancy: 15,
        maxCapacity: 60,
        amenities: ["quiet", "whiteboard"],
      },
    ],
  },
  {
    id: "siebel",
    name: "Siebel Center for CS",
    address: "201 N Goodwin Ave, Urbana, IL",
    lat: 40.11385,
    lng: -88.22454,
    currentOccupancy: 26,
    maxCapacity: 80,
    energyActive: true,
    rooms: [
      {
        id: "siebel-1404",
        buildingId: "siebel",
        name: "Room 1404",
        floor: 1,
        currentOccupancy: 8,
        maxCapacity: 40,
        amenities: ["outlets", "whiteboard", "projector"],
      },
      {
        id: "siebel-2124",
        buildingId: "siebel",
        name: "Room 2124",
        floor: 2,
        currentOccupancy: 3,
        maxCapacity: 40,
        amenities: ["outlets", "quiet"],
      },
      {
        id: "siebel-0216",
        buildingId: "siebel",
        name: "Room 0216",
        floor: 0,
        currentOccupancy: 15,
        maxCapacity: 40,
        amenities: ["whiteboard", "group study"],
      },
    ],
  },
  {
    id: "natural-history",
    name: "Natural History Building",
    address: "1301 W Green St, Urbana, IL",
    lat: 40.10836,
    lng: -88.22781,
    currentOccupancy: 2,
    maxCapacity: 40,
    energyActive: false,
    rooms: [
      {
        id: "nh-101",
        buildingId: "natural-history",
        name: "Room 101",
        floor: 1,
        currentOccupancy: 2,
        maxCapacity: 30,
        amenities: ["whiteboard"],
      },
      {
        id: "nh-210",
        buildingId: "natural-history",
        name: "Room 210",
        floor: 2,
        currentOccupancy: 0,
        maxCapacity: 30,
        amenities: ["quiet"],
      },
    ],
  },
  {
    id: "illini-union",
    name: "Illini Union",
    address: "1401 W Green St, Urbana, IL",
    lat: 40.10952,
    lng: -88.22783,
    currentOccupancy: 28,
    maxCapacity: 70,
    energyActive: true,
    rooms: [
      {
        id: "iu-study-a",
        buildingId: "illini-union",
        name: "Study Room A",
        floor: 2,
        currentOccupancy: 6,
        maxCapacity: 20,
        amenities: ["outlets", "whiteboard"],
      },
      {
        id: "iu-study-b",
        buildingId: "illini-union",
        name: "Study Room B",
        floor: 2,
        currentOccupancy: 14,
        maxCapacity: 20,
        amenities: ["outlets", "group study"],
      },
      {
        id: "iu-reading",
        buildingId: "illini-union",
        name: "Reading Room",
        floor: 3,
        currentOccupancy: 8,
        maxCapacity: 40,
        amenities: ["quiet"],
      },
    ],
  },
  {
    id: "transportation",
    name: "Transportation Building",
    address: "104 S Mathews Ave, Urbana, IL",
    lat: 40.10333,
    lng: -88.22812,
    currentOccupancy: 10,
    maxCapacity: 60,
    energyActive: false,
    rooms: [
      {
        id: "trans-116",
        buildingId: "transportation",
        name: "Room 116",
        floor: 1,
        currentOccupancy: 4,
        maxCapacity: 30,
        amenities: ["outlets"],
      },
      {
        id: "trans-220",
        buildingId: "transportation",
        name: "Room 220",
        floor: 2,
        currentOccupancy: 6,
        maxCapacity: 30,
        amenities: ["whiteboard", "outlets"],
      },
    ],
  },
  {
    id: "david-kinley",
    name: "David Kinley Hall",
    address: "1407 W Gregory Dr, Urbana, IL",
    lat: 40.10561,
    lng: -88.22834,
    currentOccupancy: 83,
    maxCapacity: 120,
    energyActive: true,
    rooms: [
      {
        id: "dk-107",
        buildingId: "david-kinley",
        name: "Room 107",
        floor: 1,
        currentOccupancy: 45,
        maxCapacity: 60,
        amenities: ["outlets", "whiteboard"],
      },
      {
        id: "dk-209",
        buildingId: "david-kinley",
        name: "Room 209",
        floor: 2,
        currentOccupancy: 38,
        maxCapacity: 60,
        amenities: ["outlets", "projector"],
      },
    ],
  },
  {
    id: "wohlers",
    name: "Wohlers Hall",
    address: "1206 W Nevada St, Urbana, IL",
    lat: 40.10240,
    lng: -88.22527,
    currentOccupancy: 7,
    maxCapacity: 80,
    energyActive: true,
    rooms: [
      {
        id: "wohlers-124",
        buildingId: "wohlers",
        name: "Room 124",
        floor: 1,
        currentOccupancy: 2,
        maxCapacity: 40,
        amenities: ["whiteboard"],
      },
      {
        id: "wohlers-238",
        buildingId: "wohlers",
        name: "Room 238",
        floor: 2,
        currentOccupancy: 5,
        maxCapacity: 40,
        amenities: ["quiet", "outlets"],
      },
    ],
  },
];

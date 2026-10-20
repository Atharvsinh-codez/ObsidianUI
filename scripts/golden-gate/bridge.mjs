// Truth model of the Golden Gate Bridge: real dimensions in metres and tonnes,
// the model scale that maps them onto the plinth, and the cable statics the
// readout reads. Everything that moves or reads a number imports this.

export const REAL = {
  mainSpan: 1280,        // m, tower to tower
  sideSpan: 343,         // m, tower to pylon
  towerHeight: 227,      // m above mean high water
  deckClearance: 67,     // m, roadway over water at midspan
  cableSag: 144,         // m, tower saddle to midspan low point
  cableDiameter: 0.924,  // m
  wiresPerCable: 27572,
  suspenderPairs: 250,   // 15.24 m apart (50 ft)
  deckWidth: 27.4,       // m, cable to cable
  lanes: 6,
  speedLimit: 45,        // mph
  deadLoadPerCable: 21.8,// t per metre of span carried by each cable
  towerCableLoad: 55800, // t, vertical load on each tower from both cables
  dailyVehicles: 112000,
  opened: 1937,
};

// Model scale: along the bridge and across the strait 0.36 units per metre,
// heights 0.55 units per metre. Vehicles, the deck width and the tower legs are
// drawn about four times over scale so the traffic reads, as on a model railway.
export const SCALE = { plan: 0.36, up: 0.55 };
export const m = (metres) => metres * SCALE.plan;
export const up = (metres) => metres * SCALE.up;

export const TOWER_X = m(REAL.mainSpan) / 2;             // ±230.4
export const PYLON_X = TOWER_X + m(REAL.sideSpan);       // ±353.9
export const TOWER_TOP = up(REAL.towerHeight);           // 124.9
export const DECK_Z = up(REAL.deckClearance) + 3;        // 39.9: road surface
export const CABLE_TOP = TOWER_TOP + 1.6;
export const CABLE_LOW = CABLE_TOP - up(REAL.cableSag);  // 47.3
export const CABLE_Y = 22;                                // half the truss width in the model
export const DECK_HALF = 19;                              // half the roadway + sidewalks
export const LANE_W = 5;
export const LANE_Y = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5]; // 0..2 southbound (+x), 3..5 northbound

// Main cable: a parabola through the saddles with its low point at midspan.
export const mainCableZ = (x) => CABLE_LOW + (CABLE_TOP - CABLE_LOW) * (x / TOWER_X) ** 2;
// Side spans: the same horizontal tension, so the slope at the saddle matches,
// and the cable eases down to the pylon just above deck level.
const SIDE_SLOPE = (2 * (CABLE_TOP - CABLE_LOW)) / TOWER_X;
export const PYLON_CABLE_Z = DECK_Z + 21;
export function sideCableZ(x) {
  const s = Math.abs(x) - TOWER_X;             // 0 at the tower, L at the pylon
  const L = PYLON_X - TOWER_X;
  const drop = CABLE_TOP - PYLON_CABLE_Z;
  const a = (SIDE_SLOPE * L - drop) / (L * L);  // curvature that lands it on the pylon
  return CABLE_TOP - SIDE_SLOPE * s + a * s * s;
}
export const cableZ = (x) => (Math.abs(x) <= TOWER_X ? mainCableZ(x) : sideCableZ(x));

// Statics. H is the horizontal tension in one cable, T the tension at the saddle.
export function cableStatics(liveTonnesOnMainSpan = 0) {
  const w = REAL.deadLoadPerCable + liveTonnesOnMainSpan / REAL.mainSpan / 2;
  const H = (w * REAL.mainSpan ** 2) / (8 * REAL.cableSag);
  const slope = (4 * REAL.cableSag) / REAL.mainSpan;
  const T = H * Math.sqrt(1 + slope * slope);
  return { w, H, T, stress: (T * 9.80665e3) / (REAL.wiresPerCable * Math.PI * 0.00249 ** 2) / 1e6 };
}

export const VEHICLES = {
  sedan: { mass: 1.6, length: 8.6, width: 3.8, label: "sedan" },
  suv: { mass: 2.4, length: 9.4, width: 4.0, label: "SUV" },
  pickup: { mass: 2.6, length: 10.4, width: 4.0, label: "pickup" },
  van: { mass: 3.2, length: 10.6, width: 4.1, label: "delivery van" },
  box: { mass: 11, length: 15.5, width: 4.6, label: "box truck" },
  semi: { mass: 36, length: 24, width: 4.7, label: "semi-trailer" },
  bus: { mass: 14, length: 20, width: 4.6, label: "Golden Gate Transit bus" },
  tanker: { mass: 32, length: 23, width: 4.7, label: "tanker truck" },
};
export const MPH_TO_UNITS = (1609.344 / 3600) * SCALE.plan;   // model units per second at 1 mph

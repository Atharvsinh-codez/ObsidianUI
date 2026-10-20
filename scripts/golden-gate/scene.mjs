import * as k from "./kit/iso-kit.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";
import * as B from "./bridge.mjs";
import * as T from "./terrain.mjs";
import { height, PLATE, TUNNEL_X, CUT_HALF } from "./land.mjs";

export const WIDTH = 1040;
export const HEIGHT = 640;
const PLATE_H = 9;
const FOOT_H = 4;
const { TOWER_X, PYLON_X, TOWER_TOP, DECK_Z, CABLE_Y, DECK_HALF } = B;
const TRUSS_Z = 34;          // truss bottom
const TRUSS_TOP = 38.4;
const ROAD_Z = DECK_Z;       // 39.9
const WALK_Z = ROAD_Z + 0.8;
const LEG = { w: 18, d: 14 };
const LEG_Y = CABLE_Y + LEG.d / 2;   // 29: centre of each leg
const PORTALS = [54, 72, 90, 108];
const SUSP_GAP = 11.52;
const ANCHOR = { x0: 388, x1: 444 };

// fog streaks over the strait: resting geometry in the defs, drifted by the page
const seeded = (n) => { let t = n * 9301 + 49297; return () => { t = (t * 9301 + 49297) % 233280; return t / 233280; }; };
export const FOG = Array.from({ length: 14 }, (_, i) => {
  const r = seeded(i + 3);
  return { x: -230 + r() * 460, y: -230 + r() * 460, z: 18 + r() * 34, len: 50 + r() * 90, speed: 5 + r() * 5, phase: r() * 6.28, wave: 1.5 + r() * 2 };
});
export const MODEL = { FOG, TOWER_X, DECK_Z: ROAD_Z, LANE_Y: B.LANE_Y, TUNNEL_X, MPH: B.MPH_TO_UNITS, VEHICLES: B.VEHICLES, REAL: B.REAL };
export const HOME = { azimuth: 38, elevation: 30 };
export const LABEL = "Relief model of the Golden Gate Bridge on a plinth: the strait, the Marin Headlands and the Presidio in contour layers, the suspension bridge with two towers and main cables, and traffic crossing in six lanes.";

// the camera: any azimuth in the south-east quadrant and any elevation, fitted to the card
export function fitCamera({ azimuth = HOME.azimuth, elevation = HOME.elevation } = {}, width = WIDTH, height_ = HEIGHT) {
  return k.fitProjection(
    [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [TOWER_X, LEG_Y, TOWER_TOP + 3], [-TOWER_X, -LEG_Y, TOWER_TOP + 3]],
    width,
    height_,
    { pad: 22, azimuth, elevation },
  );
}

// the whole scene, drawn once for a projection P; detail < 1 is the coarse
// drawing used while the camera is moving
export function buildScene(P, { detail = 1 } = {}) {
// which side of the deck faces the viewer: parts on the far side are painted
// first, so the whole scene holds its painter's order at any azimuth
const AZ = (P.azimuth * Math.PI) / 180;
const VY = Math.sin(AZ) >= 0 ? 1 : -1;
const VX = Math.cos(AZ) >= 0 ? 1 : -1;
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const at = (p) => k.iso(p, P);
const depth = (p) => k.depthOf(p, P);
const slab = (plan, z, h, style = {}, steps = 4, bevel = 0) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
const box = (x, y, w, d, z, h, style, bevel) => slab({ x, y, w, d, r: 0 }, z, h, style, 2, bevel);
const steel = { tone: "mid", className: "gg-steel" };
const steelHi = { tone: "hi", className: "gg-steel" };

// ---------------------------------------------------------------- base
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 40).sort((a, b) => depth([...a, 0]) - depth([...b, 0]));
  for (const [x, y] of feet) out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, FOOT_H, P, 28), { tone: "lo" }));
  out.push(slab(PLATE, -PLATE_H, PLATE_H, { tone: "lo" }, 6, 1.4));
  // the water inlay: the whole plinth top below the land
  out.push(`<path class="gg-water" d="${k.planOutline(k.insetPlan(PLATE, 1.5), 0, P, 6)}"/>`);
  out.push(L(k.planOutline(k.insetPlan(PLATE, 1.5), 0, P, 6), { tone: "faint" }));
  // bathymetry: the Golden Gate channel is 110 m deep right under the bridge
  const channel = (cx, cy, w, d, r) => L(k.planOutline({ x: cx - w / 2, y: cy - d / 2, w, d, r }, 0, P, 10), { tone: "faint" });
  out.push(channel(-10, -20, 150, 330, 60), channel(-16, -30, 96, 230, 40), channel(-20, -36, 46, 130, 22));
  // engraved label and a scale strip on the bay-side face
  // the engraving reads only from the bay side; from the north the face is blank
  const faceY = PLATE.y + PLATE.d;
  if (VY > 0) {
  out.push(k.faceTextSvg(k.sideMatrix([PLATE.x + 40, faceY], -3.2, P, "left"), "GOLDEN GATE BRIDGE · SAN FRANCISCO · 1937", { size: 5.2, tone: "mid" }));
  const x0 = PLATE.x + PLATE.w - 40 - B.m(1000);
  const x1 = PLATE.x + PLATE.w - 40;
  out.push(L(k.pathOf([at([x0, faceY, -2.6]), at([x1, faceY, -2.6])]) + k.pathOf([at([x0, faceY, -5.4]), at([x1, faceY, -5.4])]), { tone: "lo" }));
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const x = x0 + (B.m(1000) * i) / 10;
    ticks += k.pathOf([at([x, faceY, -2.6]), at([x, faceY, i % 5 ? -4 : -5.4])]);
  }
  out.push(L(ticks, { tone: "lo" }));
  out.push(k.faceTextSvg(k.sideMatrix([x0 - 14, faceY], -3.2, P, "left"), "0", { size: 3.6, tone: "lo", anchor: "end" }));
  out.push(k.faceTextSvg(k.sideMatrix([x1 + 4, faceY], -3.2, P, "left"), "1 km", { size: 3.6, tone: "lo" }));
  }
  return out.join("");
}

// ---------------------------------------------------------------- terrain
function terrain() {
  return T.meshTerrain({ height, plate: PLATE, cell: detail < 1 ? 12 : 5, step: detail < 1 ? 16 : 8, tunnelX: TUNNEL_X, cutHalf: CUT_HALF, cableY: CABLE_Y, P, VX, VY });
}

// ------------------------------------------------------------- the woods
// conifer tiers on the Marin headlands, sparser rounds on the Presidio;
// every tree is a <use> of a canonical solid, planted on the heightfield and
// grouped far/near with the same test the terrain uses
const TREES = (() => {
  const r = seeded(7717);
  const out = [];
  for (let i = 0; i < 2200 && out.length < 380; i++) {
    const x = PLATE.x + 16 + r() * (PLATE.w - 32);
    const y = PLATE.y + 16 + r() * (PLATE.d - 32);
    const h = height(x, y);
    if (h < 8.5) continue;                                   // shore and water stay bare
    const ax = Math.abs(x), ay = Math.abs(y);
    if (ay < CUT_HALF + 15 && ax > 190) continue;            // approach cuts and portals
    if (ax > 430 && ay < 62) continue;                       // anchorages and Vista Point
    if (ax < TUNNEL_X + 40 && ay < 46) continue;             // the bridge corridor
    const gx = height(x + 6, y) - height(x - 6, y);
    const gy = height(x, y + 6) - height(x, y - 6);
    if (Math.hypot(gx, gy) > 15) continue;                   // sheer rock faces stay bare
    const north = x < 0;
    out.push({
      x, y, z: h - 0.8,
      s: (north ? 0.85 : 0.65) + r() * (north ? 0.8 : 0.55),
      kind: r() < (north ? 0.62 : 0.35) ? 0 : 1 + Math.floor(r() * 2),
      key: depth([x, y, h]),
    });
  }
  return out;
})();
function treeStand(list) {
  return list.map((t) => {
    const [px, py] = at([t.x, t.y, t.z]);
    return `<use href="#tree-${t.kind}" transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${t.s.toFixed(2)})"/>`;
  }).join("");
}

// ---------------------------------------------------------------- deck
const DECK_X0 = -TUNNEL_X - 2;
const DECK_X1 = TUNNEL_X + 2;
const NET_W = 2.6;
const NET_Z = TRUSS_Z + 1.2;
const JOINTS = [-TOWER_X - 9.5, -TOWER_X + 9.5, 0, TOWER_X - 9.5, TOWER_X + 9.5, -B.PYLON_X, B.PYLON_X];
function deckTiles() {
  const out = [];
  const tile = 40;
  for (let x = DECK_X0; x < DECK_X1 - 1; x += tile) {
    const w = Math.min(tile, DECK_X1 - x);
    const parts = [];
    // the steel suicide-deterrent net, 6 m below the walkways, both sides
    const net = (y0) => {
      const p = [box(x, y0, w, NET_W, NET_Z, 0.25, { tone: "lo", crease: "none" })];
      let mesh = "";
      if (detail >= 1) for (let s = x + 2; s < x + w - 0.5; s += 2) mesh += k.lineOnTop([s, y0 + 0.3], [s, y0 + NET_W - 0.3], NET_Z + 0.27, P);
      p.push(L(mesh, { tone: "faint" }));
      return p.join("");
    };
    parts.push(net(-CABLE_Y - NET_W));
    parts.push(box(x, -CABLE_Y, w, 2 * CABLE_Y, TRUSS_Z, TRUSS_TOP - TRUSS_Z, steel));
    // stiffening-truss diagonals on the bay face
    let diag = "";
    for (let s = x; s < x + w - 0.1; s += 10) {
      diag += k.pathOf([at([s, CABLE_Y, TRUSS_Z]), at([s + 5, CABLE_Y, TRUSS_TOP]), at([s + 10, CABLE_Y, TRUSS_Z])]);
      diag += k.pathOf([at([s, CABLE_Y, TRUSS_TOP]), at([s + 5, CABLE_Y, TRUSS_Z]), at([s + 10, CABLE_Y, TRUSS_TOP])]);
    }
    parts.push(L(diag, { tone: "lo" }));
    parts.push(net(CABLE_Y));
    parts.push(box(x, -DECK_HALF, w, 2 * DECK_HALF, TRUSS_TOP, ROAD_Z - TRUSS_TOP, { tone: "mid" }));
    parts.push(box(x, -DECK_HALF, w, 4, ROAD_Z, WALK_Z - ROAD_Z, { tone: "mid" }));
    parts.push(box(x, DECK_HALF - 4, w, 4, ROAD_Z, WALK_Z - ROAD_Z, { tone: "mid" }));
    let dashes = "";
    for (const y of [-10, -5, 5, 10]) dashes += k.lineOnTop([x, y], [x + w, y], ROAD_Z + 0.02, P);
    parts.push(L(dashes, { tone: "faint", dashed: true }));
    // solid edge lines and the kerb step at both walkways
    let edges = "";
    for (const y of [-DECK_HALF + 4.6, DECK_HALF - 4.6]) edges += k.lineOnTop([x, y], [x + w, y], ROAD_Z + 0.02, P);
    parts.push(L(edges, { tone: "lo" }));
    // expansion joints where the deck meets the towers and at mid-span
    let joints = "";
    for (const jx of JOINTS) if (jx >= x && jx < x + w) joints += k.lineOnTop([jx, -DECK_HALF + 4], [jx, DECK_HALF - 4], ROAD_Z + 0.03, P);
    if (joints) parts.push(L(joints, { tone: "mid" }));
    // the movable median barrier, zipped into place since 2015
    parts.push(box(x, -0.55, w, 1.1, ROAD_Z, 1.3, { tone: "lo", crease: "none" }));
    out.push(`<g data-k="${depth([x, -CABLE_Y, TRUSS_Z]).toFixed(2)}">${parts.join("")}</g>`);
  }
  return out.join("");
}

// ---------------------------------------------------------------- towers
function towerItems(xt) {
  const legStage = (y0, z0, z1, inset) => {
    const w = LEG.w - 2 * inset;
    const d = LEG.d - 2 * inset;
    const x = xt - w / 2;
    const y = y0 + inset;
    const parts = [box(x, y, w, d, z0, z1 - z0, steelHi)];
    // vertical flutes on the two visible faces
    let flutes = "";
    for (const f of [0.3, 0.5, 0.7]) {
      flutes += k.rise([x + w, y + d * f], z0, z1, P);
      flutes += k.rise([x + w * f, y + d], z0, z1, P);
    }
    parts.push(L(flutes, { tone: "lo" }));
    return parts.join("");
  };
  const leg = (y0) => {
    const parts = [legStage(y0, 4, TRUSS_Z, 0), legStage(y0, TRUSS_Z, PORTALS[0], 0)];
    PORTALS.forEach((z, i) => {
      const next = PORTALS[i + 1] ?? TOWER_TOP;
      parts.push(legStage(y0, z, next, (i + 1) * 0.6));
    });
    // saddle housing
    parts.push(box(xt - 5, y0 + LEG.d / 2 - 3.5, 10, 7, TOWER_TOP, 1.4, { tone: "mid" }));
    return parts.join("");
  };
  const strut = (z) => {
    const parts = [box(xt - 7, -CABLE_Y, 14, 2 * CABLE_Y, z, 7, steelHi)];
    parts.push(box(xt - 5, -CABLE_Y, 10, 2 * CABLE_Y, z + 7, 2.2, steel));
    // the Art Deco stepped fascia: three ribs across the face
    let ribs = "";
    for (const f of [0.25, 0.5, 0.75]) ribs += k.pathOf([at([xt + 7, -CABLE_Y + 2 * CABLE_Y * f, z]), at([xt + 7, -CABLE_Y + 2 * CABLE_Y * f, z + 7])]);
    parts.push(L(ribs, { tone: "lo" }));
    return parts.join("");
  };
  const bracing = () => {
    let d = "";
    for (const [z0, z1] of [[6, 19], [21, TRUSS_Z - 1]]) {
      d += k.pathOf([at([xt, -CABLE_Y, z0]), at([xt, CABLE_Y, z1])]) + k.pathOf([at([xt, -CABLE_Y, z1]), at([xt, CABLE_Y, z0])]);
    }
    return L(d, { tone: "lo" }) + box(xt - 6, -CABLE_Y, 12, 2 * CABLE_Y, 19, 2, steel);
  };
  const pier = xt > 0
    ? box(xt - 32, -46, 64, 92, 0, 3.5, { tone: "lo" }, 1) + box(xt - 20, -40, 40, 80, 3.5, 0.5, { tone: "lo" })
    : box(xt - 30, -44, 60, 88, 0, 4, { tone: "lo" }, 1);
  const far = pier + bracing() + leg(-VY * LEG_Y - LEG.d / 2);
  const near = PORTALS.map(strut).join("") + leg(VY * LEG_Y - LEG.d / 2);
  return { far, near, key: depth([xt, VY * LEG_Y, 0]) };
}

function fender(xt) {
  // the elliptical concrete fender ring around the south pier, in segments
  const segs = [];
  const n = 36;
  const a = 52;
  const b = 72;
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * Math.PI * 2;
    const t1 = ((i + 1) / n) * Math.PI * 2;
    const ring = [[Math.cos(t0) * a, Math.sin(t0) * b], [Math.cos(t1) * a, Math.sin(t1) * b], [Math.cos(t1) * (a - 5), Math.sin(t1) * (b - 5)], [Math.cos(t0) * (a - 5), Math.sin(t0) * (b - 5)]].map(([x, y]) => [xt + x, y]);
    const mid = [xt + Math.cos((t0 + t1) / 2) * (a - 2.5), Math.sin((t0 + t1) / 2) * (b - 2.5), 0];
    segs.push({ key: depth(mid), svg: S(k.extrude(ring, 0, 2.6, P), { tone: "lo", crease: "none" }) });
  }
  segs.sort((p, q) => p.key - q.key);
  return segs.map((s) => s.svg).join("");
}

// ---------------------------------------------------------------- cables & suspenders
function cableRoute() {
  const pts = [];
  const entry = ANCHOR.x0 + 7;
  for (let x = -entry; x <= entry; x += 5) {
    const ax = Math.abs(x);
    let z;
    if (ax <= PYLON_X) z = B.cableZ(x);
    else {
      const t = (ax - PYLON_X) / (entry - PYLON_X);
      z = B.PYLON_CABLE_Z + (40.5 - B.PYLON_CABLE_Z) * t;
    }
    pts.push([x, z]);
  }
  return pts;
}
function cableItems(y) {
  const pts = cableRoute().map(([x, z]) => [x, y, z]);
  const pieces = tubePieces(pts, 1.25, P, { maxLength: 26, caps: false });
  return pieces.map((piece) => ({ key: depth(piece.mid) + 0.05, svg: `<g class="gg-cable">${tubeSvg(piece, { tone: "hi" })}</g>` }));
}
function suspenderXs() {
  const xs = [];
  for (let n = 1; n * SUSP_GAP < TOWER_X - 6; n++) xs.push(n * SUSP_GAP, -n * SUSP_GAP);
  for (let n = 1; TOWER_X + n * SUSP_GAP < PYLON_X - 4; n++) xs.push(TOWER_X + n * SUSP_GAP, -TOWER_X - n * SUSP_GAP);
  xs.push(0);
  return xs;
}
function suspenderItems(y) {
  return suspenderXs().filter((x, i) => detail >= 1 || i % 2 === 0).map((x) => ({
    key: depth([x, y, TRUSS_TOP]),
    svg: `<g data-susp="${x.toFixed(2)},${y},${TRUSS_TOP},${(B.cableZ(x) - 1.1).toFixed(2)}">${L(k.rise([x, y], TRUSS_TOP, B.cableZ(x) - 1.1, P), { tone: "mid" })}</g>`,
  }));
}

// ---------------------------------------------------------------- railings & lamps
function railItems(y, side) {
  const items = [];
  const xs = [];
  for (let x = DECK_X0 + 2; x < DECK_X1 - 1; x += SUSP_GAP) xs.push(x);
  xs.forEach((x, i) => {
    const next = xs[i + 1];
    let d = k.rise([x, y], WALK_Z, WALK_Z + 2.4, P);
    if (next !== undefined) {
      d += k.pathOf([at([x, y, WALK_Z + 2.4]), at([next, y, WALK_Z + 2.4])]);
      d += k.pathOf([at([x, y, WALK_Z + 1.3]), at([next, y, WALK_Z + 1.3])]);
    }
    const parts = [L(d, { tone: "mid" })];
    if (i % 3 === 1) {
      // light standard: fluted base, tapered post, bracket arm over the road, lantern under a hood
      const yl = y + (side > 0 ? -1.2 : 1.2);
      const ya = yl - side * 2.1;
      parts.push(S(k.cylinder(x, yl, 0.9, WALK_Z, 0.7, P, 12), { tone: "mid", crease: "none" }));
      parts.push(S(k.cylinder(x, yl, 0.42, WALK_Z + 0.7, 7.4, P, 10), { tone: "mid", crease: "none" }));
      parts.push(`<g class="gg-lamp" data-lamp="${x.toFixed(2)},${ya.toFixed(2)}">${S(k.cylinder(x, ya, 1.0, WALK_Z + 6.0, 1.5, P, 12), { tone: "hi", crease: "none" })}</g>`);
      parts.push(S(k.cylinder(x, ya, 1.3, WALK_Z + 7.5, 0.4, P, 12), { tone: "mid", crease: "none" }));
      parts.push(S(k.cylinder(x, ya, 0.3, WALK_Z + 7.9, 0.8, P, 8), { tone: "mid", crease: "none" }));
      parts.push(L(k.pathOf([at([x, yl, WALK_Z + 8.1]), at([x, yl - side * 0.9, WALK_Z + 8.7]), at([x, ya, WALK_Z + 8.7])]), { tone: "mid" }));
    }
    items.push({ key: depth([x, y, WALK_Z]), svg: parts.join("") });
  });
  return items;
}

// ---------------------------------------------------------------- pylons, anchorages, Fort Point
function pylon(xp) {
  const legW = 8;
  const legD = 7.5;
  const beamZ = DECK_Z + 12;
  const beamH = 6;
  const capH = 1.6;
  const capTop = beamZ + beamH + capH;
  const z0 = (y) => Math.max(0, height(xp, y) - 0.5);
  const legAt = (y) => box(xp - legW / 2, y, legW, legD, z0(y + legD / 2), capTop - z0(y + legD / 2), { tone: "mid" });
  const y0 = -CABLE_Y - 1.5 - legD;
  const y1 = CABLE_Y + 1.5;
  const yEnd = y1 + legD;
  const yEdges = [y0, -15, -10, -5, 0, 5, 10, 15, yEnd];
  const beams = yEdges.slice(0, -1).map((start, i) => {
    const end = yEdges[i + 1];
    const capY0 = Math.max(start, y0 + 1);
    const capY1 = Math.min(end, yEnd - 1);
    let svg = box(xp - legW / 2, start, legW, end - start, beamZ, beamH, { tone: "mid" });
    if (capY1 > capY0) svg += box(xp - legW / 2 + 1.2, capY0, legW - 2.4, capY1 - capY0, beamZ + beamH, capH, { tone: "mid" });
    return { key: depth([xp, (start + end) / 2, DECK_Z]), svg };
  });
  const [farY, nearY] = VY > 0 ? [y0, y1] : [y1, y0];
  return { far: legAt(farY), near: legAt(nearY), beams, key: depth([xp, nearY + legD / 2, 0]) };
}
function anchorage(sign) {
  const x0 = sign > 0 ? ANCHOR.x0 : -ANCHOR.x1;
  const w = ANCHOR.x1 - ANCHOR.x0;
  const parts = [box(x0, -31, w, 62, 0, 26, { tone: "lo" }), box(x0 + 2, -29, w - 4, 58, 26, 7, { tone: "lo" })];
  let seams = "";
  for (const f of [0.33, 0.66]) seams += k.rise([sign > 0 ? x0 + w : x0 + w, -31 + 62 * f], 0, 26, P);
  parts.push(L(seams, { tone: "faint" }));
  const housing = (y) => box(sign > 0 ? ANCHOR.x0 + 3 : -ANCHOR.x0 - 11, y - 3.5, 8, 7, 33, 9.5, { tone: "mid" });
  return { block: parts.join(""), farHousing: housing(-VY * CABLE_Y), nearHousing: housing(VY * CABLE_Y), key: depth([sign > 0 ? ANCHOR.x0 + 7 : -ANCHOR.x0 - 7, VY * CABLE_Y, 33]) };
}
function fortPoint() {
  const plan = { x: 361, y: -12, w: 26, d: 24, r: 2 };
  const parts = [slab(plan, 0, 8.5, { tone: "mid" }, 4), slab(k.insetPlan(plan, 1.2), 8.5, 1.2, { tone: "mid" }, 4)];
  parts.push(L(k.planOutline(k.insetPlan(plan, 6), 9.7, P, 4), { tone: "lo" }));
  parts.push(S(k.cylinder(366, -8, 1.3, 9.7, 5, P, 12), { tone: "mid", crease: "none" }));
  return parts.join("");
}
function fortArch(y) {
  const pts = [];
  for (let x = 356; x <= 388.01; x += 2) pts.push([x, y, 9 + (TRUSS_Z - 9.6) * (1 - ((x - 372) / 16) ** 2)]);
  const pieces = tubePieces(pts, 0.8, P, { maxLength: 40, caps: false });
  let posts = "";
  for (let x = 360; x <= 384; x += 4) posts += k.rise([x, y], 9 + (TRUSS_Z - 9.6) * (1 - ((x - 372) / 16) ** 2), TRUSS_Z, P);
  return pieces.map((p) => tubeSvg(p, { tone: "mid" })).join("") + L(posts, { tone: "lo" });
}

// ---------------------------------------------------------------- vehicles
const ZS = 1.35;
const WHEEL = (x, y, w) => box(x, y, 1.7, w, 0, 1.0 * ZS, { tone: "lo", crease: "none" });
function wheels(L_, W, axles) {
  return axles.map((ax) => WHEEL(ax - 0.85, -W / 2, 0.5) + WHEEL(ax - 0.85, W / 2 - 0.5, 0.5)).join("");
}
function lights(x, W, z, tone) {
  return D([at([x, -W / 2 + 0.9, z * ZS]), at([x, W / 2 - 0.9, z * ZS])], { size: 0.36, tone });
}
// each body is built nose toward +x; northbound vehicles are mirrored by building them with sign -1
function carBody(type, sign) {
  const v = B.VEHICLES[type];
  const L_ = v.length;
  const W = v.width;
  const f = (x) => sign * x;            // along-axis flip
  const bx = (x0, w) => (sign > 0 ? x0 : -x0 - w); // flipped box origin
  const out = [];
  const body = (x0, w, y0, d, z, h, style = {}, r = 0.6) => out.push(slab({ x: bx(x0, w), y: y0, w, d, r }, z * ZS, h * ZS, { tone: "hi", ...style }, 3));
  switch (type) {
    case "sedan":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.6), f(-L_ / 2 + 1.6)]));
      body(-L_ / 2, L_, -W / 2, W, 0.9, 1.5);
      body(-L_ / 2 + 2.2, L_ - 4.6, -W / 2 + 0.35, W - 0.7, 2.4, 1.6, {}, 0.9);
      out.push(lights(f(L_ / 2), W, 1.7, "hi"), lights(f(-L_ / 2), W, 1.7, "mid"));
      break;
    case "suv":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.7), f(-L_ / 2 + 1.7)]));
      body(-L_ / 2, L_, -W / 2, W, 1.0, 1.8);
      body(-L_ / 2 + 0.6, L_ - 3.2, -W / 2 + 0.3, W - 0.6, 2.8, 1.9, {}, 0.8);
      out.push(lights(f(L_ / 2), W, 1.9, "hi"), lights(f(-L_ / 2), W, 1.9, "mid"));
      break;
    case "pickup":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.8), f(-L_ / 2 + 1.8)]));
      body(-L_ / 2, L_, -W / 2, W, 1.0, 1.7);
      body(L_ / 2 - 5.2, 3.4, -W / 2 + 0.3, W - 0.6, 2.7, 1.9, {}, 0.7);
      out.push(L(k.planOutline({ x: bx(-L_ / 2 + 0.5, 4.4), y: -W / 2 + 0.5, w: 4.4, d: W - 1, r: 0.3 }, 2.7 * ZS, P, 2), { tone: "lo" }));
      out.push(lights(f(L_ / 2), W, 1.9, "hi"), lights(f(-L_ / 2), W, 1.9, "mid"));
      break;
    case "van":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.9), f(-L_ / 2 + 2.0)]));
      body(-L_ / 2, L_ - 2.4, -W / 2, W, 1.0, 4.4, {}, 0.5);
      body(L_ / 2 - 2.6, 2.6, -W / 2, W, 1.0, 3.0, {}, 0.7);
      out.push(lights(f(L_ / 2), W, 2.0, "hi"), lights(f(-L_ / 2), W, 2.0, "mid"));
      break;
    case "box":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.8), f(-L_ / 2 + 2.6)]));
      body(L_ / 2 - 3.8, 3.8, -W / 2 + 0.15, W - 0.3, 1.0, 3.3, {}, 0.6);
      body(-L_ / 2, L_ - 4.2, -W / 2, W, 1.6, 5.2, {}, 0.3);
      out.push(lights(f(L_ / 2), W, 2.0, "hi"), lights(f(-L_ / 2), W, 2.3, "mid"));
      break;
    case "semi":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.6), f(L_ / 2 - 5.2), f(L_ / 2 - 6.6), f(-L_ / 2 + 2.2), f(-L_ / 2 + 3.6)]));
      body(L_ / 2 - 5.4, 5.4, -W / 2 + 0.15, W - 0.3, 1.0, 2.4, {}, 0.5);           // tractor chassis
      body(L_ / 2 - 4.6, 3.2, -W / 2 + 0.25, W - 0.5, 3.4, 2.6, {}, 0.8);           // cab
      body(L_ / 2 - 5.3, 0.9, -W / 2 + 0.3, W - 0.6, 3.4, 3.4, {}, 0.3);            // wind deflector
      body(-L_ / 2, L_ - 6.2, -W / 2, W, 1.8, 5.4, {}, 0.3);                        // trailer
      out.push(lights(f(L_ / 2), W, 2.0, "hi"), lights(f(-L_ / 2), W, 2.4, "mid"));
      break;
    case "bus":
      out.push(wheels(L_, W, [f(L_ / 2 - 3.2), f(-L_ / 2 + 3.4)]));
      body(-L_ / 2, L_, -W / 2, W, 1.0, 5.6, {}, 0.7);
      out.push(L(k.pathOf([at([f(-L_ / 2 + 0.8), W / 2, 3.6 * ZS]), at([f(L_ / 2 - 0.8), W / 2, 3.6 * ZS])]) + k.pathOf([at([f(L_ / 2), -W / 2 + 0.6, 3.6 * ZS]), at([f(L_ / 2), W / 2 - 0.6, 3.6 * ZS])]), { tone: "lo" }));
      out.push(lights(f(L_ / 2), W, 1.8, "hi"), lights(f(-L_ / 2), W, 1.8, "mid"));
      break;
    case "tanker":
      out.push(wheels(L_, W, [f(L_ / 2 - 1.6), f(L_ / 2 - 5.2), f(-L_ / 2 + 2.2), f(-L_ / 2 + 3.6)]));
      body(L_ / 2 - 5.4, 5.4, -W / 2 + 0.15, W - 0.3, 1.0, 2.4, {}, 0.5);
      body(L_ / 2 - 4.6, 3.2, -W / 2 + 0.25, W - 0.5, 3.4, 2.6, {}, 0.8);
      body(-L_ / 2, L_ - 6.2, -W / 2 + 0.2, W - 0.4, 1.6, 1.2, {}, 0.3);             // chassis
      body(-L_ / 2 + 0.4, L_ - 7, -W / 2 + 0.45, W - 0.9, 2.8, 3.8, {}, 1.7);        // tank, rounded
      out.push(lights(f(L_ / 2), W, 2.0, "hi"), lights(f(-L_ / 2), W, 2.0, "mid"));
      break;
  }
  return out.join("");
}

// ---------------------------------------------------------------- ship
function ship() {
  const hull = [[-6, -34], [6, -34], [6, 22], [0, 34], [-6, 22]];
  // the wake: two diverging lines off the stern quarters and the transverse crests between them
  const spread = (y) => 6 + (11 * (-34 - y)) / 48;   // half width of the wake at y
  const wake = k.pathOf([at([-6, -34, 0.2]), at([-17, -82, 0.2])]) + k.pathOf([at([6, -34, 0.2]), at([17, -82, 0.2])]) + [-44, -56, -68].map((y) => k.pathOf([at([-spread(y), y, 0.2]), at([spread(y), y, 0.2])])).join("");
  const parts = [`<g class="gg-wake">${L(wake, { tone: "faint" })}${D([at([-17, -82, 0.2]), at([17, -82, 0.2])], { size: 0.4 })}</g>`, S(k.extrude(hull, 0, 4.5, P), { tone: "mid" })];
  parts.push(L(k.pathOf(hull.map(([x, y]) => at([x, y, 3.4]))) + k.pathOf([at([-6, -34, 3.4]), at([-6, 22, 3.4])]), { tone: "lo" }));
  for (let i = 0; i < 4; i++) parts.push(box(-4.6, -20 + i * 9.5, 9.2, 8.6, 4.5, 4.2, { tone: "mid" }));
  parts.push(box(-5, -32, 10, 7, 4.5, 7, { tone: "mid" }), box(-4, -31.5, 8, 5, 11.5, 1.5, { tone: "mid" }));
  parts.push(S(k.cylinder(0, -26.5, 1.2, 11.5, 3, P, 12), { tone: "lo", crease: "none" }));
  return parts.join("");
}

function sailboat(x, y, heading) {
  const c = Math.cos(heading);
  const sn = Math.sin(heading);
  const hull = [[-7, -2], [4, -2], [7, 0], [4, 2], [-7, 2]].map(([u, v]) => [x + u * c - v * sn, y + u * sn + v * c]);
  const parts = [S(k.extrude(hull, 0, 1.6, P), { tone: "mid" })];
  parts.push(L(k.rise([x, y], 1.6, 13, P), { tone: "mid" }));
  const sail = [[0, 0, 12.6], [0, 0, 2.2], [-6.2, 0, 2.2]].map(([u, v, z]) => at([x + u * c - v * sn, y + u * sn + v * c, z]));
  parts.push(`<g class="iso-solid"><path class="iso-top" d="${k.pathOf(sail, true)}"/><path class="iso-line iso-edge" data-tone="mid" d="${k.pathOf(sail, true)}"/></g>`);
  return { key: depth([x, y, 0]), svg: parts.join("") };
}
const boatDefs = Array.from({ length: 8 }, (_, i) => `<g id="boat-h${i}">${sailboat(0, 0, (i * Math.PI) / 4).svg}</g>`).join("");
const treeDefs = [
  // kind 0 · the tall cypress: slim trunk under three shrinking tiers
  S(k.cylinder(0, 0, 0.35, 0, 1.4, P, 8), { tone: "lo" }) +
  S(k.cylinder(0, 0, 2.3, 1.0, 1.7, P, 12, 0.5), { tone: "lo" }) +
  S(k.cylinder(0, 0, 1.6, 2.4, 1.6, P, 12, 0.5), { tone: "lo" }) +
  S(k.cylinder(0, 0, 0.9, 3.7, 1.7, P, 10, 0.4), { tone: "lo" }),
  // kind 1 · the round broadleaf: fat crown in two lobes
  S(k.cylinder(0, 0, 0.4, 0, 1.1, P, 8), { tone: "lo" }) +
  S(k.cylinder(0, 0, 2.6, 0.8, 1.9, P, 12, 0.7), { tone: "mid" }) +
  S(k.cylinder(0.6, -0.4, 1.7, 2.4, 1.4, P, 10, 0.5), { tone: "mid" }),
  // kind 2 · the low scrub pine
  S(k.cylinder(0, 0, 0.3, 0, 0.9, P, 8), { tone: "lo" }) +
  S(k.cylinder(0, 0, 1.9, 0.7, 1.4, P, 12, 0.5), { tone: "lo" }) +
  S(k.cylinder(0, 0, 1.1, 1.9, 1.3, P, 10, 0.4), { tone: "mid" }),
].map((svg, i) => `<g id="tree-${i}" transform="translate(${-P.origin[0].toFixed(2)} ${-P.origin[1].toFixed(2)})">${svg}</g>`).join("");
const fogDefs = FOG.map((f, i) => {
  let d = "";
  const ends = [];
  for (const [dx, dz] of [[-2.4, 0.6], [0, 0], [2.6, -0.7]]) {
    const pts = [];
    for (let t = -f.len / 2; t <= f.len / 2 + 0.01; t += 7) pts.push(at([dx + Math.sin(t / 23 + f.phase) * f.wave, t, f.z + dz]));
    d += k.pathOf(pts);
    ends.push(pts[0], pts[pts.length - 1]);
  }
  return `<g id="fog-${i}">${L(d, { tone: "lo" })}${D(ends, { size: 0.4 })}</g>`;
}).join("");

// ---------------------------------------------------------------- assemble
const land = terrain();
const towers = [towerItems(-TOWER_X), towerItems(TOWER_X)];
const pylons = [-PYLON_X, -404, 404, PYLON_X].map(pylon);
const anchors = [anchorage(-1), anchorage(1)];
const byKey = (list) => list.sort((a, b) => a.key - b.key);
const farCable = byKey(cableItems(-VY * CABLE_Y));
const nearCable = cableItems(VY * CABLE_Y);

const treeFar = TREES.filter((t) => !(t.x * VX > TUNNEL_X || t.y * VY > CABLE_Y)).sort((a, b) => a.key - b.key);
const treeNear = TREES.filter((t) => (t.x * VX > TUNNEL_X || t.y * VY > CABLE_Y)).sort((a, b) => a.key - b.key);
const layer1 = plinth() + land.far + treeStand(detail < 1 ? treeFar.filter((_, i) => i % 2 === 0) : treeFar);
const layer2 = [
  ...towers.map((t) => t.far),
  fender(TOWER_X),
  ...pylons.map((p) => p.far),
  ...anchors.map((a) => a.block + a.farHousing),
  fortPoint(),
  fortArch(-20),
  fortArch(20),
  ...farCable.map((c) => c.svg),
  ...byKey(suspenderItems(-VY * CABLE_Y)).map((s) => s.svg),
].join("");
const layer3 = deckTiles() + byKey(railItems(-VY * (DECK_HALF - 0.5), -VY)).map((r) => r.svg).join("");
const sorted = byKey([
  ...towers.map((t) => ({ key: t.key, svg: t.near })),
  ...pylons.flatMap((p) => [...p.beams, { key: p.key, svg: p.near }]),
  ...anchors.map((a) => ({ key: a.key, svg: a.nearHousing })),
  ...nearCable,
  ...suspenderItems(VY * CABLE_Y),
  ...railItems(VY * (DECK_HALF - 0.5), VY),
]);
const layer4 = sorted.map((i) => `<g data-k="${i.key.toFixed(2)}">${i.svg}</g>`).join("");
const layer5 = land.near + treeStand(detail < 1 ? treeNear.filter((_, i) => i % 2 === 0) : treeNear);

// vehicle art, two headings each
const defs = Object.keys(B.VEHICLES).map((type) => [1, -1].map((sign) => `<g id="v-${type}-${sign > 0 ? "s" : "n"}">${carBody(type, sign)}</g>`).join("")).join("") + boatDefs + fogDefs + treeDefs;

// the north portal face, as a clip for vehicles entering the tunnel
const portal = (() => {
  const pts = [at([-TUNNEL_X, -CUT_HALF, 35])];
  for (let y = -CUT_HALF; y <= CUT_HALF; y += 4) pts.push(at([-TUNNEL_X, y, height(-TUNNEL_X - 0.01, y)]));
  pts.push(at([-TUNNEL_X, CUT_HALF, 35]));
  return k.pathOf(pts, true);
})();

return { body: [
    `<defs>${defs}<clipPath id="north-portal" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="M-200 -200H${WIDTH + 200}V${HEIGHT + 200}H-200Z${portal}"/></clipPath></defs>`,
    `<g data-layer="base">${layer1}</g>`,
    `<g data-ship-slot="far"></g>`,
    `<g data-layer="far">${layer2}</g>`,
    `<g data-layer="deck">${layer3}</g>`,
    `<g data-ship-slot="near"><g data-ship transform="${k.translateAlong(P, [0, -240, 0])}">${ship()}</g></g>`,
    `<g data-layer="sorted">${layer4}</g>`,
    `<g data-layer="near">${layer5}</g>`,
    `<g data-layer="air"></g>`,
  ], defs, portal, layerCount: 5 };
}

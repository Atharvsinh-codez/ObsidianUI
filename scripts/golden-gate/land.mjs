// The heightfield of the strait and both shores, in model units (0.36 u/m plan,
// 0.55 u/m height). +x is south toward San Francisco, +y is east toward the bay.
export const PLATE = { x: -545, y: -225, w: 1085, d: 435, r: 6 };
export const TUNNEL_X = 500;   // the road enters the hills beyond this on both sides
export const CUT_HALF = 40;    // half width of the road cut through the land

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const gauss = (x, y, cx, cy, amp, sigma) => amp * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma * sigma));
// an elongated hill: sigma along its axis (deg from +x) and across it
function ridge(x, y, cx, cy, amp, along, across, deg) {
  const a = (deg * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  const u = dx * Math.cos(a) + dy * Math.sin(a);
  const v = -dx * Math.sin(a) + dy * Math.cos(a);
  return amp * Math.exp(-(u * u) / (2 * along * along) - (v * v) / (2 * across * across));
}
function noise2(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const h = (i, j) => { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); };
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
}
const rough = (x, y) => (noise2(x / 75, y / 75) - 0.5) * 18 + (noise2(x / 30 + 9, y / 30 + 3) - 0.5) * 7 + (noise2(x / 16 + 2, y / 16 + 5) - 0.5) * 1.2;
const wobble = (x, y) => (noise2(x / 40 + 5, y / 40 + 7) - 0.5) * 14;

// San Francisco shore: Fort Point at the bridge, Baker Beach falling away to the
// south-west, Crissy Field running east.
function southShore(y) {
  return 354 + 0.6 * Math.max(0, -y - 16) + 0.06 * Math.max(0, y) + 6 * smooth((y - 60) / 80) + (Math.abs(y) > 24 ? wobble(0, y) : 0);
}
// Marin shore: Lime Point under the north tower, the headland cliffs to the west,
// Horseshoe Cove and Cavallo Point to the east, Sausalito beyond.
function northShore(y) {
  let s;
  if (y < -30) s = -236 - 0.55 * (-y - 30);
  else if (y < 10) s = -236;
  else if (y < 70) s = -236 - 0.9 * (y - 10);
  else if (y < 130) s = -290 - 42 * Math.sin((Math.PI * (y - 70)) / 60);
  else if (y < 170) s = -290 - 10 * smooth((y - 130) / 40);
  else s = -300 - 0.8 * (y - 170);
  return s + (Math.abs(y) > 24 ? wobble(3, y) : 0);
}

export function height(x, y) {
  const ds = x - southShore(y);
  const dn = northShore(y) - x;
  let h = 0;
  if (ds > 0) {
    const plateau = 28 + rough(x, y) + ridge(x, y, 470, -175, 34, 90, 45, 20) + gauss(x, y, 525, 120, 26, 80) + gauss(x, y, 480, 30, 8, 55) + ridge(x, y, 500, -60, 10, 80, 30, -20);
    h = Math.max(h, Math.min(1.5 + 2.4 * ds, plateau));
  }
  if (dn > 0) {
    let base = 44 + rough(x + 400, y) + ridge(x, y, -300, -105, 62, 120, 42, 38) + gauss(x, y, -470, -170, 60, 80) + ridge(x, y, -520, -40, 30, 90, 50, 70) + ridge(x, y, -500, 190, 26, 110, 45, 60) + gauss(x, y, -400, 60, -12, 40);
    if (y > 22 && x > -430) base = Math.min(base, 24 + 8 * smooth((y - 120) / 80));   // Fort Baker and Vista Point sit low
    h = Math.max(h, Math.min(1.5 + 4.2 * dn, Math.min(base, 128)));
  }
  if (Math.abs(y) < CUT_HALF) {
    const ax = Math.abs(x);
    if (ax > TUNNEL_X) h = Math.max(h, x > 0 ? 56 : 62);
    else if (ax > 445) h = Math.min(h, 35);
    else if (ax > 235) h = Math.min(h, 20);
  }
  return h;
}

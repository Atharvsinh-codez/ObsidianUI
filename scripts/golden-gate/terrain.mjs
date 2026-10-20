// Contour-layer terrain: a heightfield sampled on a grid, traced into closed
// contours by marching squares, clipped, and extruded as concave slabs with the
// kit's facing and shading rules so each layer reads as one solid.
import * as k from "./kit/iso-kit.mjs";

const SHADES = 4;

export function marchingSquares(sample, x0, y0, nx, ny, step, level) {
  const g = [];
  for (let j = 0; j <= ny; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) row.push(sample(x0 + i * step, y0 + j * step) - level);
    g.push(row);
  }
  const key = (i, j, e) => `${i},${j},${e}`; // e: 0 bottom(j) edge along x, 1 left(i) edge along y
  const segs = [];
  const lerp = (a, b) => a / (a - b);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v = [g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]];
      let c = 0;
      for (let n = 0; n < 4; n++) if (v[n] > 0) c |= 1 << n;
      if (c === 0 || c === 15) continue;
      const pt = (edge) => {
        switch (edge) {
          case 0: return { p: [x0 + (i + lerp(v[0], v[1])) * step, y0 + j * step], id: key(i, j, 0) };
          case 1: return { p: [x0 + (i + 1) * step, y0 + (j + lerp(v[1], v[2])) * step], id: key(i + 1, j, 1) };
          case 2: return { p: [x0 + (i + lerp(v[3], v[2])) * step, y0 + (j + 1) * step], id: key(i, j + 1, 0) };
          default: return { p: [x0 + i * step, y0 + (j + lerp(v[0], v[3])) * step], id: key(i, j, 1) };
        }
      };
      const table = {
        1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]],
        9: [[2, 0]], 11: [[2, 1]], 12: [[1, 3]], 13: [[1, 0]], 14: [[0, 3]],
        5: [[3, 0], [1, 2]], 10: [[0, 1], [2, 3]],
      };
      for (const [a, b] of table[c]) segs.push([pt(a), pt(b)]);
    }
  }
  // Join segments (each oriented with the inside on its left) into loops.
  const byStart = new Map();
  for (const s of segs) byStart.set(s[0].id, s);
  const used = new Set();
  const loops = [];
  for (const s of segs) {
    if (used.has(s[0].id)) continue;
    const loop = [];
    let cur = s;
    let guard = 0;
    while (cur && !used.has(cur[0].id) && guard++ < 1e6) {
      used.add(cur[0].id);
      loop.push(cur[0].p);
      cur = byStart.get(cur[1].id);
    }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}

export function smooth(ring, passes = 1) {
  let r = ring;
  for (let p = 0; p < passes; p++) {
    const out = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    r = out;
  }
  return r;
}

export function thin(ring, minGap = 1.5) {
  const out = [];
  for (const p of ring) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= minGap) out.push(p);
  }
  if (out.length > 2) {
    const a = out[0];
    const b = out[out.length - 1];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < minGap) out.pop();
  }
  return out;
}

// Sutherland–Hodgman clip of a ring by the half-plane f(p) >= 0. Returns rings
// of {p, cut} where cut marks an edge that lies on the clip line.
export function clipRing(ring, f, point) {
  const out = [];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push({ p: a, onLine: false });
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push({ p: point(a, b, t), onLine: true });
    }
  }
  if (out.length < 3) return [];
  return [out.map((v, i) => ({ p: v.p, cut: v.onLine && out[(i + 1) % out.length].onLine }))];
}

export const clipHalfPlane = (ring, axis, value, keepAbove) =>
  clipRing(
    ring,
    (p) => (keepAbove ? p[axis] - value : value - p[axis]),
    (a, b, t) => {
      const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      q[axis] = value;
      return q;
    },
  );

export function clipRect(ring, [x0, y0, x1, y1]) {
  let rings = [ring.map((p) => ({ p, cut: false }))];
  const pass = (axis, value, keepAbove) => {
    const next = [];
    for (const r of rings) {
      const plain = r.map((v) => v.p);
      for (const c of clipHalfPlane(plain, axis, value, keepAbove)) {
        // keep prior cut flags where edges survived unchanged
        next.push(c.map((v) => ({ p: v.p, cut: false })));
      }
    }
    rings = next;
  };
  pass(0, x0, true);
  pass(0, x1, false);
  pass(1, y0, true);
  pass(1, y1, false);
  return rings.map((r) => r.map((v) => v.p));
}

const signedArea = (ring) => ring.reduce((s, [x, y], i) => {
  const [nx, ny] = ring[(i + 1) % ring.length];
  return s + x * ny - nx * y;
}, 0) / 2;

export const centroid = (ring) => {
  let x = 0;
  let y = 0;
  for (const p of ring) {
    x += p[0];
    y += p[1];
  }
  return [x / ring.length, y / ring.length];
};

// Extrude a (possibly concave) ring whose vertices are {p:[x,y], cut:boolean}
// (cut = the edge from this vertex to the next is an internal cut: no face, no line).
export function terrainSolid(verts, z, height, P) {
  const ring = verts.map((v) => v.p);
  const count = ring.length;
  const counter = signedArea(ring) > 0;
  const [vx, vy] = k.towardViewer(P);
  const { sinA, cosA } = k.cameraOf(P);
  const normals = ring.map(([ax, ay], i) => {
    const [bx, by] = ring[(i + 1) % count];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    return counter ? [dy / len, -dx / len] : [-dy / len, dx / len];
  });
  const facing = normals.map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
  const cut = verts.map((v) => v.cut);
  const top = ring.map(([x, y]) => k.iso([x, y, z + height], P));
  const bottom = ring.map(([x, y]) => k.iso([x, y, z], P));
  const faces = [];
  const [lx, ly] = [-sinA, cosA];
  for (let i = 0; i < count; i++) {
    if (!facing[i] || cut[i]) continue;
    const j = (i + 1) % count;
    const [nx, ny] = normals[i];
    const lit = (nx * lx + ny * ly + 1) / 2;
    const shade = Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
    const mid = [(ring[i][0] + ring[j][0]) / 2, (ring[i][1] + ring[j][1]) / 2, z];
    faces.push({ shade, depth: k.depthOf(mid, P), d: k.pathOf([top[i], top[j], bottom[j], bottom[i]], true) });
  }
  faces.sort((a, b) => a.depth - b.depth);
  const outline = [];
  const crease = [];
  const run = (pred) => {
    const runs = [];
    let cur = null;
    for (let i = 0; i < count; i++) {
      if (pred(i)) {
        if (!cur) cur = [i];
        cur.push((i + 1) % count);
      } else {
        if (cur) runs.push(cur);
        cur = null;
      }
    }
    if (cur) runs.push(cur);
    return runs;
  };
  for (const r of run((i) => !facing[i] && !cut[i])) outline.push(k.pathOf(r.map((i) => top[i])));
  for (const r of run((i) => facing[i] && !cut[i])) {
    crease.push(k.pathOf(r.map((i) => top[i])));
    outline.push(k.pathOf(r.map((i) => bottom[i])));
  }
  for (let i = 0; i < count; i++) {
    const h = (i + count - 1) % count;
    if (cut[h] || cut[i]) continue;
    if (facing[h] !== facing[i]) outline.push(k.pathOf([top[i], bottom[i]]));
  }
  const topPath = k.pathOf(top, true);
  return {
    fill: topPath + faces.map((f) => f.d).join(""),
    top: topPath,
    shades: Array.from({ length: SHADES }, (_, s) => faces.filter((f) => f.shade === s).map((f) => f.d).join("")),
    facesInOrder: faces,
    outline: outline.join(""),
    crease: crease.join(""),
  };
}

// solidSvg paints shade buckets grouped, which breaks painter order on concave
// rings; this paints every face in depth order instead.
export function terrainSvg(paths, { tone = "lo", crease = "faint", className = "" } = {}) {
  const parts = [`<path class="iso-fill" d="${paths.fill}"/>`];
  for (const f of paths.facesInOrder) parts.push(`<path class="iso-shade" data-shade="${f.shade}" d="${f.d}"/>`);
  parts.push(`<path class="iso-top" d="${paths.top}"/>`);
  if (paths.crease) parts.push(`<path class="iso-line iso-crease" data-tone="${crease}" d="${paths.crease}"/>`);
  parts.push(`<path class="iso-line iso-edge" data-tone="${tone}" d="${paths.outline}"/>`);
  return `<g class="iso-solid ${className}">${parts.join("")}</g>`;
}

// A faceted relief: the heightfield sampled on a grid, every cell split into
// two triangles along its flatter diagonal, each face toned by how it meets the
// light, with contour lines engraved on the surface. Cells are painted in depth
// order so the relief hides itself correctly; walls close it off at the plate
// edges and at the north portal, where the grid is split so the face is sheer.
export function meshTerrain({ height, plate, cell, tunnelX, cutHalf, cableY, P, step = 8, shoreLevel = 0.4, VX = 1, VY = 1 }) {
  const { sinA, cosA } = k.cameraOf(P);
  const [vx, vy] = k.towardViewer(P);
  const lx = -sinA;
  const ly = cosA;
  const L = [lx * 0.52, ly * 0.52, 0.72];
  const axis = (lo, hi, anchor) => {
    const set = new Set([lo, hi]);
    for (let v = anchor; v > lo; v -= cell) set.add(v);
    for (let v = anchor + cell; v < hi; v += cell) set.add(v);
    return [...set].filter((v) => v >= lo && v <= hi).sort((a, b) => a - b);
  };
  const xs = axis(plate.x + 1.5, plate.x + plate.w - 1.5, -tunnelX);
  const ys = axis(plate.y + 1.5, plate.y + plate.d - 1.5, -cutHalf);
  const onPortal = (x, y) => Math.abs(Math.abs(x) - tunnelX) < 1e-6 && Math.abs(y) < cutHalf;
  const hAt = (x, y, cx) => Math.max(0, height(onPortal(x, y) ? x + Math.sign(cx - x) * 0.01 : x, y));
  // tones come from normals averaged over a neighbourhood, so the facets read as
  // one slope rather than a scatter of light and dark triangles
  // one-sided differences, keeping the gentler side, so a cliff does not smear
  // its slope into the flat ground on either side of it
  const gentler = (f, b) => (Math.abs(f) < Math.abs(b) ? f : b);
  const normalAt = (x, y, cx) => {
    const d = cell;
    const z = hAt(x, y, cx);
    const dzdx = gentler((hAt(x + d, y, cx) - z) / d, (z - hAt(x - d, y, cx)) / d);
    const dzdy = gentler((hAt(x, y + d, cx) - z) / d, (z - hAt(x, y - d, cx)) / d);
    const len = Math.hypot(dzdx, dzdy, 1);
    return [-dzdx / len, -dzdy / len, 1 / len];
  };
  const faceNormal = (a, b, c) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    return [nx, ny, nz];
  };
  const litOf = ([nx, ny, nz]) => {
    const len = Math.hypot(nx, ny, nz) || 1;
    return (nx * L[0] + ny * L[1] + nz * L[2]) / len;
  };
  const THRESHOLDS = [0.16, 0.34, 0.52, 0.7];
  const toneBelow = (i) => (i === 0 ? 0 : i);
  // split a polygon (points carry their light value as a 4th component) at v = t
  const splitAt = (poly, t) => {
    const below = [];
    const above = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      (a[3] < t ? below : above).push(a);
      if ((a[3] < t) !== (b[3] < t)) {
        const f = (t - a[3]) / (b[3] - a[3]);
        const m = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, t];
        below.push(m);
        above.push(m);
      }
    }
    return [below, above];
  };
  // a triangle becomes one band per tone it spans, cut along the light's
  // iso-lines, so shading boundaries run smoothly across the relief instead
  // of serrating along the facets
  const bandsOf = (tri, cx) => {
    const tz = tri.map((p) => p[2]);
    if (Math.max(...tz) - Math.min(...tz) > cell * 1.4) {
      const v = litOf(faceNormal(...tri));
      const i = THRESHOLDS.findIndex((t) => v < t);
      return [{ tone: i < 0 ? "top" : toneBelow(i), poly: tri }];
    }
    let cur = tri.map((p) => [...p, litOf(normalAt(p[0], p[1], cx))]);
    const out = [];
    for (let i = 0; i < THRESHOLDS.length; i++) {
      const [below, above] = splitAt(cur, THRESHOLDS[i]);
      if (below.length >= 3) out.push({ tone: toneBelow(i), poly: below });
      cur = above;
      if (cur.length < 3) break;
    }
    if (cur.length >= 3) out.push({ tone: "top", poly: cur });
    return out;
  };
  const sideShade = (nx, ny) => Math.min(SHADES - 1, Math.max(0, Math.floor(((nx * lx + ny * ly + 1) / 2) * SHADES)));
  const far = [];
  const near = [];
  const place = (cx, cy) => (cx * VX > tunnelX || cy * VY > cableY ? near : far);
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // one straight segment per cell and level, interpolated along the cell edges
  // the facets share, so neighbouring cells meet without a kink at the diagonal
  const contour = (c, level) => {
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = c[i];
      const b = c[(i + 1) % 4];
      if ((a[2] - level) * (b[2] - level) < 0) pts.push(lerp(a, b, (level - a[2]) / (b[2] - a[2])));
    }
    if (pts.length === 2) return k.pathOf(pts.map((p) => k.iso(p, P)));
    if (pts.length === 4) return k.pathOf([pts[0], pts[1]].map((p) => k.iso(p, P))) + k.pathOf([pts[2], pts[3]].map((p) => k.iso(p, P)));
    return "";
  };
  const emit = (list, key, faces, faint, shore) => {
    const parts = [];
    for (const f of faces) parts.push(f.tone === "top" ? `<path class="iso-top" d="${f.d}"/>` : `<path class="iso-shade" data-shade="${f.tone}" d="${f.d}"/>`);
    if (faint) parts.push(`<path class="iso-line iso-crease" data-tone="lo" d="${faint}"/>`);
    if (shore) parts.push(`<path class="iso-line iso-edge" data-tone="mid" d="${shore}"/>`);
    list.push({ key, svg: `<g class="iso-solid gg-land" data-seamless>${parts.join("")}</g>` });
  };
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const c = [[x0, y0, hAt(x0, y0, cx)], [x1, y0, hAt(x1, y0, cx)], [x1, y1, hAt(x1, y1, cx)], [x0, y1, hAt(x0, y1, cx)]];
      if (c.every((p) => p[2] <= 0.05)) continue;
      const tris = Math.abs(c[0][2] - c[2][2]) <= Math.abs(c[1][2] - c[3][2]) ? [[c[0], c[1], c[2]], [c[0], c[2], c[3]]] : [[c[0], c[1], c[3]], [c[1], c[2], c[3]]];
      const faces = [];
      for (const t of tris) for (const band of bandsOf(t, cx)) faces.push({ tone: band.tone, d: k.pathOf(band.poly.map((p) => k.iso(p, P)), true) });
      let faint = "";
      let shore = "";
      const zmin = Math.min(...c.map((p) => p[2]));
      const zmax = Math.max(...c.map((p) => p[2]));
      if (zmin < shoreLevel && zmax > shoreLevel) shore += contour(c, shoreLevel);
      // no contours on sheer faces: the cut walls and the portal read as plain rock
      if (zmax - zmin <= step * 1.5) for (let lv = step - 1; lv < zmax; lv += step) if (lv > zmin) faint += contour(c, lv);
      // a heightfield has no overhangs, so plan depth alone gives the painter's order
      emit(place(cx, cy), k.depthOf([cx, cy, 0], P), faces, faint, shore);
      // walls where the relief is cut by the plate edge, on the sides that face the viewer
      const walls = [];
      if (i === xs.length - 2 && vx > 0) walls.push([c[1], c[2], [1, 0]]);
      if (i === 0 && vx < 0) walls.push([c[3], c[0], [-1, 0]]);
      if (j === ys.length - 2 && vy > 0) walls.push([c[2], c[3], [0, 1]]);
      if (j === 0 && vy < 0) walls.push([c[0], c[1], [0, -1]]);
      for (const [a, b, n] of walls) {
        if (a[2] <= 0.05 && b[2] <= 0.05) continue;
        const quad = [a, b, [b[0], b[1], 0], [a[0], a[1], 0]].map((p) => k.iso(p, P));
        const rim = k.pathOf([k.iso(a, P), k.iso(b, P)]);
        const list = place(cx, cy);
        list.push({ key: k.depthOf([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0], P) + 0.01, svg: `<g class="iso-solid gg-land" data-seamless><path class="iso-shade" data-shade="${sideShade(n[0], n[1])}" d="${k.pathOf(quad, true)}"/><path class="iso-line iso-edge" data-tone="lo" d="${rim}"/></g>` });
      }
    }
  }
  // the north portal: a sheer face where the road enters the Marin hills
  if (vx > 0) {
    for (let j = 0; j < ys.length - 1; j++) {
      const y0 = ys[j], y1 = ys[j + 1];
      if (y0 < -cutHalf - 1e-6 || y1 > cutHalf + 1e-6) continue;
      const x = -tunnelX;
      const hi = [Math.max(0, height(x - 0.01, y0)), Math.max(0, height(x - 0.01, y1))];
      const lo = [Math.max(0, height(x + 0.01, y0)), Math.max(0, height(x + 0.01, y1))];
      if (hi[0] <= lo[0] + 0.05 && hi[1] <= lo[1] + 0.05) continue;
      const quad = [[x, y0, hi[0]], [x, y1, hi[1]], [x, y1, lo[1]], [x, y0, lo[0]]].map((p) => k.iso(p, P));
      const rim = k.pathOf([k.iso([x, y0, hi[0]], P), k.iso([x, y1, hi[1]], P)]);
      far.push({ key: k.depthOf([x, (y0 + y1) / 2, 0], P) + 0.01, svg: `<g class="iso-solid gg-land" data-seamless><path class="iso-shade" data-shade="${sideShade(1, 0)}" d="${k.pathOf(quad, true)}"/><path class="iso-line iso-edge" data-tone="lo" d="${rim}"/></g>` });
    }
  }
  const order = (a, b) => a.key - b.key;
  far.sort(order);
  near.sort(order);
  return { far: far.map((i) => i.svg).join(""), near: near.map((i) => i.svg).join("") };
}

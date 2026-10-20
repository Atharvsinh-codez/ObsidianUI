import model from "@/lib/generated/golden-gate.json";
import type { ViewBox } from "./framing";
import { iso, pathOf, translateAlong, type Projection, type WorldPoint } from "./projection";

type VehicleType = keyof typeof model.vehicles;
type Spec = (typeof model.vehicles)[VehicleType];

type Vehicle = {
  spec: Spec;
  paint: string;
  laneY: number;
  sign: 1 | -1;
  s: number;
  x: number;
  want: number;
  speed: number;
  node: SVGGElement;
  inner: SVGGElement;
  clipped: boolean;
  hidden: boolean;
  active: boolean;
};

type Lane = { laneY: number; sign: 1 | -1; outer: boolean; group: SVGGElement; pool: Vehicle[]; tail: Vehicle | null; nextGap: number; delay: number };
type Drifter = { node: SVGGElement; inner: SVGGElement; shown: boolean };

const P = model.projection as Projection;
const SVG_NS = "http://www.w3.org/2000/svg";
const HEAVY: readonly VehicleType[] = ["semi", "box", "bus", "tanker"];
const MIX: Record<"slow" | "fast", [VehicleType, number][]> = {
  slow: [["sedan", 0.3], ["suv", 0.16], ["pickup", 0.1], ["van", 0.1], ["box", 0.12], ["semi", 0.12], ["bus", 0.05], ["tanker", 0.05]],
  fast: [["sedan", 0.5], ["suv", 0.28], ["pickup", 0.12], ["van", 0.1]],
};
const S_IN = -(model.tunnelX + 40);
const S_OUT = model.tunnelX + 40;
const WATER = { x: 235, y: 215 };
// Pointer reach on the deck, in model units: lamps brighten and suspenders stir inside it.
const REACH = 64;
// Traffic enters at the tunnel mouths, a long drive from the north tower, so the bridge starts already busy.
const WARM_SECONDS = 160;

// Each vehicle keeps one paint, shown only while the pointer is on it. Trucks and buses draw
// from their own fleet colours so they read apart from the cars.
const CAR_PAINT = ["#e5484d", "#3e63dd", "#30a46c", "#f5b40b", "#8e4ec6", "#12a594", "#f76b15", "#d6409f", "#0090ff", "#7ac943"];
const TRUCK_PAINT = ["#ff9f1c", "#2b59c3", "#c1121f", "#2d6a4f", "#ffd60a", "#6d28d9", "#0e7490", "#f4f1ea"];
// A tap has no hover to end it, so a tapped car keeps its colour this long.
const TOUCH_PAINT_MS = 2600;
// Scene units past the frame edge that still count as on screen, sized to each thing's reach.
const MARGIN = { part: 10, vehicle: 18, boat: 16, fog: 90, ship: 120, gull: 8 };

const sanFranciscoHour = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hourCycle: "h23" });

export type GoldenGate = { setView: (view: ViewBox) => void; destroy: () => void };

const group = (layer?: string) => {
  const node = document.createElementNS(SVG_NS, "g");
  if (layer) node.setAttribute("data-layer", layer);
  return node;
};

/**
 * Runs traffic, the bay and the pointer response on the north tower scene. Only the part of the
 * figure inside the current view is laid out and animated; everything else is display: none.
 */
export function mountGoldenGate(stage: HTMLElement, svg: SVGSVGElement): GoldenGate {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const layerOf = (name: string) => svg.querySelector<SVGGElement>(`[data-layer="${name}"]`);
  const sceneGroup = svg.querySelector<SVGGElement>("[data-scene]");
  const [farLayer, deckLayer, sortedLayer, nearLayer, airLayer] = ["far", "deck", "sorted", "near", "air"].map(layerOf);
  const shipNode = svg.querySelector<SVGGElement>("[data-ship]");
  const farSlot = svg.querySelector<SVGGElement>('[data-ship-slot="far"]');
  const nearSlot = svg.querySelector<SVGGElement>('[data-ship-slot="near"]');
  if (!sceneGroup || !farLayer || !deckLayer || !sortedLayer || !nearLayer || !airLayer || !shipNode || !farSlot || !nearSlot) {
    throw new Error("The Golden Gate scene is missing a layer");
  }
  const air = airLayer;
  const ship = shipNode;
  const slots = { far: farSlot, near: nearSlot };

  // ---- stacking: a change anywhere inside an <svg> repaints all of it, so the figure is split
  // into stacked roots and everything that moves every frame shares one small root of its own.
  // Far-side water lies under the deck on screen, so boats there draw beneath the deck; near-side
  // boats pass below the near steel. Traffic sits wholly beneath the sorted layer: everything in
  // it (the near leg and struts, near cable, suspenders, rails, lamps, pylon beams) stands beyond
  // the near lane or above the tallest vehicle, so it covers any car it overlaps. Lanes are 5
  // units apart and no vehicle is wider than 4.7, so a nearer lane always draws over a farther
  // one; within a lane a car never overtakes, so its far-to-near order only changes when a car
  // enters. Fog banks cross the deck at road height and are faint, so they draw over traffic.
  const farBoats = group();
  const nearBoats = group();
  const traffic = group("traffic");
  const fogLayer = group("fog");
  const stack = (...nodes: Element[]) => {
    const root = svg.cloneNode(false) as SVGSVGElement;
    const scene = sceneGroup.cloneNode(false) as SVGGElement;
    scene.append(...nodes);
    root.append(scene);
    return root;
  };
  const moving = stack(slots.near, nearBoats, traffic, fogLayer);
  moving.setAttribute("data-moving", "");
  const roots = [svg, stack(slots.far, farBoats), stack(farLayer, deckLayer), moving, stack(sortedLayer, nearLayer), stack(air)];
  svg.after(...roots.slice(1));

  // The deck lamps follow the real dusk at the bridge; the dark theme keeps them lit regardless.
  const markNight = () => {
    const hour = Number(sanFranciscoHour.format(new Date()));
    stage.toggleAttribute("data-night", hour < 7 || hour >= 19);
  };
  markNight();

  const lamps = [...stage.querySelectorAll<SVGGElement>("[data-lamp]")].map((node) => {
    const [x, y] = (node.dataset.lamp ?? "").split(",").map(Number);
    return { node, x, y, on: false };
  });
  const suspenders = [...stage.querySelectorAll<SVGGElement>("[data-susp]")].flatMap((node) => {
    const path = node.firstElementChild;
    if (!(path instanceof SVGPathElement)) return [];
    const [x, y, zBot, zTop] = (node.dataset.susp ?? "").split(",").map(Number);
    return [{ path, x, y, zBot, zTop, id: node.dataset.susp ?? "" }];
  });

  // ---- the view: static parts outside it are hidden, moving parts outside it are skipped
  let view = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
  const onScreen = ([x, y]: [number, number], margin: number) =>
    x >= view.x0 - margin && x <= view.x1 + margin && y >= view.y0 - margin && y <= view.y1 + margin;
  const show = (node: SVGElement, visible: boolean) => {
    node.style.display = visible ? "" : "none";
  };
  const parts = [...stage.querySelectorAll<SVGElement>("[data-b]")].map((node) => {
    const [x0, y0, x1, y1] = (node.dataset.b ?? "").split(" ").map(Number);
    return { node, x0, y0, x1, y1, shown: true };
  });
  function cullParts() {
    const m = MARGIN.part;
    for (const part of parts) {
      const shown = part.x1 >= view.x0 - m && part.x0 <= view.x1 + m && part.y1 >= view.y0 - m && part.y0 <= view.y1 + m;
      if (shown === part.shown) continue;
      part.shown = shown;
      show(part.node, shown);
    }
  }

  // ---- traffic: six lanes of car following, the same model as the full figure
  let seed = 1937;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (table: [VehicleType, number][]) => {
    let r = rand();
    for (const [type, weight] of table) if ((r -= weight) <= 0) return type;
    return table[table.length - 1][0];
  };
  const vehicles: Vehicle[] = [];
  const vehicleByNode = new Map<Element, Vehicle>();
  const lanes: Lane[] = model.laneY.map((laneY, lane) => ({
    laneY,
    sign: lane < 3 ? 1 : -1,
    outer: lane === 0 || lane === 5,
    group: group(),
    pool: [],
    tail: null,
    nextGap: 0,
    delay: rand() * 1.5,
  }));
  for (const lane of [...lanes].sort((a, b) => a.laneY - b.laneY)) traffic.append(lane.group);
  const headingOf = (sign: 1 | -1) => (sign > 0 ? "s" : "n");

  function makeVehicle(lane: Lane) {
    const node = document.createElementNS(SVG_NS, "g");
    node.setAttribute("class", "gg-car");
    node.style.display = "none";
    const inner = document.createElementNS(SVG_NS, "g");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#v-sedan-${headingOf(lane.sign)}`);
    inner.append(use);
    node.append(inner);
    lane.group.append(node);
    const vehicle: Vehicle = { spec: model.vehicles.sedan, paint: CAR_PAINT[0], laneY: lane.laneY, sign: lane.sign, s: S_IN, x: 0, want: 0, speed: 0, node, inner, clipped: false, hidden: true, active: false };
    vehicles.push(vehicle);
    vehicleByNode.set(node, vehicle);
    lane.pool.push(vehicle);
    return vehicle;
  }

  const activeIn = (lane: Lane) => lane.pool.filter((v) => v.active).sort((a, b) => a.s - b.s);

  function spawnTraffic(dt: number) {
    for (const lane of lanes) {
      lane.delay = Math.max(0, lane.delay - dt);
      const tail = lane.tail?.active ? lane.tail : activeIn(lane)[0] ?? null;
      lane.tail = tail;
      if (lane.delay > 0) continue;
      const type = pick(lane.outer ? MIX.slow : MIX.fast);
      const spec = model.vehicles[type];
      if (tail && tail.s - S_IN < tail.spec.length / 2 + spec.length / 2 + lane.nextGap) continue;
      let vehicle = lane.pool.find((v) => !v.active);
      if (!vehicle && lane.pool.length < 26) vehicle = makeVehicle(lane);
      if (!vehicle) continue;
      const heavy = HEAVY.includes(type);
      const want = model.mph * (heavy ? 38 + rand() * 6 : 43 + rand() * 7);
      const palette = heavy ? TRUCK_PAINT : CAR_PAINT;
      let paint = palette[Math.floor(rand() * palette.length)];
      // Never the same colour as the vehicle just ahead in the lane.
      if (paint === tail?.paint) paint = palette[(palette.indexOf(paint) + 1) % palette.length];
      vehicle.paint = paint;
      vehicle.node.style.setProperty("--gg-paint", paint);
      vehicle.spec = spec;
      vehicle.s = S_IN;
      vehicle.want = want;
      vehicle.speed = Math.min(want, tail ? tail.speed : want);
      vehicle.active = true;
      vehicle.inner.firstElementChild?.setAttribute("href", `#v-${type}-${headingOf(lane.sign)}`);
      // A new car is the farthest in a southbound lane (lowest x) and the nearest in a northbound one.
      if (lane.sign > 0) {
        if (lane.group.firstChild !== vehicle.node) lane.group.prepend(vehicle.node);
      } else if (lane.group.lastChild !== vehicle.node) lane.group.append(vehicle.node);
      lane.tail = vehicle;
      lane.nextGap = lane.outer ? 26 + rand() * rand() * 150 : 22 + rand() * rand() * 140;
      lane.delay = 0;
    }
  }

  function stepTraffic(dt: number) {
    for (const lane of lanes) {
      const inLane = activeIn(lane);
      inLane.forEach((v, i) => {
        const lead = inLane[i + 1];
        let target = v.want;
        if (lead) {
          const gap = lead.s - v.s - (lead.spec.length + v.spec.length) / 2;
          const safe = 6 + v.speed * 0.9;
          if (gap < safe) target = Math.min(v.want, lead.speed * Math.min(1, gap / safe));
        }
        v.speed += (target - v.speed) * Math.min(1, dt * (target < v.speed ? 4 : 1.2));
      });
      for (const v of inLane) {
        v.s += v.speed * dt;
        if (v.s > S_OUT) {
          v.active = false;
          if (followed === v) setFollowed(null);
        }
      }
      if (!lane.tail?.active) lane.tail = activeIn(lane)[0] ?? null;
    }
  }

  function placeVehicles() {
    for (const v of vehicles) {
      v.x = v.sign > 0 ? v.s : -v.s;
      const at: WorldPoint = [v.x, v.laneY, model.deckZ];
      const hidden = !v.active || Math.abs(v.x) > model.tunnelX + v.spec.length / 2 + 1 || !onScreen(iso(at, P), MARGIN.vehicle + v.spec.length);
      if (hidden !== v.hidden) {
        v.hidden = hidden;
        show(v.node, !hidden);
        if (hidden && followed === v) setFollowed(null);
      }
      if (hidden) continue;
      v.inner.setAttribute("transform", translateAlong(P, at));
      const clipped = v.x < -model.tunnelX + v.spec.length / 2 + 2;
      if (clipped !== v.clipped) {
        v.clipped = clipped;
        if (clipped) v.node.setAttribute("clip-path", "url(#north-portal)");
        else v.node.removeAttribute("clip-path");
      }
    }
  }

  // ---- the bay: a container ship, sailboats tacking, fog drifting in, gulls
  const VIEW_SIDE = Math.sign(Math.sin((P.azimuth * Math.PI) / 180)) || 1;
  const farSide = (y: number) => y * VIEW_SIDE < -4;

  let shipY = -120;
  let shipSlot: "far" | "near" | null = null;
  let shipShown = true;
  function placeShip(dt: number) {
    shipY += 2.3 * dt;
    if (shipY > 236) shipY = -236;
    const shown = onScreen(iso([-30, shipY, 0], P), MARGIN.ship);
    if (shown !== shipShown) {
      shipShown = shown;
      show(ship, shown);
    }
    if (!shown) return;
    ship.setAttribute("transform", translateAlong(P, [-30, shipY, 0]));
    ship.style.opacity = Math.min(1, (236 - Math.abs(shipY)) / 18).toFixed(2);
    const slot = farSide(shipY) ? "far" : "near";
    if (slot !== shipSlot) {
      shipSlot = slot;
      slots[slot].append(ship);
    }
  }

  const makeDrifter = (className: string, href: string) => {
    const node = document.createElementNS(SVG_NS, "g");
    node.setAttribute("class", className);
    const inner = document.createElementNS(SVG_NS, "g");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", href);
    inner.append(use);
    node.append(inner);
    return { node, inner, shown: true };
  };
  /** Shows or hides a drifter by where it is; true when it is on screen and needs placing. */
  const drifterOnScreen = (d: Drifter, at: WorldPoint, margin: number) => {
    const shown = onScreen(iso(at, P), margin);
    if (shown !== d.shown) {
      d.shown = shown;
      show(d.node, shown);
    }
    return shown;
  };

  const boats = ([[-70, 150, 0.6], [80, 115, -2.2], [-160, 95, 1.1], [120, -150, 2.6]] as const).map(([x, y, heading], i) => ({
    ...makeDrifter("gg-boat", "#boat-h0"),
    x,
    y,
    heading: heading as number,
    speed: 3.2 + i * 0.5,
    tackIn: 8 + i * 4,
    dir: 0,
  }));
  function placeBoats(dt: number) {
    for (const b of boats) {
      b.tackIn -= dt;
      const out = Math.abs(b.x) > WATER.x || Math.abs(b.y) > WATER.y || (Math.abs(b.y) < 22 && Math.abs(b.x) < 40);
      if (b.tackIn <= 0 || out) {
        // Come about onto a heading that points back into open water.
        const toCentre = Math.atan2(-b.y, -b.x);
        b.heading = out ? toCentre + (rand() - 0.5) * 1.2 : b.heading + (rand() < 0.5 ? 1 : -1) * (1.4 + rand() * 0.8);
        b.tackIn = 10 + rand() * 12;
      }
      b.x += Math.cos(b.heading) * b.speed * dt;
      b.y += Math.sin(b.heading) * b.speed * dt;
      if (!drifterOnScreen(b, [b.x, b.y, 0], MARGIN.boat)) continue;
      const dir = ((Math.round(b.heading / (Math.PI / 4)) % 8) + 8) % 8;
      if (dir !== b.dir) {
        b.dir = dir;
        b.inner.firstElementChild?.setAttribute("href", `#boat-h${dir}`);
      }
      b.inner.setAttribute("transform", translateAlong(P, [b.x, b.y, 0]));
      const water = farSide(b.y) ? farBoats : nearBoats;
      if (b.node.parentNode !== water) water.append(b.node);
    }
  }

  const fog = model.fog.map((f, i) => ({ ...makeDrifter("gg-fog", `#fog-${i}`), x: f.x, y: f.y, z: f.z, speed: f.speed, t: f.phase, opacity: "" }));
  function placeFog(dt: number) {
    for (const f of fog) {
      f.y += f.speed * dt;
      f.t += dt * 0.35;
      if (f.y > 240) f.y -= 480;
      if (!drifterOnScreen(f, [f.x, f.y, f.z], MARGIN.fog)) continue;
      const edge = Math.min(1, (240 - Math.abs(f.y)) / 30);
      // Group opacity repaints the whole bank, so write it only when it visibly changes.
      const opacity = (edge * (0.42 + 0.2 * Math.sin(f.t))).toFixed(2);
      if (opacity !== f.opacity) {
        f.opacity = opacity;
        f.node.style.opacity = opacity;
      }
      f.inner.setAttribute("transform", translateAlong(P, [f.x, f.y, 0]));
    }
  }

  const gulls = Array.from({ length: 6 }, (_, i) => {
    const node = document.createElementNS(SVG_NS, "path");
    node.setAttribute("class", "gg-gull");
    air.append(node);
    return { node, cx: -120 + i * 48, cy: (i % 2 ? 1 : -1) * (60 + i * 18), r: 24 + i * 6, z: 72 + i * 4, a: i * 1.1, w: (i % 2 ? 1 : -1) * (0.35 + i * 0.04), flap: i * 0.7, shown: true };
  });
  function placeGulls(dt: number) {
    for (const g of gulls) {
      g.a += g.w * dt;
      g.flap += dt * 7;
      const x = g.cx + Math.cos(g.a) * g.r;
      const y = g.cy + Math.sin(g.a) * g.r;
      const z = g.z + Math.sin(g.a * 3) * 2;
      const shown = onScreen(iso([x, y, z], P), MARGIN.gull);
      if (shown !== g.shown) {
        g.shown = shown;
        show(g.node, shown);
      }
      if (!shown) continue;
      const hx = -Math.sin(g.a) * Math.sign(g.w);
      const hy = Math.cos(g.a) * Math.sign(g.w);
      const lift = Math.sin(g.flap) * 1.6;
      const span = 4.2;
      // A gull is a thin filled chevron: two wings meeting at the body.
      g.node.setAttribute("d", pathOf([
        iso([x - hy * span, y + hx * span, z + lift], P),
        iso([x, y, z], P),
        iso([x + hy * span, y - hx * span, z + lift], P),
        iso([x, y, z + 0.9], P),
      ], true));
    }
  }

  // ---- the pointer: lamps brighten and suspenders stir near it, each on its own spring
  let pointerAt: [number, number] | null = null;
  const springs = new Map<string, { at: number; rate: number }>();
  const toScene = (clientX: number, clientY: number) => {
    const ctm = svg.getScreenCTM();
    return ctm ? new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse()) : null;
  };
  function deckPoint(clientX: number, clientY: number): [number, number] | null {
    const point = toScene(clientX, clientY);
    if (!point) return null;
    // Invert the projection on the deck plane.
    const [ox, oy] = iso([0, 0, 0], P);
    const [ax, ay] = iso([1, 0, 0], P);
    const [bx, by] = iso([0, 1, 0], P);
    const [zx, zy] = iso([0, 0, model.deckZ], P);
    const m00 = ax - ox, m10 = ay - oy, m01 = bx - ox, m11 = by - oy;
    const r0 = point.x - zx;
    const r1 = point.y - zy;
    const det = m00 * m11 - m01 * m10;
    return [(r0 * m11 - m01 * r1) / det, (m00 * r1 - m10 * r0) / det];
  }

  function stirSuspenders(dt: number) {
    for (const sp of suspenders) {
      let state = springs.get(sp.id);
      let want = 0;
      if (pointerAt) {
        const dx = sp.x - pointerAt[0];
        const d = Math.hypot(dx, sp.y - pointerAt[1]);
        if (d < REACH) want = Math.sign(dx || 1) * 2.4 * (1 - d / REACH) ** 2;
      }
      if (!state) {
        if (!want) continue;
        state = { at: 0, rate: 0 };
        springs.set(sp.id, state);
      }
      state.rate += (want - state.at) * 70 * dt - state.rate * 4.5 * dt;
      state.at += state.rate * dt;
      if (!want && Math.abs(state.at) < 0.01 && Math.abs(state.rate) < 0.01) {
        state.at = 0;
        springs.delete(sp.id);
      }
      sp.path.setAttribute("d", pathOf([iso([sp.x + state.at, sp.y, sp.zBot], P), iso([sp.x, sp.y, sp.zTop], P)]));
    }
  }

  function lightLamps() {
    for (const lamp of lamps) {
      const on = pointerAt !== null && Math.hypot(lamp.x - pointerAt[0], lamp.y - pointerAt[1]) < REACH * 1.3;
      if (on === lamp.on) continue;
      lamp.on = on;
      lamp.node.toggleAttribute("data-on", on);
    }
  }

  // ---- the car under the pointer shows its own paint
  let followed: Vehicle | null = null;
  function setFollowed(v: Vehicle | null) {
    if (followed === v) return;
    followed?.node.removeAttribute("data-lit");
    followed = v;
    v?.node.setAttribute("data-lit", "");
  }
  // The mouse position while it is over the stage: traffic moves under a still cursor, so the
  // car beneath it is looked up again every frame.
  let mouseAt: { x: number; y: number } | null = null;
  let unpaint = 0;

  /** The browser's own hit test, so a car hidden behind the tower or another car is never picked. */
  const vehicleAt = (clientX: number, clientY: number) => {
    const hit = document.elementFromPoint(clientX, clientY)?.closest(".gg-car");
    const v = hit ? vehicleByNode.get(hit) : undefined;
    return v?.active && !v.hidden ? v : null;
  };

  /** A fingertip is wider than a car, so a tap also takes the nearest car within reach. */
  function nearestVehicle(clientX: number, clientY: number) {
    const point = toScene(clientX, clientY);
    if (!point) return null;
    let best: Vehicle | null = null;
    let bestD = 12 * 12;
    for (const v of vehicles) {
      if (!v.active || v.hidden) continue;
      const [sx, sy] = iso([v.x, v.laneY, model.deckZ + 2], P);
      const d = (sx - point.x) ** 2 + (sy - point.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }

  const onPointerMove = (event: PointerEvent) => {
    pointerAt = deckPoint(event.clientX, event.clientY);
    if (event.pointerType === "mouse") {
      mouseAt = { x: event.clientX, y: event.clientY };
      setFollowed(vehicleAt(event.clientX, event.clientY));
    } else {
      const v = vehicleAt(event.clientX, event.clientY) ?? nearestVehicle(event.clientX, event.clientY);
      if (v) {
        setFollowed(v);
        window.clearTimeout(unpaint);
        unpaint = window.setTimeout(() => setFollowed(null), TOUCH_PAINT_MS);
      }
    }
    lightLamps();
    run();
  };
  const onPointerLeave = (event: PointerEvent) => {
    pointerAt = null;
    if (event.pointerType === "mouse") {
      mouseAt = null;
      setFollowed(null);
    }
    lightLamps();
    run();
  };
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerdown", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);

  // ---- loop
  let frame = 0;
  let last = 0;
  let visible = false;
  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (!still.matches) {
      spawnTraffic(dt);
      stepTraffic(dt);
      placeVehicles();
      placeShip(dt);
      placeBoats(dt);
      placeFog(dt);
      placeGulls(dt);
      stirSuspenders(dt);
      if (mouseAt) setFollowed(vehicleAt(mouseAt.x, mouseAt.y));
    }
    frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
    if (!frame) last = 0;
  }
  function run() {
    if (!frame && visible) frame = requestAnimationFrame(tick);
  }

  for (let t = 0; t < WARM_SECONDS; t += 0.1) {
    spawnTraffic(0.1);
    stepTraffic(0.1);
  }
  for (const f of fog) fogLayer.append(f.node);
  function placeAll() {
    placeVehicles();
    placeShip(0);
    placeBoats(0);
    placeFog(0);
    placeGulls(0);
  }
  placeAll();

  const observer = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
  }, { rootMargin: "120px 0px" });
  observer.observe(stage);
  const dusk = window.setInterval(markNight, 60_000);
  const onMotionChange = () => run();
  still.addEventListener("change", onMotionChange);

  return {
    setView({ x, y, width, height }) {
      const viewBox = [x, y, width, height].map((n) => n.toFixed(2)).join(" ");
      for (const root of roots) root.setAttribute("viewBox", viewBox);
      view = { x0: x, y0: y, x1: x + width, y1: y + height };
      cullParts();
      // Things that just came into view are placed now, even while motion is paused.
      placeAll();
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.clearInterval(dusk);
      window.clearTimeout(unpaint);
      still.removeEventListener("change", onMotionChange);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerdown", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// The figure comes from github.com/Atharvsinh-codez/-GoldenGate-Bridge-SF (Anatomy kit, framework-free SVG).
import { buildScene, fitCamera, HOME, MODEL } from "./golden-gate/scene.mjs";
import { reachableArea, SCENE_SIZE, type ViewBox } from "../src/components/pages/not-found/framing";

const SVG_OUT = "public/golden-gate/north-tower.svg";
const MODEL_OUT = "src/lib/generated/golden-gate.json";
// Halos and lamp glows blur a few units past their paths.
const MARGIN = 14;

type Element = { tag: string; head: string; children: Node[]; selfClosing: boolean };
type Node = Element | string;
type Matrix = [number, number, number, number, number, number];
type Box = [number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const EMPTY: Box = [Infinity, Infinity, -Infinity, -Infinity];

function parse(markup: string): Node[] {
  const root: Element = { tag: "#root", head: "", children: [], selfClosing: false };
  const stack = [root];
  let last = 0;
  for (const match of markup.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const top = stack[stack.length - 1];
    if (match.index > last) top.children.push(markup.slice(last, match.index));
    last = match.index + match[0].length;
    const [head, closing, tag, , selfClosing] = match;
    if (closing) {
      if (top.tag !== tag) throw new Error(`Unbalanced </${tag}> inside <${top.tag}>`);
      stack.pop();
      continue;
    }
    const element: Element = { tag, head, children: [], selfClosing: Boolean(selfClosing) };
    top.children.push(element);
    if (!element.selfClosing) stack.push(element);
  }
  if (stack.length !== 1) throw new Error(`Unclosed <${stack[stack.length - 1].tag}>`);
  if (last < markup.length) root.children.push(markup.slice(last));
  return root.children;
}

const serialize = (node: Node): string =>
  typeof node === "string" ? node : node.head + node.children.map(serialize).join("") + (node.selfClosing ? "" : `</${node.tag}>`);

const attr = (element: Element, name: string) => element.head.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

const multiply = ([a, b, c, d, e, f]: Matrix, [g, h, i, j, k, l]: Matrix): Matrix => [
  a * g + c * h, b * g + d * h, a * i + c * j, b * i + d * j, a * k + c * l + e, b * k + d * l + f,
];

function transformOf(element: Element): Matrix {
  const text = attr(element, "transform");
  if (!text) return IDENTITY;
  let matrix = IDENTITY;
  for (const [, name, args] of text.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = args.split(/[\s,]+/).filter(Boolean).map(Number);
    if (name === "matrix") matrix = multiply(matrix, n as Matrix);
    else if (name === "translate") matrix = multiply(matrix, [1, 0, 0, 1, n[0], n[1] ?? 0]);
    else if (name === "scale") matrix = multiply(matrix, [n[0], 0, 0, n[1] ?? n[0], 0, 0]);
    else throw new Error(`Unsupported transform ${name}`);
  }
  return matrix;
}

const apply = ([a, b, c, d, e, f]: Matrix, x: number, y: number) => [a * x + c * y + e, b * x + d * y + f];

function grow(box: Box, matrix: Matrix, x: number, y: number) {
  const [px, py] = apply(matrix, x, y);
  box[0] = Math.min(box[0], px);
  box[1] = Math.min(box[1], py);
  box[2] = Math.max(box[2], px);
  box[3] = Math.max(box[3], py);
}

function growBox(box: Box, matrix: Matrix, [x0, y0, x1, y1]: Box) {
  if (x0 > x1) return;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) grow(box, matrix, x, y);
}

/** Bounds in scene units. Paths in this figure use only absolute M, L and Z. */
function boundsOf(node: Node, parent: Matrix, defs: Map<string, Box>): Box {
  const box: Box = [...EMPTY];
  if (typeof node === "string") return box;
  const matrix = multiply(parent, transformOf(node));
  const d = attr(node, "d");
  if (d) {
    const n = d.match(/-?\d*\.?\d+(?:e-?\d+)?/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < n.length; i += 2) grow(box, matrix, n[i], n[i + 1]);
  }
  if (node.tag === "use") {
    const ref = defs.get((attr(node, "href") ?? "").slice(1));
    if (!ref) throw new Error(`Missing definition ${attr(node, "href")}`);
    growBox(box, matrix, ref);
  }
  if (node.tag === "text") growBox(box, matrix, [-120, -120, 120, 120]);
  for (const child of node.children) growBox(box, IDENTITY, boundsOf(child, matrix, defs));
  return box;
}

const touches = ([x0, y0, x1, y1]: Box, area: ViewBox) =>
  x0 <= area.x + area.width && x1 >= area.x && y0 <= area.y + area.height && y1 >= area.y;

// Groups the live script finds by attribute stay even when empty, so it can bind to them.
const STRUCTURAL = /\sdata-(layer|ship-slot|scene)\b/;
const MOVING = /\sdata-ship\b|<defs\b|<clipPath\b/;

function cull(node: Node, parent: Matrix, area: ViewBox, defs: Map<string, Box>): Node | null {
  if (typeof node === "string" || MOVING.test(node.head)) return node;
  const matrix = multiply(parent, transformOf(node));
  if (node.tag !== "g") return touches(boundsOf(node, parent, defs), area) ? node : null;
  const children = node.children.map((child) => cull(child, matrix, area, defs)).filter((child): child is Node => child !== null);
  if (!children.some((child) => typeof child !== "string") && !STRUCTURAL.test(node.head)) return null;
  return { ...node, children };
}

// Siblings with the same attributes paint the same colour in the same slot, so joining them
// changes nothing on screen. Only groups the live script never looks up may be joined.
const JOINABLE_GROUP = (head: string) => !/\s(id|transform|clip-path|data-(?!seamless)[\w-]+)\b/.test(head);
const withoutD = (head: string) => head.replace(/\sd="[^"]*"/, "");
const STROKED_ONLY = /class="[^"]*\b(iso-line|tb-ring)\b/;

/** Winds every closed outline the same way, so joined fills never cancel where they overlap. */
function sameWinding(d: string) {
  return d.replace(/M[^MZ]*Z/g, (outline) => {
    const points = outline.slice(1, -1).split("L").map((pair) => pair.trim());
    let area = 0;
    const xy = points.map((pair) => pair.split(/\s+/).map(Number));
    for (let i = 0; i < xy.length; i++) {
      const [x0, y0] = xy[i];
      const [x1, y1] = xy[(i + 1) % xy.length];
      area += x0 * y1 - x1 * y0;
    }
    return area < 0 ? `M${points.reverse().join("L")}Z` : outline;
  });
}

function joinSiblings(nodes: Node[]): Node[] {
  const out: Node[] = [];
  for (const node of nodes) {
    if (typeof node === "string" || MOVING.test(node.head)) {
      out.push(node);
      continue;
    }
    const prev = out[out.length - 1];
    if (node.tag === "g" && typeof prev !== "string" && prev?.tag === "g" && prev.head === node.head && JOINABLE_GROUP(node.head)) {
      prev.children.push(...node.children);
      continue;
    }
    if (node.tag === "path" && node.selfClosing && typeof prev !== "string" && prev?.tag === "path" && prev.selfClosing && withoutD(prev.head) === withoutD(node.head)) {
      const merged = attr(prev, "d")! + attr(node, "d")!;
      out[out.length - 1] = { ...prev, head: prev.head.replace(/\sd="[^"]*"/, ` d="${merged}"`) };
      continue;
    }
    out.push(node);
  }
  return out.map((node) => {
    if (typeof node === "string" || MOVING.test(node.head)) return node;
    if (node.tag === "g") return { ...node, children: joinSiblings(node.children) };
    if (node.tag === "path" && !STROKED_ONLY.test(node.head)) {
      const d = attr(node, "d");
      if (d) return { ...node, head: node.head.replace(/\sd="[^"]*"/, ` d="${sameWinding(d)}"`) };
    }
    return node;
  });
}

// Parts at most this many scene units across get their bounds written out; larger groups are split.
const TAG_SIZE = 80;

/**
 * Writes data-b="x0 y0 x1 y1" on static parts small enough to leave the screen whole, so the
 * page can hide everything outside the frame it shows and the browser never lays it out.
 */
function tagBounds(node: Node, parent: Matrix, defs: Map<string, Box>): Node {
  if (typeof node === "string" || MOVING.test(node.head)) return node;
  const matrix = multiply(parent, transformOf(node));
  const box = boundsOf(node, parent, defs);
  const small = box[2] - box[0] <= TAG_SIZE && box[3] - box[1] <= TAG_SIZE;
  if (node.tag !== "g" || (small && !STRUCTURAL.test(node.head))) {
    if (box[0] > box[2]) return node;
    const b = box.map((n) => Math.round(n * 10) / 10).join(" ");
    return { ...node, head: node.head.replace(/^<([\w:-]+)/, `<$1 data-b="${b}"`) };
  }
  return { ...node, children: node.children.map((child) => tagBounds(child, matrix, defs)) };
}

function main() {
  const P = fitCamera(HOME);
  const scene = buildScene(P);
  const [defsMarkup, ...layers] = scene.body;
  const fullBytes = scene.body.join("").length;

  const defsRoot = parse(defsMarkup)[0];
  if (typeof defsRoot === "string" || defsRoot.tag !== "defs") throw new Error("The scene must start with <defs>");
  const defBoxes = new Map<string, Box>();
  for (const child of defsRoot.children) {
    if (typeof child === "string") continue;
    const id = attr(child, "id");
    if (id) defBoxes.set(id, boundsOf(child, IDENTITY, defBoxes));
  }

  const area = reachableArea(MARGIN);
  const kept = layers.flatMap((layer) => parse(layer)).map((node) => cull(node, IDENTITY, area, defBoxes)).filter((node): node is Node => node !== null);
  const body = joinSiblings(kept).map((node) => serialize(tagBounds(node, IDENTITY, defBoxes))).join("");

  // Vehicles, boats and fog are placed by the live script, so their art always stays.
  const used = new Set([...body.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]));
  defsRoot.children = defsRoot.children.filter((child) => typeof child === "string" || !/^tree-/.test(attr(child, "id") ?? "") || used.has(attr(child, "id") ?? ""));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_SIZE.width} ${SCENE_SIZE.height}" aria-hidden="true" focusable="false"><g data-scene>${serialize(defsRoot)}${body}</g></svg>\n`;
  mkdirSync(dirname(join(process.cwd(), SVG_OUT)), { recursive: true });
  writeFileSync(join(process.cwd(), SVG_OUT), svg);

  const model = {
    projection: P,
    deckZ: MODEL.DECK_Z,
    tunnelX: MODEL.TUNNEL_X,
    mph: MODEL.MPH,
    laneY: MODEL.LANE_Y,
    vehicles: Object.fromEntries(Object.entries(MODEL.VEHICLES).map(([type, spec]) => [type, { length: spec.length }])),
    fog: MODEL.FOG,
  };
  writeFileSync(join(process.cwd(), MODEL_OUT), `${JSON.stringify(model, null, 2)}\n`);
  return { fullBytes, bytes: svg.length };
}

try {
  const { fullBytes, bytes } = main();
  console.log(`Generated the Golden Gate north tower scene: ${(bytes / 1024).toFixed(0)} KB of ${(fullBytes / 1024).toFixed(0)} KB kept.`);
} catch (error) {
  console.error("Golden Gate scene generation failed:", error);
  process.exitCode = 1;
}

/** The Anatomy kit's isometric camera, reduced to what the live scene needs. */
export type Projection = { origin: number[]; scale: number; azimuth: number; elevation: number };
export type WorldPoint = readonly [number, number, number];

const RADIANS = Math.PI / 180;
const UNIT = Math.sqrt(1.6);

function cameraOf({ scale, azimuth, elevation }: Projection) {
  const a = azimuth * RADIANS;
  const e = elevation * RADIANS;
  return { sinA: Math.sin(a), cosA: Math.cos(a), sinE: Math.sin(e), cosE: Math.cos(e), k: scale * UNIT };
}

export function iso([x, y, z]: WorldPoint, projection: Projection): [number, number] {
  const { sinA, cosA, sinE, cosE, k } = cameraOf(projection);
  const [ox, oy] = projection.origin;
  return [ox + (x * sinA - y * cosA) * k, oy + ((x * cosA + y * sinA) * sinE - z * cosE) * k];
}

export function depthOf([x, y, z]: WorldPoint, projection: Projection) {
  const { sinA, cosA, sinE, cosE } = cameraOf(projection);
  return (x * cosA + y * sinA) * cosE + z * sinE;
}

const tenth = (value: number) => {
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return text === "-0" ? "0" : text;
};

export function pathOf(points: readonly (readonly [number, number])[], closed = false) {
  if (!points.length) return "";
  return points.map(([x, y], at) => `${at ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("") + (closed ? "Z" : "");
}

const fine = (value: number) => Math.round(value * 100) / 100;

export function translateAlong(projection: Projection, by: WorldPoint) {
  const [x0, y0] = iso([0, 0, 0], projection);
  const [x1, y1] = iso(by, projection);
  return `translate(${fine(x1 - x0)} ${fine(y1 - y0)})`;
}

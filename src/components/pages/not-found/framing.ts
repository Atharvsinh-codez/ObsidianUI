/** Scene coordinates are the bridge figure's 1040 × 640 drawing at its home camera. */
export const SCENE_SIZE = { width: 1040, height: 640 } as const;

/** The north tower's near saddle, at the centre of the reference recording. */
export const FOCUS = { x: 353.5, y: 130 } as const;

/** Scene units across a 16:9 frame; the reference recording shows the tower at this zoom. */
const BASE_WIDTH = 263;
const MIN_WIDTH = 128;
const MAX_WIDTH = 330;
const MAX_STACKED_WIDTH = 290;
const MIN_ASPECT = 0.4;
const MAX_ASPECT = 3.2;
const BESIDE_ASPECT = 1.15;

export type ViewBox = { x: number; y: number; width: number; height: number };

/**
 * Copy sits beside the tower on wide screens and landscape phones, and below it otherwise.
 * The page stylesheet repeats this query, and the stage is never taller than the viewport,
 * so a stage in the beside layout always has an aspect of at least BESIDE_ASPECT.
 */
export const BESIDE_QUERY = "(min-width: 1024px) and (min-aspect-ratio: 23/20), (min-width: 640px) and (min-aspect-ratio: 3/2)";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function frameFor(width: number, height: number, beside: boolean): ViewBox {
  const aspect = clamp(width / Math.max(1, height), MIN_ASPECT, MAX_ASPECT);
  const viewWidth = clamp(BASE_WIDTH * Math.sqrt(aspect / (16 / 9)), MIN_WIDTH, beside ? MAX_WIDTH : MAX_STACKED_WIDTH);
  const viewHeight = viewWidth / aspect;
  // Beside: the tower sits left of centre so the copy has the dark water to the upper right.
  // Stacked: the tower stays high in the frame, clear of the copy at the bottom.
  const [fx, fy] = beside ? [0.36, 0.42] : [0.5, 0.26];
  return { x: FOCUS.x - viewWidth * fx, y: FOCUS.y - viewHeight * fy, width: viewWidth, height: viewHeight };
}

/** Every frame any screen can show, so the build can drop the parts no one will see. */
export function reachableArea(margin = 0): ViewBox {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let aspect = MIN_ASPECT; aspect <= MAX_ASPECT + 1e-9; aspect += 0.02) {
    for (const beside of aspect >= BESIDE_ASPECT ? [true, false] : [false]) {
      const frame = frameFor(aspect * 1000, 1000, beside);
      x0 = Math.min(x0, frame.x);
      y0 = Math.min(y0, frame.y);
      x1 = Math.max(x1, frame.x + frame.width);
      y1 = Math.max(y1, frame.y + frame.height);
    }
  }
  return { x: x0 - margin, y: y0 - margin, width: x1 - x0 + margin * 2, height: y1 - y0 + margin * 2 };
}

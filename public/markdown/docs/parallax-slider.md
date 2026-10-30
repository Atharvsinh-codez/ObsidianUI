# ObsidianUI — Parallax Slider

[Canonical page](https://www.obsidianui.dev/docs/parallax-slider) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An endless strip of image frames. Drag it, scroll over it, or focus it and use the arrow keys. The strip glides to a stop, and each image drifts against the motion inside its frame, so the gallery feels deep. A slide's title appears below it on hover once the strip is still. It follows your light or dark theme.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/parallax-slider)

```tsx
import { ParallaxSlider } from '@/components/block/parallax-slider'

// Portrait 9:16 frames
export function Demo() {
return <ParallaxSlider />
}

// Full image 16:9 frames
export function FullImageDemo() {
return <ParallaxSlider orientation="landscape" />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/parallax-slider.json"
```

## Usage

```tsx
import { ParallaxSlider } from '@/components/block/parallax-slider'

<ParallaxSlider
  label="Projects"
  slides={[
    { title: 'Missing Piece', image: '/images/missing-piece.webp', href: '/work/missing-piece' },
    { title: 'Opening Move', image: '/images/opening-move.webp', href: '/work/opening-move', focus: '34% 60%' },
  ]}
/>
```

Without `slides`, the slider shows five demo images hosted by ObsidianUI. Replace them with your own images before you ship.

Add a heading above the strip with `eyebrow`, `title`, and `description`. All three are optional, and the slider shows no heading when you leave them out.

## Portrait and full image

The slider has two frame shapes. Switch between them in the preview above.

- `orientation="portrait"` is the default. Frames are tall 9:16 cards, and a wide image fills the frame's height, so most of its width sits outside the frame. That hidden width is what the parallax reveals as the strip moves.
- `orientation="landscape"` uses wide 16:9 frames that show most of the image. The image is scaled up by `zoom`, 1.3 by default, so it still has a little room to drift. Set `zoom={1}` to show a 16:9 image whole; it then stays still.

```tsx
<ParallaxSlider orientation="landscape" />
```

Images keep their own aspect ratio and are never stretched. Use `focus` to choose which part of an image stays in view. It takes two percentages like CSS `object-position`: `34% 60%` keeps a subject left of center and a little below the middle. In portrait frames, the first value does most of the work.

Add `href` to make a slide a link. A drag never opens a link, so visitors can drag across slides freely.

## Wheel and keyboard

The mouse wheel and trackpad move the slider while the pointer is over it. Set `scrollOnWheel={false}` if the slider sits in a long page and should never hold the page scroll.

The strip is one tab stop. The left and right arrow keys move it one slide at a time, and tabbing to a slide link brings that slide to the center. With reduced motion turned on, the strip moves without gliding and the images stay still.

## Light and dark themes

The slider has no background of its own and takes its text color from the page, so it matches light and dark themes without extra setup. Captions, the heading, and empty frames are tinted from that text color.

## Customize the look

Override the CSS variables on the component or any parent. This example gives the slider a dark band of its own and larger frames:

```css
.obsidian-parallax-slider {
  --obsidian-parallax-background: #080808;
  --obsidian-parallax-foreground: #f2f2f2;
  --obsidian-parallax-slide-width: 320px;
  --obsidian-parallax-slide-height: 569px;
  --obsidian-parallax-gap: 32px;
  --obsidian-parallax-radius: 0px;
  --obsidian-parallax-fade: 0px;
}
```

`--obsidian-parallax-radius` rounds the frame corners and `--obsidian-parallax-fade` sets how far the edges fade out. Without overrides, portrait slides are 270 by 480 pixels and full image slides are 360 by 225. When the slider is narrower than 720px, they shrink to 200 by 356 and 260 by 163, and the heading stacks. A size, gap, or fade you set yourself applies at every width.

## Install manually — complete source

Download the complete manifest: [parallax-slider.json](https://www.obsidianui.dev/r/parallax-slider.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx lucide-react tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

Default demo media loads from ObsidianUI. Replace these URLs with your own assets for offline use.

### components/block/parallax-slider.css

Installation target: `@components/block/parallax-slider.css`

```css
/* Colors derive from the inherited text color, so the slider matches light and dark themes
   without theme selectors. Set --obsidian-parallax-foreground to pin a text color. */
.obsidian-parallax-slider {
  --obsidian-parallax-muted: color-mix(in oklab, currentColor 55%, transparent);
  --obsidian-parallax-caption: color-mix(in oklab, currentColor 72%, transparent);
  --obsidian-parallax-frame: color-mix(in oklab, currentColor 6%, transparent);
  /* Sizes come from the orientation and the container width. The public variables are left
     unset so a value set on the root wins over all of them. */
  --obsidian-parallax-default-width: 270px;
  --obsidian-parallax-default-height: 480px;
  --obsidian-parallax-default-gap: 20px;
  --obsidian-parallax-default-fade: 4rem;
  --obsidian-parallax-space: clamp(2.5rem, 7cqi, 6rem);
  --obsidian-parallax-mono: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  container-type: inline-size;
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--obsidian-parallax-background, transparent);
  /* Unset by default, which leaves color inherited from the page. */
  color: var(--obsidian-parallax-foreground);
}

.obsidian-parallax-slider[data-orientation="landscape"] {
  --obsidian-parallax-default-width: 360px;
  --obsidian-parallax-default-height: 225px;
}

/* The bottom space is shorter because the captions already sit below the slides. */
.obsidian-parallax-slider__inner {
  padding-block: var(--obsidian-parallax-space) calc(var(--obsidian-parallax-space) - 1.5rem);
}

.obsidian-parallax-slider__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding: 0 2.5rem 4rem;
}

.obsidian-parallax-slider__eyebrow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1.5rem;
  font-family: var(--obsidian-parallax-mono);
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--obsidian-parallax-muted);
}

.obsidian-parallax-slider__eyebrow::before {
  content: "";
  display: block;
  width: 1.5rem;
  height: 1px;
  background: currentColor;
}

.obsidian-parallax-slider__title {
  margin: 0;
  font-size: clamp(2.5rem, 6cqi, 5.5rem);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 0.95;
  color: inherit;
}

.obsidian-parallax-slider__description {
  max-width: 280px;
  margin: 0;
  font-family: var(--obsidian-parallax-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  line-height: 1.7;
  text-align: right;
  text-transform: uppercase;
  color: var(--obsidian-parallax-muted);
}

.obsidian-parallax-slider__viewport {
  --obsidian-parallax-width: var(--obsidian-parallax-slide-width, var(--obsidian-parallax-default-width));
  --obsidian-parallax-height: var(--obsidian-parallax-slide-height, var(--obsidian-parallax-default-height));
  --obsidian-parallax-spacing: var(--obsidian-parallax-gap, var(--obsidian-parallax-default-gap));
  --obsidian-parallax-edge: var(--obsidian-parallax-fade, var(--obsidian-parallax-default-fade));
  position: relative;
  height: calc(var(--obsidian-parallax-height) + 3rem);
  overflow: hidden;
  overflow: clip;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 var(--obsidian-parallax-edge), #000 calc(100% - var(--obsidian-parallax-edge)), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 var(--obsidian-parallax-edge), #000 calc(100% - var(--obsidian-parallax-edge)), transparent);
}

.obsidian-parallax-slider[data-dragging="true"] .obsidian-parallax-slider__viewport {
  cursor: grabbing;
}

.obsidian-parallax-slider__viewport:focus-visible {
  -webkit-mask-image: none;
  mask-image: none;
  box-shadow: inset 0 0 0 2px var(--obsidian-parallax-caption);
}

.obsidian-parallax-slider__track {
  display: flex;
  width: max-content;
  height: 100%;
  gap: var(--obsidian-parallax-spacing);
  padding-inline-start: calc(var(--obsidian-parallax-spacing) / 2);
  will-change: transform;
}

.obsidian-parallax-slider__slide {
  position: relative;
  flex: none;
  width: var(--obsidian-parallax-width);
  height: var(--obsidian-parallax-height);
}

.obsidian-parallax-slider__link {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
  outline: none;
}

.obsidian-parallax-slider__frame {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--obsidian-parallax-radius, 10px);
  background: var(--obsidian-parallax-frame);
}

.obsidian-parallax-slider__link:focus-visible .obsidian-parallax-slider__frame {
  box-shadow: inset 0 0 0 2px currentColor;
}

/* The script sizes and places each image from its natural size. Until it loads, the image
   simply covers the frame. */
.obsidian-parallax-slider__image {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  will-change: transform;
}

.obsidian-parallax-slider__caption {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-family: var(--obsidian-parallax-mono);
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: uppercase;
  color: var(--obsidian-parallax-caption);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.obsidian-parallax-slider__caption svg {
  flex: none;
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.obsidian-parallax-slider__slide:hover .obsidian-parallax-slider__caption,
.obsidian-parallax-slider__link:focus-visible .obsidian-parallax-slider__caption {
  opacity: 1;
}

/* Touch screens have no hover, so captions stay up whenever the strip is still. */
@media (hover: none) {
  .obsidian-parallax-slider__caption {
    opacity: 1;
  }
}

.obsidian-parallax-slider[data-moving="true"] .obsidian-parallax-slider__caption {
  opacity: 0;
}

@container (max-width: 720px) {
  .obsidian-parallax-slider__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 0 1.25rem 2.5rem;
  }

  .obsidian-parallax-slider__description {
    text-align: left;
  }

  .obsidian-parallax-slider__viewport {
    --obsidian-parallax-default-width: 200px;
    --obsidian-parallax-default-height: 356px;
    --obsidian-parallax-default-gap: 14px;
    --obsidian-parallax-default-fade: 1.5rem;
  }

  .obsidian-parallax-slider[data-orientation="landscape"] .obsidian-parallax-slider__viewport {
    --obsidian-parallax-default-width: 260px;
    --obsidian-parallax-default-height: 163px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-parallax-slider__caption {
    transition: none;
  }
}
```

### components/block/parallax-slider.tsx

Installation target: `@components/block/parallax-slider.tsx`

```tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./parallax-slider.css";

export interface ParallaxSlide {
  title: string;
  image: string;
  alt?: string;
  href?: string;
  /** Part of the image to keep in view, as `x% y%` like `object-position`. Defaults to the center. */
  focus?: string;
}

export type ParallaxSliderOrientation = "portrait" | "landscape";

export interface ParallaxSliderProps {
  slides?: ParallaxSlide[];
  /** Tall 9:16 frames, or wide 16:9 frames that show most of the image. */
  orientation?: ParallaxSliderOrientation;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** How far each image drifts against the drag, relative to its distance from the center. */
  parallax?: number;
  /** Extra scale on top of filling the frame; adds room to drift. Defaults to 1 for portrait and 1.3 for landscape. */
  zoom?: number;
  /** Let the mouse wheel and trackpad move the slider instead of the page. */
  scrollOnWheel?: boolean;
  label?: string;
  className?: string;
}

export const defaultParallaxSlides: ParallaxSlide[] = [
  { title: "Missing Piece", image: "https://www.obsidianui.dev/effects/parallax-slider/missing-piece.webp", alt: "A hand placing the last puzzle piece into its gap", focus: "50% 75%" },
  { title: "Enter", image: "https://www.obsidianui.dev/effects/parallax-slider/enter.webp", alt: "A finger pressing the Enter key", focus: "66% 75%" },
  { title: "Opening Move", image: "https://www.obsidianui.dev/effects/parallax-slider/opening-move.webp", alt: "Two hands moving a king and a pawn across a chessboard", focus: "34% 60%" },
  { title: "Hand Off", image: "https://www.obsidianui.dev/effects/parallax-slider/hand-off.webp", alt: "One hand passing a glowing sphere to another", focus: "50% 50%" },
  { title: "Fine Tune", image: "https://www.obsidianui.dev/effects/parallax-slider/fine-tune.webp", alt: "A hand turning a large control dial", focus: "55% 70%" },
];

const LERP = 0.05;
const WHEEL_SPEED = 1.75;
const MAX_WHEEL_STEP = 150;
const MOUSE_DRAG = 2;
const TOUCH_DRAG = 1.5;
const DRAG_THRESHOLD = 5;
const SETTLE_MS = 200;
// Copies sit before the readable copy, so the track can wrap without a visible jump.
const LEAD_COPIES = 2;
const MIN_COPIES = 6;

function parseFocus(focus: string | undefined): [number, number] {
  const [x, y = x] = (focus ?? "").trim().split(/\s+/).map((part) => parseFloat(part) / 100);
  const clamp = (value: number | undefined) => (value === undefined || Number.isNaN(value) ? 0.5 : Math.min(1, Math.max(0, value)));
  return [clamp(x), clamp(y)];
}

export function ParallaxSlider({
  slides = defaultParallaxSlides,
  orientation = "portrait",
  eyebrow,
  title,
  description,
  parallax = 0.2,
  zoom,
  scrollOnWheel = true,
  label = "Gallery",
  className,
}: ParallaxSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<number | null>(null);
  const [copies, setCopies] = useState(MIN_COPIES);
  const count = slides.length;
  const hasHeader = Boolean(eyebrow || title || description);
  const scale = Math.max(1, zoom ?? (orientation === "landscape" ? 1.3 : 1));

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track || count === 0) return;

    const slideElements = Array.from(track.children) as HTMLElement[];
    const images = slideElements.map((slide) => slide.querySelector<HTMLImageElement>("img[data-parallax-image]"));
    // How far each image can shift before its edge shows inside the frame.
    const room = images.map(() => ({ left: 0, right: 0 }));
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = {
      current: 0, target: 0, width: 0, slideWidth: 0, slideHeight: 0, offset: 0, pitch: 0, sequence: 0,
      lastInput: 0, moving: false, frame: 0, pointer: null as number | null, pointerX: 0,
      dragDistance: 0, dragged: false, reduce: motionQuery.matches,
    };
    let releaseTimer = 0;

    const setMoving = (moving: boolean) => {
      if (moving === state.moving) return;
      state.moving = moving;
      root.dataset.moving = String(moving);
    };

    const wrap = () => {
      if (!state.sequence) return;
      while (state.current > -state.sequence) { state.current -= state.sequence; state.target -= state.sequence; }
      while (state.current < -state.sequence * 4) { state.current += state.sequence; state.target += state.sequence; }
    };

    const paintImage = (index: number) => {
      const image = images[index];
      if (!image) return;
      const distance = state.current + state.offset + index * state.pitch + state.slideWidth / 2 - state.width / 2;
      if (Math.abs(distance) > state.width / 2 + state.slideWidth + 500) return;
      const drift = state.reduce ? 0 : distance * -parallax;
      const shift = Math.max(-room[index].right, Math.min(room[index].left, drift));
      image.style.transform = `translate3d(${shift}px, 0, 0)`;
    };

    const paint = () => {
      track.style.transform = `translate3d(${state.current}px, 0, 0)`;
      for (let index = 0; index < images.length; index++) paintImage(index);
    };

    // Sizes the image to cover its frame at its natural ratio, so the part outside the frame
    // is what the parallax reveals.
    const fit = (index: number) => {
      const image = images[index];
      if (!image?.naturalWidth || !state.slideWidth || !state.slideHeight) return;
      const frameWidth = state.slideWidth;
      const frameHeight = state.slideHeight;
      const ratio = image.naturalWidth / image.naturalHeight;
      const width = Math.max(frameWidth, frameHeight * ratio) * scale;
      const height = Math.max(frameHeight, frameWidth / ratio) * scale;
      const [focusX, focusY] = parseFocus(image.dataset.focus);
      Object.assign(image.style, {
        width: `${width}px`, height: `${height}px`,
        left: `${(frameWidth - width) * focusX}px`, top: `${(frameHeight - height) * focusY}px`,
      });
      room[index] = { left: (width - frameWidth) * focusX, right: (width - frameWidth) * (1 - focusX) };
      paintImage(index);
    };

    const step = () => {
      state.frame = 0;
      const delta = (state.target - state.current) * (state.reduce ? 1 : LERP);
      state.current = Math.abs(state.target - state.current - delta) < 0.05 ? state.target : state.current + delta;
      wrap();
      const recent = performance.now() - state.lastInput < SETTLE_MS;
      setMoving(state.dragged || Math.abs(delta) >= 0.1 || recent);
      paint();
      if (state.current !== state.target || recent || state.dragged || state.pointer !== null) {
        state.frame = requestAnimationFrame(step);
      } else {
        setMoving(false);
      }
    };

    const tick = () => {
      if (!state.frame) state.frame = requestAnimationFrame(step);
    };

    const nudge = (amount: number) => {
      state.target += amount;
      state.lastInput = performance.now();
      tick();
    };

    const measure = () => {
      const previousPitch = state.pitch;
      state.width = viewport.clientWidth;
      state.slideWidth = slideElements[0].offsetWidth;
      state.slideHeight = slideElements[0].offsetHeight;
      state.offset = slideElements[0].offsetLeft;
      state.pitch = slideElements.length > 1 ? slideElements[1].offsetLeft - slideElements[0].offsetLeft : state.slideWidth;
      state.sequence = state.pitch * count;
      if (!state.sequence) return;

      if (previousPitch) {
        state.current *= state.pitch / previousPitch;
        state.target *= state.pitch / previousPitch;
      } else {
        const start = positionRef.current ?? -count * LEAD_COPIES;
        state.current = state.target = start * state.pitch;
      }
      // The track must still cover the viewport at the far end of the wrap range.
      const needed = Math.max(MIN_COPIES, 5 + Math.ceil(state.width / state.sequence));
      if (needed > copies) setCopies(needed);
      wrap();
      paint();
      images.forEach((_, index) => fit(index));
    };

    const onImageLoad = (event: Event) => {
      const index = images.indexOf(event.currentTarget as HTMLImageElement);
      if (index >= 0) fit(index);
    };

    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? state.width : 1;
      const delta = (horizontal ? event.deltaX : event.deltaY) * unit;
      if (!delta) return;
      event.preventDefault();
      nudge(-Math.max(-MAX_WHEEL_STEP, Math.min(MAX_WHEEL_STEP, delta * WHEEL_SPEED)));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || state.pointer !== null) return;
      window.clearTimeout(releaseTimer);
      state.pointer = event.pointerId;
      state.pointerX = event.clientX;
      state.dragDistance = 0;
      state.dragged = false;
      state.lastInput = performance.now();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== state.pointer) return;
      const delta = (event.clientX - state.pointerX) * (event.pointerType === "mouse" ? MOUSE_DRAG : TOUCH_DRAG);
      state.pointerX = event.clientX;
      state.dragDistance += Math.abs(delta);
      if (!state.dragged && state.dragDistance > DRAG_THRESHOLD) {
        state.dragged = true;
        root.dataset.dragging = "true";
      }
      nudge(delta);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== state.pointer) return;
      state.pointer = null;
      root.dataset.dragging = "false";
      if (!state.dragged) return;
      // Keeps the click that ends a drag from opening a slide link.
      releaseTimer = window.setTimeout(() => {
        state.dragged = false;
        tick();
      }, 100);
    };

    const onClick = (event: MouseEvent) => {
      if (!state.dragged) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      nudge(event.key === "ArrowLeft" ? state.pitch : -state.pitch);
    };

    const onFocusIn = (event: FocusEvent) => {
      viewport.scrollLeft = 0;
      const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-parallax-slide]");
      const index = slide ? slideElements.indexOf(slide) : -1;
      if (index < 0) return;
      state.target = state.width / 2 - (state.offset + index * state.pitch + state.slideWidth / 2);
      state.lastInput = performance.now();
      tick();
    };

    const onMotionChange = () => {
      state.reduce = motionQuery.matches;
      paint();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    images.forEach((image) => image?.addEventListener("load", onImageLoad));
    if (scrollOnWheel) viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("click", onClick, true);
    viewport.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("focusin", onFocusIn);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      if (state.pitch) positionRef.current = state.current / state.pitch;
      cancelAnimationFrame(state.frame);
      window.clearTimeout(releaseTimer);
      resizeObserver.disconnect();
      images.forEach((image) => image?.removeEventListener("load", onImageLoad));
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("click", onClick, true);
      viewport.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [count, copies, parallax, scale, orientation, scrollOnWheel]);

  return (
    <section
      ref={rootRef}
      className={cn("obsidian-parallax-slider", className)}
      aria-label={hasHeader ? undefined : label}
      data-orientation={orientation}
      data-moving="false"
    >
      <div className="obsidian-parallax-slider__inner">
        {hasHeader && (
          <div className="obsidian-parallax-slider__header">
            <div>
              {eyebrow && <p className="obsidian-parallax-slider__eyebrow">{eyebrow}</p>}
              {title && <h2 className="obsidian-parallax-slider__title">{title}</h2>}
            </div>
            {description && <p className="obsidian-parallax-slider__description">{description}</p>}
          </div>
        )}
        <div
          ref={viewportRef}
          className="obsidian-parallax-slider__viewport"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${label}. Drag, scroll, or use the arrow keys to browse.`}
          tabIndex={0}
        >
          <div ref={trackRef} className="obsidian-parallax-slider__track">
            {Array.from({ length: copies }, (_, copy) => slides.map((slide, index) => {
              const readable = copy === LEAD_COPIES;
              const content = (
                <>
                  <span className="obsidian-parallax-slider__frame">
                    {/* eslint-disable-next-line @next/next/no-img-element -- frames are transformed every frame; next/image adds nothing here */}
                    <img
                      data-parallax-image=""
                      data-focus={slide.focus}
                      className="obsidian-parallax-slider__image"
                      src={slide.image}
                      alt={readable ? slide.alt ?? slide.title : ""}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: slide.focus }}
                    />
                  </span>
                  <span className="obsidian-parallax-slider__caption">
                    <span>{slide.title}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </>
              );
              return (
                <div
                  key={`${copy}-${index}`}
                  data-parallax-slide=""
                  className="obsidian-parallax-slider__slide"
                  role={readable ? "group" : undefined}
                  aria-roledescription={readable ? "slide" : undefined}
                  aria-label={readable ? `${index + 1} of ${count}: ${slide.title}` : undefined}
                  aria-hidden={readable ? undefined : true}
                >
                  {slide.href ? (
                    <a className="obsidian-parallax-slider__link" href={slide.href} draggable={false} tabIndex={readable ? undefined : -1}>
                      {content}
                    </a>
                  ) : content}
                </div>
              );
            }))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParallaxSlider;
```

### lib/utils.ts

Installation target: `@lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| slides | ParallaxSlide[] | Five demo images | Slides in order. Each needs a title and image; alt, href, and focus are optional. |
| orientation | 'portrait' \| 'landscape' | 'portrait' | Tall 9:16 frames, or wide 16:9 frames that show most of the image. |
| eyebrow | ReactNode | - | Small label above the title. |
| title | ReactNode | - | Heading shown above the strip. |
| description | ReactNode | - | Short note beside the heading. |
| parallax | number | 0.2 | How far images drift against the motion. Use 0 to turn the drift off. |
| zoom | number | 1 portrait, 1.3 landscape | Extra scale on top of filling the frame. The drift stops at the image edge, so higher values drift further but crop more. Values below 1 count as 1. |
| scrollOnWheel | boolean | true | Lets the mouse wheel and trackpad move the slider. |
| label | string | Gallery | Accessible name for the slider. |
| className | string | - | Additional classes for the root element. |

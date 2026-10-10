"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion, useTransform, useVelocity } from "motion/react";
import styles from "./number-animation.module.css";

/**
 * Text and numbers that spin into their new value like slot machine reels. Every character is a reel; digits count through
 * the wheel in the direction the number moved, letters shuffle through the alphabet, and reels stop one after another from
 * left to right with a soft, overshoot-free landing. Use it for prices, stats, and launch moments where a change deserves a beat.
 */
export interface NumberAnimationProps {
  /** The value to show. Numbers pass through format; strings render as they are. */
  value: string | number;
  /** Formats a number value. Defaults to en-US grouping, so 12480 reads 12,480. */
  format?: (value: number) => string;
  /** Seconds the first reel spins. Later reels add stagger. */
  duration?: number;
  /** Seconds between reels stopping, left to right. */
  stagger?: number;
  /** Extra full turns a digit makes before it lands. 0 rolls straight to the new digit. */
  spins?: number;
  /** Which end reels are matched from when the length changes. Numbers default to end, so 999 to 1,000 grows on the left. */
  align?: "start" | "end";
  /** Announce new values politely to screen readers. */
  announce?: boolean;
  className?: string;
  style?: CSSProperties;
}

const DIGITS = "0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = LOWER.toUpperCase();
/** Fast out, long soft landing, never past the target. */
const LANDING = [.12, .8, .16, 1] as const;
const subscribe = () => () => {};
/** Cell pitch in em. Keep in sync with .cell in the stylesheet. */
const CELL = 1.6;

function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

const classOf = (char: string) => DIGITS.includes(char) ? DIGITS : LOWER.includes(char) ? LOWER : UPPER.includes(char) ? UPPER : null;

/** Deterministic shuffle so the same change always spins the same letters. */
function seeded(seed: number) {
  let state = seed >>> 0 || 1;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

/** The reel's cells, from what is visible now to the target. */
function buildStrip(from: string, to: string, spins: number, rising: boolean, seed: number) {
  if (from === to) return [to];
  const set = classOf(to);
  if (!set) return [from, to];
  if (set === DIGITS && classOf(from) === DIGITS) {
    const a = Number(from), b = Number(to);
    const steps = spins * 10 + (rising ? (b - a + 10) % 10 : (a - b + 10) % 10);
    return Array.from({ length: steps + 1 }, (_, i) => String((a + (rising ? i : -i) + 100) % 10));
  }
  const random = seeded(seed);
  const fillers = Array.from({ length: Math.max(2, spins * 5 + 2) }, () => set[Math.floor(random() * set.length)]);
  return [from, ...fillers, to];
}

interface ReelProps {
  char: string;
  order: number;
  entering: boolean;
  rising: boolean;
  duration: number;
  stagger: number;
  spins: number;
  reduced: boolean;
}

function Reel({ char, order, entering, rising, duration, stagger, spins, reduced }: ReelProps) {
  const pos = useMotionValue(0);
  const width = useMotionValue<number | "auto">("auto");
  const sizer = useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const [reel, setReel] = useState(() => ({
    char,
    strip: entering && !reduced ? buildStrip("", char, spins, rising, char.charCodeAt(0) + order) : [char],
    from: 0,
    grow: entering,
    time: duration + order * stagger,
  }));

  // A new target restarts the reel from the cell that is on screen right now, keeping its sub-cell offset, so nothing jumps.
  if (reel.char !== char) {
    const current = pos.get();
    const index = Math.max(0, Math.min(reel.strip.length - 1, Math.round(current)));
    const visible = reel.strip[index]!;
    setReel({
      char,
      strip: reduced ? [char] : buildStrip(visible, char, spins, rising, char.charCodeAt(0) * 31 + visible.charCodeAt(0) * 7 + order + reel.strip.length),
      from: reduced ? 0 : current - index,
      grow: false,
      time: duration + order * stagger,
    });
  }

  const blur = useTransform(useVelocity(pos), velocity => {
    const amount = Math.min(Math.abs(velocity) * .05, 2.4);
    return amount < .15 ? "none" : `blur(${amount.toFixed(2)}px)`;
  });
  // Cells are taller than the line, so the neighbours of a landed glyph sit fully outside the window.
  const y = useTransform(pos, value => `translate3d(0, ${(-value * CELL).toFixed(4)}em, 0)`);

  useLayoutEffect(() => {
    const measured = sizer.current?.getBoundingClientRect().width ?? 0;
    const last = reel.strip.length - 1;
    if (reduced) {
      pos.jump(last);
      width.jump(measured);
      return;
    }
    pos.jump(reel.from);
    const spin = animate(pos, last, { duration: last === 0 ? .2 : reel.time, ease: [...LANDING] });
    if (reel.grow) width.jump(0);
    if (width.get() === "auto") { width.jump(measured); return () => spin.stop(); }
    const size = animate(width, measured, { type: "spring", visualDuration: Math.min(reel.time, .6), bounce: 0 });
    return () => { spin.stop(); size.stop(); };
  }, [reel, pos, width, reduced]);

  useLayoutEffect(() => {
    if (isPresent) return;
    if (reduced) { safeToRemove(); return; }
    const exit = animate(width, 0, { type: "spring", visualDuration: .35, bounce: 0, onComplete: safeToRemove });
    return () => exit.stop();
  }, [isPresent, safeToRemove, width, reduced]);

  return <motion.span className={styles.slot} style={{ width }} data-exiting={isPresent ? undefined : ""}>
    <span ref={sizer} className={styles.sizer}>{char === " " ? "\u00a0" : char}</span>
    <span className={styles.window}>
      <motion.span className={styles.strip} style={{ transform: y, filter: blur }}>
        {reel.strip.map((cell, i) => <span key={i} className={styles.cell}>{cell === " " ? "\u00a0" : cell}</span>)}
      </motion.span>
    </span>
  </motion.span>;
}

export function NumberAnimation({ value, format, duration = .9, stagger = .07, spins = 1, align, announce = false, className, style }: NumberAnimationProps) {
  const reduced = useReducedFlag();
  const text = typeof value === "number" ? (format ? format(value) : value.toLocaleString("en-US")) : value;
  const fromEnd = (align ?? (typeof value === "number" ? "end" : "start")) === "end";
  const chars = Array.from(text);
  // A leading run of symbols (a currency sign, a plus) is keyed from the start and never spins into a digit; the rest is
  // keyed from the aligned end, so separators and suffixes stay on their own reels when the number grows.
  const lead = fromEnd ? chars.findIndex(char => /[\p{L}\p{N}]/u.test(char)) : 0;
  const prefix = lead < 0 ? chars.length : lead;
  const keyOf = (i: number) => i < prefix ? `p${i}` : fromEnd ? `e${chars.length - 1 - i}` : `s${i}`;
  const [initialKeys] = useState(() => new Set(chars.map((_, i) => keyOf(i))));
  const [trend, setTrend] = useState({ value, rising: true });
  if (trend.value !== value) {
    setTrend({ value, rising: typeof value === "number" && typeof trend.value === "number" ? value >= trend.value : true });
  }

  return <span className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
    <span className={styles.srOnly} aria-live={announce ? "polite" : undefined}>{text}</span>
    <span className={styles.reels} aria-hidden="true">
      <AnimatePresence initial={false}>
        {chars.map((char, i) => <Reel
          key={keyOf(i)}
          char={char}
          order={i}
          entering={!initialKeys.has(keyOf(i))}
          rising={trend.rising}
          duration={duration}
          stagger={stagger}
          spins={spins}
          reduced={reduced}
        />)}
      </AnimatePresence>
    </span>
  </span>;
}

export default NumberAnimation;

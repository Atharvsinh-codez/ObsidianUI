"use client";

import { useEffect, useId, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import type { AnalyticsPrStatus, AnalyticsPullRequest } from "./data";
import { DraftIcon, MergeIcon, PullRequestIcon } from "./icons";
import { NumberAnimation } from "./number-animation";

/** "3.4h" → "0.0h", "+12%" → "+0%": the resting shape the reels roll up from. */
const zeroed = (text: string) => text.replace(/\d+/g, "0");

/**
 * Slot-machine number. It first renders zeros, then rolls up to the real value
 * after `delay` ms so the roll lands once its card has faded in. Later changes
 * spin straight from whatever is on screen.
 */
export function Digits({
  value,
  delay = 0,
  className,
  format,
}: {
  value: string | number;
  delay?: number;
  className?: string;
  format?: (value: number) => string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : delay;
    const t = window.setTimeout(() => setReady(true), wait);
    return () => window.clearTimeout(t);
  }, [delay]);
  const shown = ready ? value : typeof value === "number" ? 0 : zeroed(value);
  return <NumberAnimation value={shown} format={format} align="end" className={cn("slot-num", className)} />;
}

type SegOption<T extends string> = { id: T; label: ReactNode };

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly SegOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].id);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons[next]?.focus();
  }

  return (
    <div
      className={cn("seg", className)}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={{ "--n": options.length, "--idx": index } as CSSProperties}
    >
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o) => {
        const checked = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="seg-btn"
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Sparkline({
  data,
  tone = "good",
  width = 132,
  height = 34,
}: {
  data: number[];
  tone?: "good" | "bad";
  width?: number;
  height?: number;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - 3 - ((v - min) / (max - min || 1)) * (height - 8),
  ]);
  // Quadratic smoothing through segment midpoints keeps the line soft without overshoot.
  let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    line += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  line += ` T ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg className="spark" data-tone={tone} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="spark-area" d={area} fill={`url(#g${id})`} />
      <path className="spark-line" d={line} pathLength={1} fill="none" stroke="currentColor" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
      <circle className="spark-dot" cx={last[0]} cy={last[1]} r={2.6} fill="currentColor" />
    </svg>
  );
}

export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch-thumb" />
    </button>
  );
}

const STATUS_TEXT: Record<AnalyticsPrStatus["kind"], string> = { merged: "Merged", review: "In review", open: "Open" };
const STATUS_ICON = { merged: MergeIcon, review: DraftIcon, open: PullRequestIcon } as const;

export function StatusPill({ status }: { status: AnalyticsPrStatus }) {
  const Icon = STATUS_ICON[status.kind];
  return (
    <span className="pill" data-kind={status.kind}>
      <Icon size={13} strokeWidth={2} />
      {STATUS_TEXT[status.kind]}
    </span>
  );
}

export function StatusIcon({ status, size = 15 }: { status: AnalyticsPrStatus; size?: number }) {
  const Icon = STATUS_ICON[status.kind];
  return (
    <span className="status-dot" data-kind={status.kind}>
      <Icon size={size} strokeWidth={1.9} />
    </span>
  );
}

export function Avatar({ src, size, className }: { src?: string; size: 22 | 32 | 40; className?: string }) {
  if (!src) return <span className={cn("avatar avatar-empty", `avatar-${size}`, className)} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element -- plain img keeps the block framework-agnostic
  return <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className={cn("avatar", `avatar-${size}`, className)} />;
}

export function PersonAvatar({ handle, size }: { handle: string; size: 22 | 32 | 40 }) {
  const { person } = useDashboard();
  return <Avatar src={person(handle)?.avatar} size={size} />;
}

export function formatCount(n: number) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
}

export function PrRow({
  pr,
  selected,
  onOpen,
  style,
}: {
  pr: AnalyticsPullRequest;
  selected: boolean;
  onOpen: (n: number) => void;
  style?: CSSProperties;
}) {
  return (
    <li className="pr-row" style={style}>
      <PersonAvatar handle={pr.author} size={40} />
      <div className="pr-text">
        <p className="pr-title">{pr.title}</p>
        <p className="pr-sub">PR opened by {pr.author}</p>
      </div>
      <StatusPill status={pr.status} />
      <button
        type="button"
        className="btn-details press"
        aria-pressed={selected}
        aria-label={`Details for PR #${pr.number}`}
        onClick={() => onOpen(pr.number)}
      >
        Details
      </button>
    </li>
  );
}

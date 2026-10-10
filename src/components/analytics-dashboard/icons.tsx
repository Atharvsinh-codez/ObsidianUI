import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PanelIcon = ({
  side = "left",
  open = false,
  ...p
}: IconProps & { side?: "left" | "right"; open?: boolean }) => (
  <Base {...p}>
    <rect width="18" height="18" x="3" y="3" rx="3" />
    <path d={side === "left" ? "M9 3v18" : "M15 3v18"} />
    <rect
      className="panel-icon-fill"
      data-open={open}
      x={side === "left" ? 4 : 16}
      y="4"
      width="4"
      height="16"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
  </Base>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.2a2 2 0 0 1 .72-1.54l6-5.1a2 2 0 0 1 2.56 0l6 5.1A2 2 0 0 1 20 10.2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  </Base>
);

export const LayersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </Base>
);

export const CodeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7.5 3.5H7a2 2 0 0 0-2 2v4a2.5 2.5 0 0 1-2 2.5 2.5 2.5 0 0 1 2 2.5v4a2 2 0 0 0 2 2h.5" />
    <path d="M16.5 20.5h.5a2 2 0 0 0 2-2v-4a2.5 2.5 0 0 1 2-2.5 2.5 2.5 0 0 1-2-2.5v-4a2 2 0 0 0-2-2h-.5" />
    <path d="m13.6 8.5-3.2 7" />
  </Base>
);

export const SettingsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const CommitIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M3 12h6M15 12h6" />
  </Base>
);

export const PullRequestIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M6 9v12" />
  </Base>
);

export const MergeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </Base>
);

export const DraftIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M18 6V5M18 11v-1M6 9v12" />
  </Base>
);

export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Base>
);

export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="18" height="18" x="3" y="3" rx="3" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Base>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11.48 3.5a.6.6 0 0 1 1.04 0l2.4 4.86 5.36.78a.6.6 0 0 1 .33 1.02l-3.88 3.78.92 5.34a.6.6 0 0 1-.87.63L12 17.39l-4.79 2.52a.6.6 0 0 1-.87-.63l.92-5.34L3.38 10.16a.6.6 0 0 1 .33-1.02l5.36-.78z" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);

export const MessageIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.14L4 20.5l1.36-4.6A8 8 0 1 1 21 12z" />
  </Base>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect width="16" height="11" x="4" y="10.5" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
  </Base>
);

export const TrendIcon = ({ down, ...p }: IconProps & { down?: boolean }) => (
  <Base {...p}>
    {down ? <path d="m4 7 6 6 4-4 6 6M20 10v5h-5" /> : <path d="m4 17 6-6 4 4 6-6M20 14V9h-5" />}
  </Base>
);

export const TriangleIcon = ({ size = 10, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" focusable="false" {...rest}>
    <path d="M2.5 1.2v7.6L8.6 5z" fill="currentColor" />
  </svg>
);

const CLAUDE_RAYS = [
  [0, 10], [28, 7.5], [55, 9.5], [83, 8], [112, 10], [140, 7], [168, 9],
  [196, 8], [224, 10], [252, 7.5], [280, 9.5], [306, 8], [334, 9],
] as const;

export const ClaudeIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
    <g stroke="#E0784A" strokeWidth={2.3} strokeLinecap="round">
      {CLAUDE_RAYS.map(([deg, len]) => {
        const r = (deg * Math.PI) / 180;
        const x = 12 + Math.cos(r) * len;
        const y = 12 + Math.sin(r) * len;
        return <line key={deg} x1={12} y1={12} x2={x.toFixed(2)} y2={y.toFixed(2)} />;
      })}
    </g>
  </svg>
);

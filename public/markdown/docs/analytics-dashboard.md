# ObsidianUI — Analytics Dashboard

[Canonical page](https://www.obsidianui.dev/docs/analytics-dashboard) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A complete engineering analytics app in one component. It has an overview with metric cards, a commit chart, and top contributors, a searchable repository grid, a code review queue with status filters, and a settings page. Selecting a pull request opens a details panel with an assistant you can ask about it.

Open the preview full screen to see the docked details panel. In containers narrower than 1180px the panel slides over the content, and below 760px the sidebar floats over the page.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/analytics-dashboard)

```tsx
'use client'

import { AnalyticsDashboard } from '@/components/block/analytics-dashboard'

export function Demo() {
return (
  <div className="h-dvh">
    <AnalyticsDashboard />
  </div>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/analytics-dashboard.json"
```

## Usage

```tsx
import { AnalyticsDashboard } from '@/components/block/analytics-dashboard'

<div className="h-dvh">
  <AnalyticsDashboard />
</div>
```

The dashboard fills its parent, so give the parent a height, such as `h-dvh` for a full page. Without a `data` prop it shows demo data, so you can see every page before connecting your own.

## Your data

Pass your team, metrics, repositories, and pull requests through `data`. Pull requests and activity refer to people by `handle`, and each person brings an avatar and a chart color:

```tsx
import { AnalyticsDashboard, type AnalyticsDashboardData } from '@/components/block/analytics-dashboard'

const data: AnalyticsDashboardData = {
  people: [
    { handle: 'maya', avatar: '/avatars/maya.webp', color: '#f08a3c', role: 'Frontend' },
    { handle: 'leo', avatar: '/avatars/leo.webp', color: '#9d8df5', role: 'Platform' },
  ],
  ranges: [
    { id: 'week', label: 'Week', caption: 'Apr 13 – Apr 17, 2026' },
    { id: 'month', label: 'Month', caption: 'March 20 – April 17, 2026' },
  ],
  kpis: {
    week: [
      { id: 'commits', label: 'Commits', icon: 'commit', value: '91', delta: 12, spark: [8, 11, 9, 14, 12, 16] },
      { id: 'review', label: 'Avg. Review Time', icon: 'clock', value: '3.4h', delta: -18, lowerIsBetter: true, spark: [5.2, 4.9, 4.4, 3.8, 3.4] },
    ],
    month: [],
  },
  activity: {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      series: { maya: [7, 11, 9, 13, 10], leo: [5, 8, 4, 9, 5] },
      lines: { maya: { added: 3400, removed: 2300 }, leo: { added: 2100, removed: 1400 } },
    },
    month: { labels: [], series: {}, lines: {} },
  },
  repositories: [],
  pullRequests: [],
}

<AnalyticsDashboard
  data={data}
  brand={{ name: 'Acme Engineering' }}
  user={{ name: 'maya', email: 'maya@acme.dev', avatar: '/avatars/maya.webp', role: 'Frontend · Admin' }}
/>
```

`kpis` and `activity` are keyed by range id, so the range switcher on the overview swaps both. A metric's `value` is shown as written, so it can carry a unit like `3.4h`, and its digits roll up like a slot machine. Set `lowerIsBetter` on metrics such as review time, so a drop shows in green.

Start from `analyticsDashboardDemoData`, exported from the same file, when you only need to change part of the data.

## Assistant answers

The composer in the details panel sends questions to `onAsk` with the selected pull request. Return the answer as a string or a promise. While it waits, the panel shows a "thinking" shimmer:

```tsx
<AnalyticsDashboard
  assistantName="Claude"
  onAsk={async (question, pullRequest) => {
    const response = await fetch('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question, pullRequest: pullRequest.number }),
    })
    return response.text()
  }}
/>
```

Without `onAsk`, the panel replies with a short summary of the pull request.

## Pages

The sidebar switches between Overview, Repositories, Code review, and Settings without leaving the page. Track the page with `page` and `onPageChange`, for example to keep it in the URL, or set the first page with `defaultPage`.

## Light and dark mode

The dashboard has a light and a dark palette. It is light by default and switches to dark when a parent element has the `dark` class, the convention next-themes and shadcn/ui use. Add `dark` to the dashboard's own `className` to keep it dark on a light page.

```tsx
<AnalyticsDashboard className="dark" />
```

## Background and fonts

The window sits on a plain color: `#f6f6f7` in light mode and `#0b0b0c` in dark mode. Change it with `background`:

```tsx
<AnalyticsDashboard background="#1c1c1f" />
```

The dashboard uses Inter for text and JetBrains Mono for code, through the `--font-inter` and `--font-jetbrains-mono` variables. In Next.js, load both with `next/font` and add their variables to a parent element:

```tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

<html lang="en" className={`${inter.variable} ${mono.variable}`}>
```

Without them, it falls back to the system fonts.

## Behavior

- The layout responds to the width of the dashboard, not the window, so it also works inside a panel or a preview. The details panel docks from 1180px, and the sidebar floats over the page below 760px.
- Escape closes the details panel or the floating sidebar, then returns focus to the button that opened it.
- Settings → Appearance changes the accent color of buttons, selections, and charts right away. Set the first accent with `defaultAccent`.
- With reduced motion, entrances fade in place, and the numbers, charts, and panels skip their movement.

## Install manually — complete source

Download the complete manifest: [analytics-dashboard.json](https://www.obsidianui.dev/r/analytics-dashboard.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

Default demo media loads from ObsidianUI. Replace these URLs with your own assets for offline use.

### components/analytics-dashboard/context.ts

Installation target: `@components/analytics-dashboard/context.ts`

```ts
"use client";

import { createContext, useContext } from "react";
import type { AnalyticsDashboardData, AnalyticsPerson, AnalyticsPullRequest } from "./data";

export type AnalyticsDashboardPage = "overview" | "repositories" | "reviews" | "settings";

export type AnalyticsDashboardAccent = "blue" | "violet" | "teal" | "amber";

export const ACCENTS: Record<AnalyticsDashboardAccent, { label: string; ui: string }> = {
  blue: { label: "Blue", ui: "#4c9bff" },
  violet: { label: "Violet", ui: "#9d8df5" },
  teal: { label: "Teal", ui: "#2fd0b5" },
  amber: { label: "Amber", ui: "#f2b54a" },
};

export type AnalyticsDashboardUser = {
  name: string;
  email: string;
  avatar: string;
  role?: string;
};

export type AnswerHandler = (question: string, pullRequest: AnalyticsPullRequest) => string | Promise<string>;

type DashboardState = {
  data: AnalyticsDashboardData;
  person: (handle: string) => AnalyticsPerson | undefined;
  user: AnalyticsDashboardUser;
  assistantName: string;
  answer?: AnswerHandler;
  /** Prefix for element ids, unique per dashboard instance. */
  uid: string;
  selected: number;
  openPr: (prNumber: number) => void;
  navigate: (page: AnalyticsDashboardPage) => void;
  accent: AnalyticsDashboardAccent;
  setAccent: (accent: AnalyticsDashboardAccent) => void;
};

export const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <AnalyticsDashboard>");
  return ctx;
}
```

### components/analytics-dashboard/data.ts

Installation target: `@components/analytics-dashboard/data.ts`

```ts
export type AnalyticsPerson = {
  /** Unique handle. Pull requests and activity series refer to people by it. */
  handle: string;
  /** Avatar image URL. */
  avatar: string;
  /** Any CSS color. Used for the chart segments, legend and share bars. */
  color: string;
  role: string;
};

export type AnalyticsRange = { id: string; label: string; caption: string };

export type AnalyticsKpiIcon = "commit" | "pull" | "merge" | "clock";

export type AnalyticsKpi = {
  id: string;
  label: string;
  icon: AnalyticsKpiIcon;
  /** Displayed as is, so it can carry a unit such as "3.4h". */
  value: string;
  /** Percent change against the previous period. */
  delta: number;
  /** For metrics like review time, going down is the good direction. */
  lowerIsBetter?: boolean;
  spark: number[];
};

export type AnalyticsActivity = {
  labels: string[];
  /** Commits per label, keyed by person handle. */
  series: Record<string, number[]>;
  lines: Record<string, { added: number; removed: number }>;
};

export type AnalyticsRepository = {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  visibility: "Private" | "Public";
  openPrs: number;
  stars: number;
  updated: string;
  /** Minutes since the last push, used for sorting. */
  updatedMinutes: number;
  /** Commits per day, oldest first. */
  activity: number[];
};

export type AnalyticsPrStatus = { kind: "merged" | "review" | "open"; label: string };

export type AnalyticsPullRequest = {
  number: number;
  title: string;
  /** Handle of a person in `people`. */
  author: string;
  status: AnalyticsPrStatus;
  repository: string;
  opened: string;
  /** Short relative time used in lists. */
  age: string;
  /** Listed under "Today PRs" on the overview. */
  today: boolean;
  additions: number;
  deletions: number;
  comments: number;
  /** Paragraphs; text wrapped in backticks renders as inline code. */
  problem: string[];
  approach: string[];
};

export type AnalyticsDashboardData = {
  people: AnalyticsPerson[];
  ranges: AnalyticsRange[];
  /** Metric cards per range id. */
  kpis: Record<string, AnalyticsKpi[]>;
  /** Commit activity per range id. */
  activity: Record<string, AnalyticsActivity>;
  repositories: AnalyticsRepository[];
  pullRequests: AnalyticsPullRequest[];
};

export const analyticsDashboardDemoData: AnalyticsDashboardData = {
  people: [
    { handle: "atharv", avatar: "https://www.obsidianui.dev/analytics-dashboard/avatars/atharv.webp", color: "#f08a3c", role: "CLI & tooling" },
    { handle: "ananya", avatar: "https://www.obsidianui.dev/analytics-dashboard/avatars/ananya.webp", color: "#9d8df5", role: "Web platform" },
    { handle: "rahul", avatar: "https://www.obsidianui.dev/analytics-dashboard/avatars/rahul.webp", color: "#2fd06f", role: "Payments" },
  ],
  ranges: [
    { id: "today", label: "Today", caption: "Fri, Apr 17 · since 9:00 AM" },
    { id: "week", label: "Week", caption: "Apr 13 – Apr 17, 2026" },
    { id: "month", label: "Month", caption: "March 20 – April 17, 2026" },
  ],
  kpis: {
    today: [
      { id: "commits", label: "Commits", icon: "commit", value: "18", delta: 6, spark: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7] },
      { id: "prs", label: "Pull Requests", icon: "pull", value: "12", delta: 9, spark: [1, 1, 2, 2, 3, 2, 3, 4, 3, 4] },
      { id: "merged", label: "Merged PRs", icon: "merge", value: "9", delta: 13, spark: [0, 1, 1, 2, 1, 2, 3, 2, 3, 4] },
      { id: "review", label: "Avg. Review Time", icon: "clock", value: "2.1h", delta: -9, lowerIsBetter: true, spark: [4, 3.6, 3.8, 3.1, 3.3, 2.8, 2.6, 2.7, 2.3, 2.1] },
    ],
    week: [
      { id: "commits", label: "Commits", icon: "commit", value: "91", delta: 12, spark: [8, 11, 9, 14, 12, 16, 13, 18, 15, 19] },
      { id: "prs", label: "Pull Requests", icon: "pull", value: "201", delta: 8, spark: [22, 25, 21, 27, 24, 30, 26, 29, 31, 33] },
      { id: "merged", label: "Merged PRs", icon: "merge", value: "184", delta: 15, spark: [18, 20, 19, 24, 22, 26, 25, 28, 27, 31] },
      { id: "review", label: "Avg. Review Time", icon: "clock", value: "3.4h", delta: -18, lowerIsBetter: true, spark: [5.2, 4.9, 5.1, 4.6, 4.4, 4.5, 4, 3.8, 3.6, 3.4] },
    ],
    month: [
      { id: "commits", label: "Commits", icon: "commit", value: "412", delta: 21, spark: [70, 82, 76, 90, 88, 97, 94, 105, 101, 112] },
      { id: "prs", label: "Pull Requests", icon: "pull", value: "836", delta: 11, spark: [160, 172, 168, 181, 176, 190, 194, 201, 198, 212] },
      { id: "merged", label: "Merged PRs", icon: "merge", value: "790", delta: 9, spark: [150, 158, 161, 166, 170, 176, 181, 184, 190, 196] },
      { id: "review", label: "Avg. Review Time", icon: "clock", value: "3.9h", delta: -6, lowerIsBetter: true, spark: [4.6, 4.4, 4.5, 4.3, 4.2, 4.1, 4.2, 4, 3.9, 3.9] },
    ],
  },
  activity: {
    today: {
      labels: ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM"],
      series: { atharv: [2, 3, 1, 3, 2], ananya: [1, 1, 2, 1, 0], rahul: [0, 1, 1, 0, 1] },
      lines: { atharv: { added: 640, removed: 210 }, ananya: { added: 380, removed: 150 }, rahul: { added: 120, removed: 40 } },
    },
    week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      series: { atharv: [7, 11, 9, 13, 10], ananya: [5, 8, 4, 9, 5], rahul: [4, 3, 6, 4, 4] },
      lines: { atharv: { added: 3400, removed: 2300 }, ananya: { added: 2100, removed: 1400 }, rahul: { added: 1200, removed: 600 } },
    },
    month: {
      labels: ["Mar 20", "Mar 27", "Apr 3", "Apr 10", "Apr 17"],
      series: { atharv: [34, 41, 38, 46, 50], ananya: [22, 25, 31, 27, 31], rahul: [14, 18, 12, 19, 21] },
      lines: { atharv: { added: 14800, removed: 9100 }, ananya: { added: 9600, removed: 5200 }, rahul: { added: 5300, removed: 2700 } },
    },
  },
  repositories: [
    {
      name: "branch/cli",
      description: "Interactive CLI for switching, creating and validating project branches.",
      language: "TypeScript",
      languageColor: "#3178c6",
      visibility: "Public",
      openPrs: 2,
      stars: 1240,
      updated: "5m ago",
      updatedMinutes: 5,
      activity: [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 10, 13, 12, 14],
    },
    {
      name: "web/app",
      description: "Customer dashboard, profile settings and the shared UI kit.",
      language: "TypeScript",
      languageColor: "#3178c6",
      visibility: "Private",
      openPrs: 3,
      stars: 318,
      updated: "1h ago",
      updatedMinutes: 60,
      activity: [6, 5, 7, 6, 8, 7, 6, 9, 8, 7, 9, 8, 10, 9],
    },
    {
      name: "payments/core",
      description: "Charges, refunds, partial captures and nightly reconciliation.",
      language: "Go",
      languageColor: "#00add8",
      visibility: "Private",
      openPrs: 1,
      stars: 96,
      updated: "3h ago",
      updatedMinutes: 180,
      activity: [2, 2, 3, 2, 4, 3, 3, 2, 4, 5, 4, 6, 5, 6],
    },
    {
      name: "infra/build",
      description: "Build cache, CI pipelines and release automation.",
      language: "Rust",
      languageColor: "#dea584",
      visibility: "Private",
      openPrs: 0,
      stars: 54,
      updated: "1d ago",
      updatedMinutes: 1440,
      activity: [4, 3, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 1],
    },
    {
      name: "docs/site",
      description: "Product documentation, guides and the TUI component reference.",
      language: "MDX",
      languageColor: "#f9ac00",
      visibility: "Public",
      openPrs: 1,
      stars: 187,
      updated: "6h ago",
      updatedMinutes: 360,
      activity: [1, 2, 1, 1, 2, 3, 2, 2, 3, 2, 4, 3, 3, 4],
    },
  ],
  pullRequests: [
    {
      number: 101,
      title: "feat(cli): add interactive `branch switch` + shared TUI foundation",
      author: "atharv",
      status: { kind: "merged", label: "Merged 5m Ago" },
      repository: "branch/branch-switch",
      opened: "4:54 PM Apr 16, 2026",
      age: "5m",
      today: true,
      additions: 842,
      deletions: 117,
      comments: 14,
      problem: [
        "Switching the active project was previously handled through slash commands that directly updated `.active`. This meant there was no proper CLI entry point, no validation, and no interactive selection. It also made it harder to scale, since future commands like `branch new` didn\u2019t have a shared TUI layer to rely on.",
      ],
      approach: [
        "A new branch switch command is introduced, with an interactive picker that lets you navigate using arrow keys in the terminal. For non-interactive usage (like scripts), --to <name> is also supported.",
        "Behind the scenes, listProjects() and setActiveProject() helpers are added to a shared TUI module, so future commands can reuse the same picker, validation and rendering primitives.",
      ],
    },
    {
      number: 102,
      title: "feat(ui): enhance user profile settings with new privacy options",
      author: "ananya",
      status: { kind: "review", label: "In Review 1h Ago" },
      repository: "web/profile-settings",
      opened: "11:20 AM Apr 17, 2026",
      age: "1h",
      today: true,
      additions: 512,
      deletions: 89,
      comments: 6,
      problem: [
        "Profile visibility was a single public/private switch stored on `user.visibility`. Users could not hide their email or activity separately, and support kept receiving requests to remove contribution graphs from public profiles.",
      ],
      approach: [
        "The settings page now groups privacy controls into Profile, Activity and Contact sections, each backed by its own field on `privacy_preferences`.",
        "Existing accounts are migrated with their current visibility applied to every section, so nothing becomes public without the user opting in.",
      ],
    },
    {
      number: 103,
      title: "chore(tests): add unit tests for the payment processing module",
      author: "rahul",
      status: { kind: "open", label: "Opened 3h Ago" },
      repository: "payments/core",
      opened: "9:02 AM Apr 17, 2026",
      age: "3h",
      today: true,
      additions: 1290,
      deletions: 12,
      comments: 2,
      problem: [
        "The payment processor had no unit coverage outside of `chargeCard()`. Refunds, partial captures and currency rounding were only exercised by slow end-to-end runs, so regressions surfaced late.",
      ],
      approach: [
        "Adds focused suites for refunds, captures and rounding using a fake gateway built on `PaymentGateway`, keeping every test under 50ms.",
        "Edge cases for zero-decimal currencies and duplicate webhook delivery are covered with table-driven cases.",
      ],
    },
    {
      number: 104,
      title: "feat(api): add cursor pagination to the /projects endpoint",
      author: "atharv",
      status: { kind: "review", label: "In Review 2h Ago" },
      repository: "branch/api",
      opened: "10:41 AM Apr 17, 2026",
      age: "2h",
      today: false,
      additions: 336,
      deletions: 74,
      comments: 9,
      problem: [
        "`GET /projects` returned every project in one response. Large workspaces took several seconds to load the picker, and offset pagination skipped rows whenever projects were created mid-scroll.",
      ],
      approach: [
        "Responses now return a `next_cursor` built from the creation time and id, and accept `?after=` to resume. The page size defaults to 50 and is capped at 200.",
        "The CLI picker streams pages as you scroll, so the first results appear immediately.",
      ],
    },
    {
      number: 105,
      title: "fix(auth): stop rotating refresh tokens on every request",
      author: "ananya",
      status: { kind: "merged", label: "Merged 4h Ago" },
      repository: "web/auth",
      opened: "8:15 AM Apr 17, 2026",
      age: "4h",
      today: false,
      additions: 58,
      deletions: 31,
      comments: 4,
      problem: [
        "The session middleware called `rotateRefreshToken()` on every authenticated request. Two tabs refreshing at once invalidated each other\u2019s tokens and signed people out at random.",
      ],
      approach: [
        "Rotation now only happens when the access token is within five minutes of expiring, and a short grace window accepts the previous refresh token once.",
      ],
    },
    {
      number: 106,
      title: "docs: document the new TUI picker and validation primitives",
      author: "rahul",
      status: { kind: "open", label: "Opened 6h Ago" },
      repository: "docs/site",
      opened: "6:30 AM Apr 17, 2026",
      age: "6h",
      today: false,
      additions: 410,
      deletions: 0,
      comments: 1,
      problem: [
        "The shared TUI module from #101 had no documentation, so other teams kept rebuilding their own pickers instead of reusing `createPicker()`.",
      ],
      approach: [
        "Adds a reference page for every primitive with live terminal recordings, plus a migration guide for commands that still use raw prompts.",
      ],
    },
    {
      number: 107,
      title: "perf(build): cache TypeScript project references in CI",
      author: "atharv",
      status: { kind: "merged", label: "Merged 1d Ago" },
      repository: "infra/build",
      opened: "3:12 PM Apr 16, 2026",
      age: "1d",
      today: false,
      additions: 96,
      deletions: 40,
      comments: 5,
      problem: [
        "Every CI run rebuilt all TypeScript project references from scratch, adding about four minutes to each pipeline even when only one package changed.",
      ],
      approach: [
        "The `.tsbuildinfo` files are now cached per package and keyed by the lockfile hash, so unchanged packages are skipped. Median pipeline time dropped from 9m to 5m.",
      ],
    },
    {
      number: 108,
      title: "refactor(ui): extract Toolbar into the shared component package",
      author: "ananya",
      status: { kind: "open", label: "Opened 1d Ago" },
      repository: "web/app",
      opened: "1:48 PM Apr 16, 2026",
      age: "1d",
      today: false,
      additions: 274,
      deletions: 351,
      comments: 3,
      problem: [
        "Three apps carried slightly different copies of `Toolbar`, and keyboard focus handling had drifted between them.",
      ],
      approach: [
        "The toolbar moves into `@acme/ui` with a single roving-focus implementation. Each app now imports it and passes its own actions.",
      ],
    },
  ],
};
```

### components/analytics-dashboard/details.tsx

Installation target: `@components/analytics-dashboard/details.tsx`

```tsx
"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { useDashboard } from "./context";
import type { AnalyticsPullRequest } from "./data";
import { ArrowUpIcon, ClaudeIcon, DraftIcon, ImageIcon, PanelIcon, PullRequestIcon, TriangleIcon } from "./icons";
import { PersonAvatar } from "./ui";

export type Phase = "in" | "out" | "pre";

type Message = { id: number; role: "user" | "assistant"; text: string; pending?: boolean };

type Props = {
  pr: AnalyticsPullRequest;
  phase: Phase;
  /** Slide-over state below the desktop breakpoint. */
  open: boolean;
  /** Whether the panel is on screen in the current layout. */
  visible: boolean;
  panelRef: RefObject<HTMLElement | null>;
  hideRef: RefObject<HTMLButtonElement | null>;
  onHide: () => void;
};

const STATUS_ICON = { merged: PullRequestIcon, review: DraftIcon, open: PullRequestIcon } as const;

export function PrDetails({ pr, phase, open, visible, panelRef, hideRef, onHide }: Props) {
  const { uid, assistantName, answer } = useDashboard();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Record<number, Message[]>>({});
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const mounted = useRef(true);
  const messages = threads[pr.number] ?? [];

  useEffect(() => {
    mounted.current = true;
    const pending = timers.current;
    return () => {
      mounted.current = false;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }

  function resolve(prNumber: number, botId: number, text: string) {
    if (!mounted.current) return;
    setThreads((t) => ({
      ...t,
      [prNumber]: (t[prNumber] ?? []).map((m) => (m.id === botId ? { ...m, pending: false, text } : m)),
    }));
    scrollToEnd();
  }

  function ask(question: string) {
    const target = pr;
    const userId = nextId.current++;
    const botId = nextId.current++;
    setThreads((t) => ({
      ...t,
      [target.number]: [
        ...(t[target.number] ?? []),
        { id: userId, role: "user", text: question },
        { id: botId, role: "assistant", text: "", pending: true },
      ],
    }));
    scrollToEnd();
    if (answer) {
      Promise.resolve()
        .then(() => answer(question, target))
        .then(
          (text) => resolve(target.number, botId, text),
          () => resolve(target.number, botId, "Something went wrong while answering. Try again."),
        );
      return;
    }
    timers.current.push(window.setTimeout(() => resolve(target.number, botId, answerFor(target)), 1400));
  }

  function onScroll() {
    const el = scrollRef.current;
    if (el) el.dataset.scrolled = String(el.scrollTop > 4);
  }

  const StatusIcon = STATUS_ICON[pr.status.kind];
  const panelId = `${uid}-details`;
  const titleId = `${uid}-details-title`;

  return (
    <aside ref={panelRef} id={panelId} className="details" data-open={open} inert={!visible} aria-labelledby={titleId}>
      <header className="details-bar enter" style={{ "--i": 1 } as CSSProperties}>
        <button
          ref={hideRef}
          type="button"
          className="icon-btn press has-tip tip-below details-hide"
          data-tip="Hide PR details"
          aria-label="Hide PR details"
          aria-expanded={visible}
          aria-controls={panelId}
          onClick={onHide}
        >
          <PanelIcon side="right" open size={15} />
        </button>
        <span id={titleId} className="details-bar-title">
          <span key={pr.number} className="swap-in">
            PR #{pr.number} Details
          </span>
        </span>
      </header>

      <div className="details-scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="details-body enter" style={{ "--i": 2 } as CSSProperties}>
          <div className="details-swap" data-phase={phase}>
            <p className="status" data-kind={pr.status.kind}>
              <StatusIcon size={15} />
              {pr.status.label}
            </p>
            <h2 className="details-title">{pr.title}</h2>

            <dl className="kv">
              <div>
                <dt>Author</dt>
                <dd>
                  <PersonAvatar handle={pr.author} size={22} />
                  {pr.author}
                </dd>
              </div>
              <div>
                <dt>Repository</dt>
                <dd>{pr.repository}</dd>
              </div>
              <div>
                <dt>Opened</dt>
                <dd>{pr.opened}</dd>
              </div>
            </dl>

            <Disclosure key={`p-${pr.number}`} title="Problem">
              {pr.problem.map((p, i) => (
                <p key={i}>
                  <RichText text={p} />
                </p>
              ))}
            </Disclosure>
            <Disclosure key={`a-${pr.number}`} title="Approach">
              {pr.approach.map((p, i) => (
                <p key={i}>
                  <RichText text={p} />
                </p>
              ))}
            </Disclosure>

            {messages.length > 0 && (
              <ol className="thread" aria-label="Conversation" aria-live="polite">
                {messages.map((m) => (
                  <li key={m.id} className={`msg msg-${m.role}`}>
                    {m.pending ? <span className="shimmer">{assistantName} is thinking…</span> : m.text}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="enter composer-slot" style={{ "--i": 3 } as CSSProperties}>
        <Composer onSubmit={ask} />
      </div>
    </aside>
  );
}

function Composer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const { uid, assistantName } = useDashboard();
  const [value, setValue] = useState("");
  const [files, setFiles] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasValue = value.trim().length > 0;
  const inputId = `${uid}-composer`;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!hasValue) return;
    onSubmit(value.trim());
    setValue("");
    setFiles(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const fileLabel = files === 0 ? "Image/Files" : `${files} ${files === 1 ? "file" : "files"}`;

  return (
    <form className="composer" onSubmit={submit} data-has-value={hasValue}>
      <label htmlFor={inputId} className="sr-only">
        Ask anything about PR
      </label>
      <textarea
        id={inputId}
        className="composer-input"
        rows={1}
        placeholder="Ask anything about PR"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="composer-row">
        <button type="button" className="chip press" onClick={() => fileRef.current?.click()}>
          <ImageIcon size={15} />
          <span key={fileLabel} className="swap-in">
            {fileLabel}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,.txt,.md,.diff,.patch,.log"
          onChange={(e) => setFiles(e.target.files?.length ?? 0)}
        />
        <button type="button" className="chip chip-claude press" aria-label={`Model: ${assistantName}`}>
          <ClaudeIcon size={15} className="claude-icon" />
          {assistantName}
        </button>
        <button type="submit" className="send press" aria-label="Send" disabled={!hasValue}>
          <ArrowUpIcon size={15} />
        </button>
      </div>
    </form>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <div className="acc" data-open={open}>
      <button type="button" className="acc-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <TriangleIcon size={10} className="acc-tri" />
        {title}
      </button>
      <div className="acc-panel" id={id}>
        <div className="acc-inner">{children}</div>
      </div>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="code-chip">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function answerFor(pr: AnalyticsPullRequest) {
  const firstSentence = (pr.approach[0] ?? pr.title).split(". ")[0].replace(/`/g, "");
  return `${firstSentence}. It touches ${pr.repository} and was opened by ${pr.author} at ${pr.opened}.`;
}
```

### components/analytics-dashboard/icons.tsx

Installation target: `@components/analytics-dashboard/icons.tsx`

```tsx
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
```

### components/analytics-dashboard/number-animation.module.css

Installation target: `@components/analytics-dashboard/number-animation.module.css`

```css
.root { position: relative; display: inline-block; font-variant-numeric: tabular-nums; line-height: 1.15; white-space: nowrap; vertical-align: bottom; }
.reels { display: inline-flex; height: 1.15em; align-items: flex-start; }

/* Each slot holds one character. Its width follows the character on a spring, so the word never resizes in one frame. */
.slot { position: relative; display: inline-block; height: 1.15em; flex: none; overflow: visible; }
.sizer { display: inline-block; visibility: hidden; white-space: pre; pointer-events: none; }

/* The window reaches a little past the line so glyphs fade at the edges instead of being cut. */
.window {
  position: absolute;
  inset: -.22em -.08em;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 .24em, #000 calc(100% - .24em), transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 .24em, #000 calc(100% - .24em), transparent);
}
.strip { position: absolute; top: calc(.22em - .225em); right: .08em; left: .08em; display: flex; flex-direction: column; align-items: center; will-change: transform; }
.cell { display: block; height: 1.6em; padding-top: .225em; box-sizing: border-box; line-height: 1.15; white-space: pre; }

.srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```

### components/analytics-dashboard/number-animation.tsx

Installation target: `@components/analytics-dashboard/number-animation.tsx`

```tsx
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
```

### components/analytics-dashboard/pages.tsx

Installation target: `@components/analytics-dashboard/pages.tsx`

```tsx
"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ACCENTS, useDashboard, type AnalyticsDashboardAccent } from "./context";
import type { AnalyticsActivity, AnalyticsKpi, AnalyticsKpiIcon, AnalyticsPerson, AnalyticsPrStatus, AnalyticsPullRequest, AnalyticsRepository } from "./data";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CommitIcon,
  GlobeIcon,
  LockIcon,
  MergeIcon,
  MessageIcon,
  PullRequestIcon,
  SearchIcon,
  StarIcon,
  TrendIcon,
} from "./icons";
import { Avatar, Digits, formatCount, PersonAvatar, PrRow, Segmented, Sparkline, StatusIcon, StatusPill, Switch } from "./ui";

/* ───────────── Overview ───────────── */

const KPI_ICONS: Record<AnalyticsKpiIcon, typeof CommitIcon> = {
  commit: CommitIcon,
  pull: PullRequestIcon,
  merge: MergeIcon,
  clock: ClockIcon,
};

const EMPTY_ACTIVITY: AnalyticsActivity = { labels: [], series: {}, lines: {} };

export function OverviewPage() {
  const { data, selected, openPr, navigate } = useDashboard();
  const id = useId();
  const [range, setRange] = useState(() => data.ranges.find((r) => r.id === "week")?.id ?? data.ranges[0]?.id ?? "");
  const caption = data.ranges.find((r) => r.id === range)?.caption;
  const today = data.pullRequests.filter((pr) => pr.today);
  const activity = data.activity[range] ?? EMPTY_ACTIVITY;

  return (
    <div className="page-content">
      <header className="page-head enter" style={{ "--i": 1 } as CSSProperties}>
        <div className="page-head-text">
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">
            <span key={range} className="swap-in">
              {caption}
            </span>
          </p>
        </div>
        {data.ranges.length > 1 && <Segmented label="Date range" options={data.ranges} value={range} onChange={setRange} />}
      </header>

      <ul className="stats" aria-label="Key metrics">
        {(data.kpis[range] ?? []).map((k, i) => (
          <KpiCard key={k.id} kpi={k} range={range} index={i} />
        ))}
      </ul>

      <div className="overview-grid">
        <section className="card enter" style={{ "--i": 3 } as CSSProperties} aria-labelledby={`${id}-activity`}>
          <header className="card-head">
            <h2 id={`${id}-activity`} className="card-title">
              Commit activity
            </h2>
            <ul className="legend" aria-label="Contributors">
              {data.people.map((p) => (
                <li key={p.handle}>
                  <i style={{ "--c": p.color } as CSSProperties} aria-hidden="true" />
                  {p.handle}
                </li>
              ))}
            </ul>
          </header>
          <ActivityChart key={range} data={activity} people={data.people} />
        </section>

        <section className="card enter" style={{ "--i": 3.5 } as CSSProperties} aria-labelledby={`${id}-contrib`}>
          <header className="card-head">
            <h2 id={`${id}-contrib`} className="card-title">
              Top contributors
            </h2>
          </header>
          <Leaderboard data={activity} people={data.people} />
        </section>
      </div>

      <section className="block enter" style={{ "--i": 4.5 } as CSSProperties} aria-labelledby={`${id}-prs`}>
        <div className="block-head">
          <h2 id={`${id}-prs`} className="block-title">
            Today PRs
          </h2>
          <button type="button" className="link-more" onClick={() => navigate("reviews")}>
            View all
            <ArrowRightIcon size={14} />
          </button>
        </div>
        <ul className="pr-list">
          {today.map((pr) => (
            <PrRow key={pr.number} pr={pr} selected={selected === pr.number} onOpen={openPr} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function KpiCard({ kpi, range, index }: { kpi: AnalyticsKpi; range: string; index: number }) {
  const Icon = KPI_ICONS[kpi.icon];
  const good = kpi.lowerIsBetter ? kpi.delta < 0 : kpi.delta > 0;
  return (
    <li className="stat enter" style={{ "--i": 2 + index * 0.4 } as CSSProperties}>
      <span className="stat-label">
        <Icon size={16} strokeWidth={1.7} className="stat-icon" />
        {kpi.label}
      </span>
      <div className="stat-row">
        <Digits value={kpi.value} delay={420 + index * 70} className="stat-value" />
        <span className="delta" data-good={good}>
          <TrendIcon size={13} strokeWidth={2} down={kpi.delta < 0} />
          <Digits value={`${kpi.delta < 0 ? "\u2212" : "+"}${Math.abs(kpi.delta)}%`} delay={500 + index * 70} />
        </span>
      </div>
      <Sparkline key={range} data={kpi.spark} tone={good ? "good" : "bad"} />
    </li>
  );
}

function niceCeil(n: number) {
  const step = n <= 10 ? 2 : n <= 40 ? 10 : n <= 120 ? 20 : 50;
  return Math.max(step, Math.ceil(n / step) * step);
}

function ActivityChart({ data, people }: { data: AnalyticsActivity; people: AnalyticsPerson[] }) {
  const totals = data.labels.map((_, i) => people.reduce((sum, p) => sum + (data.series[p.handle]?.[i] ?? 0), 0));
  const ceil = niceCeil(Math.max(0, ...totals));
  const summary = data.labels.map((label, i) => `${label} ${totals[i]}`).join(", ");

  return (
    <figure className="chart" role="img" aria-label={`Commits per period: ${summary}`}>
      <div className="chart-grid" aria-hidden="true">
        {[1, 0.5, 0].map((f) => (
          <span key={f} data-value={Math.round(ceil * f)} />
        ))}
      </div>
      <ol className="chart-cols" aria-hidden="true" style={{ "--cols": Math.max(1, data.labels.length) } as CSSProperties}>
        {data.labels.map((label, i) => (
          <li key={label} className="chart-col" style={{ "--col": i } as CSSProperties}>
            <div className="bar-wrap has-tip tip-top" data-tip={`${label} · ${totals[i]} commits`} style={{ height: `${(totals[i] / ceil) * 100}%` }}>
              <div className="bar">
                {people.map((p) => {
                  const v = data.series[p.handle]?.[i] ?? 0;
                  return v ? <span key={p.handle} className="bar-seg" style={{ flexGrow: v, "--c": p.color } as CSSProperties} /> : null;
                })}
              </div>
            </div>
            <span className="chart-label">{label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Leaderboard({ data, people }: { data: AnalyticsActivity; people: AnalyticsPerson[] }) {
  const rows = people
    .map((p) => ({
      ...p,
      commits: (data.series[p.handle] ?? []).reduce((a, b) => a + b, 0),
      lines: data.lines[p.handle] ?? { added: 0, removed: 0 },
    }))
    .sort((a, b) => b.commits - a.commits);
  const total = rows.reduce((sum, r) => sum + r.commits, 0) || 1;
  const top = rows[0]?.commits || 1;

  return (
    <ol className="leaders">
      {rows.map((r, i) => (
        <li key={r.handle} className="leader" style={{ "--row": i, "--c": r.color } as CSSProperties}>
          <Avatar src={r.avatar} size={32} />
          <div className="leader-main">
            <div className="leader-line">
              <span className="leader-name">{r.handle}</span>
              <span className="leader-count">
                <Digits value={r.commits} delay={560 + i * 80} /> commits
              </span>
            </div>
            <div className="share" aria-hidden="true">
              <span className="share-fill" style={{ "--share": r.commits / top } as CSSProperties} />
            </div>
            <div className="leader-meta">
              <span className="badge badge-add">
                <Digits value={`+${formatCount(r.lines.added)}`} delay={620 + i * 80} />
              </span>
              <span className="badge badge-del">
                <Digits value={`\u2212${formatCount(r.lines.removed)}`} delay={660 + i * 80} />
              </span>
              <span className="leader-pct">
                <Digits value={Math.round((r.commits / total) * 100)} delay={700 + i * 80} />% of commits
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ───────────── Repositories ───────────── */

type SortId = "recent" | "name" | "stars";

const SORTS = [
  { id: "recent", label: "Recent" },
  { id: "name", label: "Name" },
  { id: "stars", label: "Stars" },
] as const satisfies readonly { id: SortId; label: string }[];

const compare: Record<SortId, (a: AnalyticsRepository, b: AnalyticsRepository) => number> = {
  recent: (a, b) => a.updatedMinutes - b.updatedMinutes,
  name: (a, b) => a.name.localeCompare(b.name),
  stars: (a, b) => b.stars - a.stars,
};

export function RepositoriesPage() {
  const { data } = useDashboard();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("recent");
  const [starred, setStarred] = useState<Set<string>>(() => new Set(data.repositories[0] ? [data.repositories[0].name] : []));

  const q = query.trim().toLowerCase();
  const list = data.repositories
    .filter((r) => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .sort(compare[sort]);
  const openPrs = data.repositories.reduce((sum, r) => sum + r.openPrs, 0);

  function toggleStar(name: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="page-content">
      <header className="page-head enter" style={{ "--i": 1 } as CSSProperties}>
        <div className="page-head-text">
          <h1 className="page-title">Repositories</h1>
          <p className="page-sub">
            {data.repositories.length} repositories · {openPrs} open pull requests · {data.pullRequests.length} this week
          </p>
        </div>
      </header>

      <div className="toolbar enter" style={{ "--i": 2 } as CSSProperties}>
        <label className="search">
          <SearchIcon size={15} className="search-icon" />
          <span className="sr-only">Find a repository</span>
          <input
            type="search"
            value={query}
            placeholder="Find a repository…"
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <Segmented label="Sort repositories" options={SORTS} value={sort} onChange={setSort} />
      </div>

      {list.length === 0 ? (
        <div className="empty enter" style={{ "--i": 3 } as CSSProperties}>
          <p className="empty-title">No repositories match “{query.trim()}”</p>
          <p className="empty-sub">Try a different name or clear the search.</p>
          <button type="button" className="btn press" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <ul className="repo-grid" aria-label="Repositories">
          {list.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} starred={starred.has(repo.name)} onStar={() => toggleStar(repo.name)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RepoCard({ repo, index, starred, onStar }: { repo: AnalyticsRepository; index: number; starred: boolean; onStar: () => void }) {
  const slash = repo.name.indexOf("/");
  const org = slash >= 0 ? repo.name.slice(0, slash + 1) : "";
  const name = slash >= 0 ? repo.name.slice(slash + 1) : repo.name;
  const peak = Math.max(1, ...repo.activity);
  const VisIcon = repo.visibility === "Private" ? LockIcon : GlobeIcon;
  const stars = repo.stars + (starred ? 1 : 0);

  return (
    <li className="card repo enter" style={{ "--i": 3 + index * 0.35 } as CSSProperties}>
      <div className="repo-head">
        <VisIcon size={15} strokeWidth={1.8} className="repo-vis-icon" />
        <h2 className="repo-name">
          {org && <span className="repo-org">{org}</span>}
          {name}
        </h2>
        <span className="tag">{repo.visibility}</span>
        <button
          type="button"
          className="star-btn press"
          aria-pressed={starred}
          aria-label={`${starred ? "Unstar" : "Star"} ${repo.name}`}
          onClick={onStar}
        >
          <StarIcon size={16} strokeWidth={1.8} />
        </button>
      </div>
      <p className="repo-desc">{repo.description}</p>

      <div className="mini-bars" role="img" aria-label={`Commits over the last ${repo.activity.length} days, peak ${peak} per day`}>
        {repo.activity.map((v, i) => (
          <span key={i} style={{ "--h": v / peak, "--bar": i } as CSSProperties} />
        ))}
      </div>

      <div className="repo-foot">
        <span className="repo-lang">
          <i style={{ background: repo.languageColor }} aria-hidden="true" />
          {repo.language}
        </span>
        <span className="repo-stat">
          <StarIcon size={13} strokeWidth={1.9} />
          <Digits value={stars} format={formatCount} delay={420 + index * 80} />
        </span>
        <span className="repo-stat">
          <PullRequestIcon size={13} strokeWidth={1.9} />
          {repo.openPrs} open
        </span>
        <span className="repo-updated">Updated {repo.updated}</span>
      </div>
    </li>
  );
}

/* ───────────── Code review ───────────── */

type FilterId = "all" | AnalyticsPrStatus["kind"];

const FILTER_LABELS: Record<FilterId, string> = { all: "All", open: "Open", review: "In review", merged: "Merged" };
const ORDER: FilterId[] = ["all", "open", "review", "merged"];

export function ReviewsPage() {
  const { data, selected, openPr } = useDashboard();
  const [filter, setFilter] = useState<FilterId>("all");
  const prs = data.pullRequests;

  const count = (id: FilterId) => (id === "all" ? prs.length : prs.filter((p) => p.status.kind === id).length);
  const options = ORDER.map((id) => ({
    id,
    label: (
      <>
        {FILTER_LABELS[id]}
        <span className="seg-count">{count(id)}</span>
      </>
    ),
  }));
  const list = filter === "all" ? prs : prs.filter((p) => p.status.kind === filter);
  const waiting = count("review");

  return (
    <div className="page-content">
      <header className="page-head enter" style={{ "--i": 1 } as CSSProperties}>
        <div className="page-head-text">
          <h1 className="page-title">Code review</h1>
          <p className="page-sub">
            {waiting} {waiting === 1 ? "pull request is" : "pull requests are"} waiting for review
          </p>
        </div>
      </header>

      <div className="toolbar enter" style={{ "--i": 2 } as CSSProperties}>
        <Segmented label="Filter by status" options={options} value={filter} onChange={setFilter} className="seg-wide" />
      </div>

      <ul key={filter} className="review-list" aria-label={`${FILTER_LABELS[filter]} pull requests`}>
        {list.map((pr, i) => (
          <ReviewRow key={pr.number} pr={pr} index={i} selected={selected === pr.number} onOpen={openPr} />
        ))}
      </ul>
    </div>
  );
}

function ReviewRow({ pr, index, selected, onOpen }: { pr: AnalyticsPullRequest; index: number; selected: boolean; onOpen: (n: number) => void }) {
  const total = pr.additions + pr.deletions || 1;
  const greenBlocks = Math.round((pr.additions / total) * 5);

  return (
    <li className="review-row enter" data-selected={selected} style={{ "--i": 2.6 + index * 0.25 } as CSSProperties}>
      <StatusIcon status={pr.status} />
      <div className="review-main">
        <p className="pr-title">
          #{pr.number} {pr.title}
        </p>
        <p className="review-meta">
          <span className="review-repo">{pr.repository}</span>
          <span aria-hidden="true">·</span>
          <span className="review-author">
            <PersonAvatar handle={pr.author} size={22} />
            {pr.author}
          </span>
          <span aria-hidden="true">·</span>
          <span>{pr.age} ago</span>
          <span aria-hidden="true">·</span>
          <span className="review-comments">
            <MessageIcon size={13} strokeWidth={1.9} />
            {pr.comments}
            <span className="sr-only"> comments</span>
          </span>
        </p>
      </div>
      <div className="diffstat">
        <span className="diff-add">+{pr.additions}</span>
        <span className="diff-del">−{pr.deletions}</span>
        <span className="diff-blocks" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} data-kind={i < greenBlocks ? "add" : "del"} />
          ))}
        </span>
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

/* ───────────── Settings ───────────── */

type Style = "concise" | "balanced" | "detailed";
type NotifyId = "requests" | "mentions" | "merged" | "digest";

type Form = {
  name: string;
  email: string;
  notify: Record<NotifyId, boolean>;
  style: Style;
  includeDiff: boolean;
};

const NOTIFICATIONS: { id: NotifyId; title: string; detail: string }[] = [
  { id: "requests", title: "Review requests", detail: "When someone asks you to review a pull request." },
  { id: "mentions", title: "Mentions", detail: "When you are @mentioned in a comment or description." },
  { id: "merged", title: "Merged pull requests", detail: "When a pull request you authored is merged." },
  { id: "digest", title: "Weekly digest", detail: "A Friday summary of commits, merges and review time." },
];

const STYLES = [
  { id: "concise", label: "Concise" },
  { id: "balanced", label: "Balanced" },
  { id: "detailed", label: "Detailed" },
] as const satisfies readonly { id: Style; label: string }[];

type SaveState = "idle" | "saving" | "saved";

export function SettingsPage() {
  const { accent, setAccent, user, assistantName } = useDashboard();
  const id = useId();
  const [initial] = useState<Form>(() => ({
    name: user.name,
    email: user.email,
    notify: { requests: true, mentions: true, merged: false, digest: true },
    style: "balanced",
    includeDiff: true,
  }));
  const [saved, setSaved] = useState<Form>(initial);
  const [form, setForm] = useState<Form>(initial);
  const [save, setSave] = useState<SaveState>("idle");
  const timers = useRef<number[]>([]);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (save === "saved") setSave("idle");
  }

  function onSave() {
    if (!dirty || !emailValid || save === "saving") return;
    setSave("saving");
    timers.current.push(
      window.setTimeout(() => {
        setSaved(form);
        setSave("saved");
        timers.current.push(window.setTimeout(() => setSave("idle"), 1800));
      }, 700),
    );
  }

  return (
    <div className="page-content settings">
      <header className="page-head enter" style={{ "--i": 1 } as CSSProperties}>
        <div className="page-head-text">
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your profile, notifications and how {assistantName} answers PR questions.</p>
        </div>
      </header>

      <form
        className="settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <section className="card settings-card enter" style={{ "--i": 2 } as CSSProperties} aria-labelledby={`${id}-profile`}>
          <h2 id={`${id}-profile`} className="card-title">
            Profile
          </h2>
          <div className="profile-row">
            <Avatar src={user.avatar} size={40} />
            <div>
              <p className="profile-name">{form.name || "Unnamed"}</p>
              {user.role && <p className="profile-role">{user.role}</p>}
            </div>
          </div>
          <div className="fields">
            <label className="field">
              <span className="field-label">Display name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="nickname" />
            </label>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                aria-invalid={!emailValid}
                aria-describedby={`${id}-email-hint`}
              />
              <span id={`${id}-email-hint`} className="field-hint" data-error={!emailValid}>
                {emailValid ? "Used for review requests and the weekly digest." : "Enter a valid email address."}
              </span>
            </label>
          </div>
        </section>

        <section className="card settings-card enter" style={{ "--i": 2.5 } as CSSProperties} aria-labelledby={`${id}-notify`}>
          <h2 id={`${id}-notify`} className="card-title">
            Notifications
          </h2>
          <ul className="setting-list">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="setting-row">
                <div>
                  <p id={`${id}-n-${n.id}`} className="setting-title">
                    {n.title}
                  </p>
                  <p id={`${id}-n-${n.id}-d`} className="setting-detail">
                    {n.detail}
                  </p>
                </div>
                <Switch
                  checked={form.notify[n.id]}
                  onChange={(v) => update("notify", { ...form.notify, [n.id]: v })}
                  labelledBy={`${id}-n-${n.id}`}
                  describedBy={`${id}-n-${n.id}-d`}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="card settings-card enter" style={{ "--i": 3 } as CSSProperties} aria-labelledby={`${id}-assistant`}>
          <h2 id={`${id}-assistant`} className="card-title">
            {assistantName} assistant
          </h2>
          <ul className="setting-list">
            <li className="setting-row">
              <div>
                <p className="setting-title">Answer style</p>
                <p className="setting-detail">How much detail replies in the PR panel include.</p>
              </div>
              <Segmented label="Answer style" options={STYLES} value={form.style} onChange={(v) => update("style", v)} />
            </li>
            <li className="setting-row">
              <div>
                <p id={`${id}-diff`} className="setting-title">
                  Include the diff
                </p>
                <p id={`${id}-diff-d`} className="setting-detail">
                  Send changed lines along with the description for sharper answers.
                </p>
              </div>
              <Switch checked={form.includeDiff} onChange={(v) => update("includeDiff", v)} labelledBy={`${id}-diff`} describedBy={`${id}-diff-d`} />
            </li>
          </ul>
        </section>

        <section className="card settings-card enter" style={{ "--i": 3.5 } as CSSProperties} aria-labelledby={`${id}-look`}>
          <h2 id={`${id}-look`} className="card-title">
            Appearance
          </h2>
          <div className="setting-row">
            <div>
              <p id={`${id}-accent`} className="setting-title">
                Accent color
              </p>
              <p className="setting-detail">Tints buttons, selections and highlights. Applies right away.</p>
            </div>
            <div className="swatches" role="radiogroup" aria-labelledby={`${id}-accent`}>
              {(Object.keys(ACCENTS) as AnalyticsDashboardAccent[]).map((accentId) => (
                <button
                  key={accentId}
                  type="button"
                  role="radio"
                  aria-checked={accent === accentId}
                  aria-label={ACCENTS[accentId].label}
                  className="swatch press has-tip tip-top"
                  data-tip={ACCENTS[accentId].label}
                  style={{ "--swatch": ACCENTS[accentId].ui } as CSSProperties}
                  onClick={() => setAccent(accentId)}
                >
                  <CheckIcon size={13} strokeWidth={2.6} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="save-bar enter" style={{ "--i": 4 } as CSSProperties}>
          <p className="save-note" aria-live="polite">
            <span key={`${dirty}-${save}`} className="swap-in">
              {save === "saved" ? "All changes saved" : dirty ? "You have unsaved changes" : "Everything is up to date"}
            </span>
          </p>
          <button
            type="button"
            className="btn press"
            disabled={!dirty || save === "saving"}
            onClick={() => {
              setForm(saved);
              setSave("idle");
            }}
          >
            Reset
          </button>
          <button type="submit" className="btn btn-primary press" disabled={(!dirty && save !== "saved") || !emailValid} data-state={save}>
            <span key={save} className="swap-in btn-label">
              {save === "saved" && <CheckIcon size={14} strokeWidth={2.4} />}
              {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : "Save changes"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
```

### components/analytics-dashboard/ui.tsx

Installation target: `@components/analytics-dashboard/ui.tsx`

```tsx
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
```

### components/block/analytics-dashboard.css

Installation target: `@components/block/analytics-dashboard.css`

```css
/*
 * Analytics Dashboard. Every rule is scoped to .obsidian-analytics-dashboard, and
 * layout breakpoints are container queries on the dashboard's own width, so it
 * works full page, inside a panel, or in a preview.
 */
.obsidian-analytics-dashboard {
  /* Plain color behind the window. The `background` prop overrides it. */
  --obsidian-analytics-dashboard-background: var(--ad-stage);
  --obsidian-analytics-dashboard-window: var(--ad-window);
  --obsidian-analytics-dashboard-inset: 24px;
  --obsidian-analytics-dashboard-font-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --obsidian-analytics-dashboard-font-mono: var(--font-jetbrains-mono, "JetBrains Mono"), ui-monospace, "SF Mono", Menlo, monospace;
  container: analytics-dashboard / inline-size;
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: var(--obsidian-analytics-dashboard-inset);
  overflow: hidden;
  isolation: isolate;
  color-scheme: light;
  background: var(--obsidian-analytics-dashboard-background);
  font-family: var(--obsidian-analytics-dashboard-font-sans);
  font-size: 14.5px;
  line-height: 1.4;
  text-align: left;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "cv11";
}

/* Too narrow for a floating window: it fills the stage edge to edge. */
.obsidian-analytics-dashboard[data-compact="true"] {
  padding: 0;
}

.obsidian-analytics-dashboard :is(h1, h2, h3, p, dl, dt, dd, ol, ul, li, figure) {
  margin: 0;
  padding: 0;
}

.obsidian-analytics-dashboard .rail-logo-custom {
  display: grid;
  place-items: center;
  justify-self: center;
  width: 21px;
  height: 21px;
}

.obsidian-analytics-dashboard .rail-logo-custom > :is(svg, img) {
  width: 100%;
  height: 100%;
}

.obsidian-analytics-dashboard .avatar-empty {
  background: rgb(var(--ad-ink) / 0.1);
}

/* Design tokens: motion, surfaces, data colors and layout sizes. */
.obsidian-analytics-dashboard {
  /* Motion (transitions-dev scale + emil-design-eng curves) */
  --duration-quick: 150ms;
  --duration-fast: 250ms;
  --duration-slow: 400ms;
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-ui: cubic-bezier(0.2, 0, 0, 1);
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);

  /* Light palette. Text, borders and fills are --ad-ink at different strengths. */
  --ad-ink: 24 24 27;
  --ad-shadow: 0.28;
  --ad-stage: #f6f6f7;
  --ad-window: #eeeef0;
  --ad-main: #ffffff;
  --ad-surface: #ffffff;
  --ad-rail-float: rgb(238 238 240 / 0.97);
  --ad-composer: rgb(24 24 27 / 0.045);
  --ad-composer-focus: rgb(24 24 27 / 0.065);
  --ad-overlay: rgb(255 255 255 / 0.94);
  --ad-save-bar: rgb(255 255 255 / 0.9);

  --text: rgb(var(--ad-ink) / 0.92);
  --text-2: rgb(var(--ad-ink) / 0.62);
  --text-3: rgb(var(--ad-ink) / 0.42);
  --fill-1: rgb(var(--ad-ink) / 0.055);
  --fill-2: rgb(var(--ad-ink) / 0.08);
  --ring: 0 0 0 1px rgb(var(--ad-ink) / 0.075);
  --ring-strong: 0 0 0 1px rgb(var(--ad-ink) / 0.12);

  /* Overridden at runtime from Settings → Appearance */
  --accent: #4c9bff;

  /* Data colors, darkened enough to read on white */
  --orange: #ea6a1c;
  --purple: #7c5cf0;
  --green: #16a34a;
  --add-fg: #16a34a;
  --add-bg: rgba(22, 163, 74, 0.1);
  --del-fg: #dc2626;
  --del-bg: rgba(220, 38, 38, 0.1);
  --merged: #16a34a;
  --review: #d97706;
  --open: #2563eb;
  --bad: #dc2626;
  --star: #d99a06;

  /* Layout */
  --rail-step: 40px;
  --rail-w-compact: 54px;
  --rail-w-open: 180px;
  --details-w: 360px;

  /* Page entrance stagger; shortened once the window has landed */
  --enter-base: 180ms;
  --enter-step: 90ms;
}

/* Dark palette: follows a `dark` class on any ancestor, like the rest of the site. */
.dark .obsidian-analytics-dashboard,
.obsidian-analytics-dashboard.dark {
  color-scheme: dark;
  --ad-ink: 255 255 255;
  --ad-shadow: 1;
  --ad-stage: #0b0b0c;
  --ad-window: #121213;
  --ad-main: linear-gradient(100deg, #1b1a17 0%, #181816 48%, #16181b 100%);
  --ad-surface: #1a1a18;
  --ad-rail-float: rgba(22, 22, 24, 0.97);
  --ad-composer: rgba(52, 52, 52, 0.62);
  --ad-composer-focus: rgba(58, 58, 58, 0.7);
  --ad-overlay: rgba(14, 20, 32, 0.9);
  --ad-save-bar: rgba(32, 32, 30, 0.86);

  --orange: #f08a3c;
  --purple: #9d8df5;
  --green: #2fd06f;
  --add-fg: #3ddc7a;
  --add-bg: rgba(46, 204, 113, 0.12);
  --del-fg: #f04b4b;
  --del-bg: rgba(240, 75, 75, 0.12);
  --merged: #34d27b;
  --review: #f2b54a;
  --open: #5aa9ff;
  --bad: #f07a6a;
  --star: #f5c451;
}

@property --obsidian-analytics-dashboard-fade-top {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

/* Reset, typography defaults, accessibility helpers and shared motion. */

.obsidian-analytics-dashboard,
.obsidian-analytics-dashboard *,
.obsidian-analytics-dashboard *::before,
.obsidian-analytics-dashboard *::after {
  box-sizing: border-box;
}

.obsidian-analytics-dashboard h1,
.obsidian-analytics-dashboard h2,
.obsidian-analytics-dashboard p,
.obsidian-analytics-dashboard dl,
.obsidian-analytics-dashboard dd,
.obsidian-analytics-dashboard ol,
.obsidian-analytics-dashboard ul,
.obsidian-analytics-dashboard figure {
  margin: 0;
  padding: 0;
}

.obsidian-analytics-dashboard ul,
.obsidian-analytics-dashboard ol {
  list-style: none;
}

.obsidian-analytics-dashboard a {
  color: inherit;
  text-decoration: none;
}

.obsidian-analytics-dashboard button,
.obsidian-analytics-dashboard input,
.obsidian-analytics-dashboard textarea {
  font: inherit;
  color: inherit;
}

.obsidian-analytics-dashboard button {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.obsidian-analytics-dashboard button:disabled {
  cursor: default;
}

.obsidian-analytics-dashboard :focus-visible {
  outline: 2px solid color-mix(in oklab, var(--accent) 70%, white);
  outline-offset: 2px;
}

.obsidian-analytics-dashboard .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Slot numbers sit on the text baseline so "50 commits" reads as one line.
   The extra type selector outranks the module's own vertical-align. */

.obsidian-analytics-dashboard span.slot-num {
  vertical-align: baseline;
}

.obsidian-analytics-dashboard .press:not(:disabled):active {
  transform: scale(0.96);
}

/* ───────── Staggered entrance: one semantic chunk per --i step ───────── */

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .enter {
    animation: obsidian-ad-enter 300ms var(--ease-out-strong) both;
    animation-delay: calc(var(--enter-base) + var(--i, 0) * var(--enter-step));
  }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-analytics-dashboard .enter {
    animation: obsidian-ad-fade-in 300ms ease both;
    animation-delay: calc(var(--i, 0) * 40ms);
  }
}

@keyframes obsidian-ad-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(4px);
  }
}

@keyframes obsidian-ad-fade-in {
  from {
    opacity: 0;
  }
}

/* ───────── Text swap for labels that change in place ───────── */

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .swap-in {
    display: inline-block;
    animation: obsidian-ad-swap-in 250ms ease-in-out both;
  }
}

@keyframes obsidian-ad-swap-in {
  from {
    opacity: 0;
    transform: translateY(4px);
    filter: blur(2px);
  }
}

/* ───────── Shimmer text (transitions-dev #15) ───────── */

.obsidian-analytics-dashboard .shimmer {
  background: linear-gradient(
      90deg,
      rgb(var(--ad-ink) / 0.38) 0%,
      rgb(var(--ad-ink) / 0.38) 40%,
      rgb(var(--ad-ink)) 50%,
      rgb(var(--ad-ink) / 0.38) 60%,
      rgb(var(--ad-ink) / 0.38) 100%
    )
    0 0 / 400% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .shimmer {
    animation: obsidian-ad-shimmer 2000ms linear infinite;
  }
}

@keyframes obsidian-ad-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0% 0;
  }
}

/* App frame shared by every route: window, rail, tooltips, main panel, page header. */

/* ───────── Window ───────── */

.obsidian-analytics-dashboard .window {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  --rail-w: var(--rail-w-compact);
  display: grid;
  grid-template-columns: var(--rail-w) minmax(0, 1fr) var(--details-w);
  border: 1px solid transparent;
  border-radius: 22px;
  /* clip, not hidden: a hidden box is still scrollable, so focusing something in
     the off-screen PR panel would scroll the whole window sideways. */
  overflow: clip;
  background: var(--obsidian-analytics-dashboard-window);
  box-shadow:
    inset 0 1px 0 rgb(var(--ad-ink) / 0.1),
    inset 0 0 0 1px rgb(var(--ad-ink) / 0.07),
    0 0 0 1px rgb(0 0 0 / calc(0.28 * var(--ad-shadow))),
    0 40px 90px -24px rgb(0 0 0 / calc(0.6 * var(--ad-shadow))),
    0 14px 28px -14px rgb(0 0 0 / calc(0.45 * var(--ad-shadow)));
  transition: grid-template-columns 300ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .window[data-collapsed="true"] {
  grid-template-columns: var(--rail-w) minmax(0, 1fr) 0px;
}

.obsidian-analytics-dashboard .window[data-nav-open="true"] {
  --rail-w: var(--rail-w-open);
}

.obsidian-analytics-dashboard .window[data-booted="true"] {
  --enter-base: 20ms;
  --enter-step: 55ms;
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .window {
    animation: obsidian-ad-window-in 700ms var(--ease-out-strong) both;
  }
}

@keyframes obsidian-ad-window-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
    filter: blur(6px);
  }
}

/* ───────── Rail ───────── */

/* Every rail row is a 38px icon column plus a label column. The label column
   is 0px wide while compact, so icons never move when the rail expands. */

.obsidian-analytics-dashboard .rail {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  padding: 17px 8px 14px;
  min-width: 0;
  min-height: 0;
}

.obsidian-analytics-dashboard .rail-brand,
.obsidian-analytics-dashboard .rail-btn,
.obsidian-analytics-dashboard .rail-account {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  width: 100%;
}

.obsidian-analytics-dashboard .rail-icon {
  justify-self: center;
}

/* Buttons center their text by default, which pushes labels away from their icons. */
.obsidian-analytics-dashboard .rail-label {
  min-width: 0;
  padding-left: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  text-overflow: ellipsis;
  font-size: 14px;
  line-height: 20px;
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.obsidian-analytics-dashboard .rail[data-expanded="true"] .rail-label {
  opacity: 1;
  transform: none;
  transition:
    opacity 220ms ease 70ms,
    transform 300ms var(--ease-smooth-out) 40ms;
}

/* Labels replace tooltips once they're visible */

.obsidian-analytics-dashboard .rail[data-expanded="true"] .has-tip::after {
  display: none;
}

.obsidian-analytics-dashboard .rail-brand {
  height: 21px;
  border-radius: 6px;
}

.obsidian-analytics-dashboard .rail-brand-name {
  font-weight: 600;
  letter-spacing: -0.005em;
  color: rgb(var(--ad-ink));
}

.obsidian-analytics-dashboard .rail-logo {
  position: relative;
  justify-self: center;
  display: block;
  width: 21px;
  height: 21px;
  border-radius: 5px;
  overflow: hidden;
  background:
    linear-gradient(128deg, transparent 38%, rgba(255, 255, 255, 0.95) 46%, rgba(220, 238, 255, 0.9) 54%, transparent 64%),
    radial-gradient(70% 70% at 85% 90%, #d9ecff 0%, transparent 70%),
    linear-gradient(150deg, #7fb6ee 0%, #2a64c9 34%, #1b3f96 52%, #5c9de6 78%, #cfe6ff 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    0 2px 6px rgba(10, 40, 110, 0.35);
  transition: transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .rail-logo-shine {
  position: absolute;
  inset: -40%;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.85) 50%, transparent 60%);
  transform: translateX(-70%);
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .rail-logo-shine {
    transition: transform 700ms var(--ease-smooth-out);
  }
  .obsidian-analytics-dashboard .rail-brand:hover .rail-logo-shine {
    transform: translateX(70%);
  }
}

.obsidian-analytics-dashboard .rail-nav {
  position: relative;
  margin-top: 15px;
}

.obsidian-analytics-dashboard .rail-list {
  display: flex;
  flex-direction: column;
}

.obsidian-analytics-dashboard .rail-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  height: 36px;
  border-radius: 10px;
  background: rgb(var(--ad-ink) / 0.075);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.05);
  transform: translateY(calc(var(--active, 0) * var(--rail-step)));
  transition:
    transform var(--duration-fast) var(--ease-smooth-out),
    opacity var(--duration-quick) ease;
  pointer-events: none;
}

.obsidian-analytics-dashboard .rail-indicator[data-hidden="true"] {
  opacity: 0;
}

.obsidian-analytics-dashboard .rail-btn {
  position: relative;
  height: var(--rail-step);
  border-radius: 10px;
  color: rgb(var(--ad-ink) / 0.5);
  transition:
    color var(--duration-quick) ease,
    background-color var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .rail-btn[data-active="true"] {
  color: rgb(var(--ad-ink));
}

.obsidian-analytics-dashboard .rail-account {
  position: relative;
  height: 40px;
  margin-top: auto;
  border-radius: 10px;
  transition:
    background-color var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .rail-account-text {
  display: flex;
  flex-direction: column;
  line-height: 16px;
}

.obsidian-analytics-dashboard .rail-account-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
}

.obsidian-analytics-dashboard .rail-account-mail {
  font-size: 11.5px;
  color: var(--text-3);
  text-overflow: ellipsis;
  overflow: hidden;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .rail-btn:hover {
    color: rgb(var(--ad-ink) / 0.9);
  }
  .obsidian-analytics-dashboard .rail[data-expanded="true"] .rail-btn:not([data-active="true"]):hover,
  .obsidian-analytics-dashboard .rail[data-expanded="true"] .rail-account:hover {
    background-color: rgb(var(--ad-ink) / 0.04);
  }
}

.obsidian-analytics-dashboard .avatar-img {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  outline: 1px solid oklch(1 0 0 / 0.1);
  outline-offset: -1px;
}

/* ───────── Tooltips ─────────
   Drawn from data-tip with a pseudo-element, so tooltip text never shows up
   in copied page text and screen readers rely on the element's own label. */

.obsidian-analytics-dashboard .has-tip {
  position: relative;
}

.obsidian-analytics-dashboard .has-tip::after {
  content: attr(data-tip);
  position: absolute;
  z-index: 30;
  padding: 6px 9px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(30, 32, 38, 0.97);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 4px 14px rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 50ms ease-out,
    transform 50ms ease-out;
}

.obsidian-analytics-dashboard .tip-right::after {
  left: calc(100% + 10px);
  top: 50%;
  transform: translate(0, -50%) scale(0.97);
  transform-origin: 0 50%;
}

.obsidian-analytics-dashboard .tip-top::after {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translate(-50%, 0) scale(0.97);
  transform-origin: 50% 100%;
}

/* Below the trigger, aligned to its start edge (or end edge with .tip-end) so
   tips near the panel edges never get clipped. */

.obsidian-analytics-dashboard .tip-below::after {
  top: calc(100% + 8px);
  left: 0;
  transform: translateY(-2px) scale(0.97);
  transform-origin: 14px 0;
}

.obsidian-analytics-dashboard .tip-below.tip-end::after {
  left: auto;
  right: 0;
  transform-origin: calc(100% - 14px) 0;
}

.obsidian-analytics-dashboard .has-tip:focus-visible::after {
  opacity: 1;
  transition-duration: 150ms;
}

.obsidian-analytics-dashboard .tip-right:focus-visible::after {
  transform: translate(0, -50%) scale(1);
}

.obsidian-analytics-dashboard .tip-top:focus-visible::after {
  transform: translate(-50%, 0) scale(1);
}

.obsidian-analytics-dashboard .tip-below:focus-visible::after {
  transform: none;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .has-tip:hover::after {
    opacity: 1;
    transition-duration: 150ms;
    transition-delay: 80ms;
  }
  .obsidian-analytics-dashboard .tip-right:hover::after {
    transform: translate(0, -50%) scale(1);
  }
  .obsidian-analytics-dashboard .tip-top:hover::after {
    transform: translate(-50%, 0) scale(1);
  }
  .obsidian-analytics-dashboard .tip-below:hover::after {
    transform: none;
  }
}

/* ───────── Main panel ───────── */

.obsidian-analytics-dashboard .main {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  margin: 7px 0;
  border: 1px solid transparent;
  border-radius: 15px;
  overflow: hidden;
  background: var(--ad-main);
  box-shadow:
    0 0 0 1px rgb(var(--ad-ink) / 0.055),
    0 10px 30px -12px rgb(0 0 0 / calc(0.55 * var(--ad-shadow)));
  transition: margin 300ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .window[data-collapsed="true"] .main {
  margin-right: 7px;
}

/* z-index keeps the bar's tooltips above page content that animates in later */

.obsidian-analytics-dashboard .main-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 44px;
  padding: 0 5px;
  flex-shrink: 0;
}

.obsidian-analytics-dashboard .panel-icon-fill {
  opacity: 0;
  transition: opacity 200ms ease;
}

.obsidian-analytics-dashboard .panel-icon-fill[data-open="true"] {
  opacity: 0.4;
}

/* Shown only while the PR panel is hidden; fades in after the panel has moved away */

.obsidian-analytics-dashboard .icon-btn.details-reopen {
  margin-left: auto;
  opacity: 0;
  transform: scale(0.85);
  filter: blur(3px);
  pointer-events: none;
  transition:
    opacity 150ms var(--ease-ui),
    transform 150ms var(--ease-ui),
    filter 150ms var(--ease-ui),
    background-color var(--duration-quick) ease,
    color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .details-reopen[data-visible="true"] {
  opacity: 1;
  transform: none;
  filter: none;
  pointer-events: auto;
  transition-duration: 200ms, 200ms, 200ms, var(--duration-quick), var(--duration-quick);
  transition-delay: 120ms, 120ms, 120ms, 0ms, 0ms;
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-analytics-dashboard .icon-btn.details-reopen,
  .obsidian-analytics-dashboard .details-reopen[data-visible="true"] {
    transform: none;
    filter: none;
  }
}

.obsidian-analytics-dashboard .main-bar-title {
  font-size: 14px;
  color: rgb(var(--ad-ink) / 0.82);
}

.obsidian-analytics-dashboard .icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: rgb(var(--ad-ink) / 0.6);
  transition:
    background-color var(--duration-quick) ease,
    color var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .icon-btn:hover {
    background-color: rgb(var(--ad-ink) / 0.06);
    color: rgb(var(--ad-ink));
  }
}

.obsidian-analytics-dashboard .main-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--ad-ink) / 0.12) transparent;
}

/* ───────── Page frame (every route renders inside .page) ───────── */

.obsidian-analytics-dashboard .page-content {
  container: page / inline-size;
  padding: 34px 28px 32px 50px;
}

.obsidian-analytics-dashboard .page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.obsidian-analytics-dashboard .page-head-text {
  min-width: 0;
}

.obsidian-analytics-dashboard .page-title {
  font-size: 33px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.022em;
  color: rgb(var(--ad-ink));
}

.obsidian-analytics-dashboard .page-sub {
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-3);
  text-wrap: pretty;
}

.obsidian-analytics-dashboard .block {
  margin-top: 28px;
}

.obsidian-analytics-dashboard .block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.obsidian-analytics-dashboard .block-title {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.5);
}

.obsidian-analytics-dashboard .toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.obsidian-analytics-dashboard .scrim {
  display: none;
}

/* ───────── Responsive frame ───────── */

@container analytics-dashboard (max-width: 1180px) {
  .obsidian-analytics-dashboard .window,
  .obsidian-analytics-dashboard .window[data-collapsed="true"] {
    grid-template-columns: var(--rail-w) minmax(0, 1fr);
  }

  .obsidian-analytics-dashboard .main,
  .obsidian-analytics-dashboard .window[data-collapsed="true"] .main {
    margin-right: 7px;
  }

  .obsidian-analytics-dashboard .scrim {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 5;
    background: rgb(0 0 0 / calc(0.3 * var(--ad-shadow)));
    opacity: 0;
    pointer-events: none;
    cursor: default;
    transition: opacity 300ms ease;
  }

  .obsidian-analytics-dashboard .window[data-scrim="true"] .scrim {
    opacity: 1;
    pointer-events: auto;
  }
}

@container analytics-dashboard (max-width: 960px) {
  .obsidian-analytics-dashboard .page-content {
    padding: 28px 20px 28px 28px;
  }
}

@container analytics-dashboard (max-width: 760px) {
  .obsidian-analytics-dashboard .window {
    height: 100%;
    min-height: 0;
    border-radius: 0;
  }

  /* Too narrow to push content aside: the expanded rail floats over it instead */
  .obsidian-analytics-dashboard .window[data-nav-open="true"] {
    --rail-w: var(--rail-w-compact);
  }

  .obsidian-analytics-dashboard .rail {
    position: relative;
    z-index: 6;
    width: var(--rail-w-compact);
    border-radius: 0 16px 16px 0;
    transition:
      width 300ms var(--ease-smooth-out),
      background-color 300ms ease,
      box-shadow 300ms ease;
  }

  .obsidian-analytics-dashboard .rail[data-expanded="true"] {
    width: var(--rail-w-open);
    background-color: var(--ad-rail-float);
    box-shadow:
      1px 0 0 rgb(var(--ad-ink) / 0.07),
      24px 0 48px -16px rgb(0 0 0 / calc(0.6 * var(--ad-shadow)));
  }

  .obsidian-analytics-dashboard .page-content {
    padding: 22px 16px 28px 18px;
  }

  .obsidian-analytics-dashboard .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@container analytics-dashboard (max-width: 520px) {
  .obsidian-analytics-dashboard .page-content {
    padding: 18px 12px 24px 14px;
  }

  .obsidian-analytics-dashboard .page-title {
    font-size: 26px;
  }

  .obsidian-analytics-dashboard .btn-details {
    width: auto;
    height: 32px;
    padding: 0 12px;
    font-size: 13.5px;
  }
}

/* Reusable primitives from components/ui.tsx and shared building blocks. */

/* ───────── Card ───────── */

.obsidian-analytics-dashboard .card {
  border: 1px solid transparent;
  border-radius: 14px;
  background-color: var(--fill-1);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.025);
}

.obsidian-analytics-dashboard .card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.obsidian-analytics-dashboard .card-title {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.78);
}

/* ───────── Segmented control (sliding thumb) ───────── */

.obsidian-analytics-dashboard .seg {
  position: relative;
  flex: none;
  display: inline-grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  padding: 3px;
  border-radius: 10px;
  background: rgb(var(--ad-ink) / 0.045);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.06);
}

.obsidian-analytics-dashboard .seg-thumb {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / var(--n));
  border-radius: 7px;
  background: rgb(var(--ad-ink) / 0.1);
  box-shadow:
    inset 0 0 0 1px rgb(var(--ad-ink) / 0.06),
    0 1px 3px rgb(0 0 0 / calc(0.3 * var(--ad-shadow)));
  transform: translateX(calc(var(--idx) * 100%));
  transition: transform var(--duration-fast) var(--ease-smooth-out);
  pointer-events: none;
}

.obsidian-analytics-dashboard .seg-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 14px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  color: rgb(var(--ad-ink) / 0.5);
  transition: color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .seg-btn[aria-checked="true"] {
  color: rgb(var(--ad-ink));
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .seg-btn[aria-checked="false"]:hover {
    color: rgb(var(--ad-ink) / 0.8);
  }
}

.obsidian-analytics-dashboard .seg-count {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 11.5px;
  line-height: 17px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--ad-ink) / 0.6);
  background: rgb(var(--ad-ink) / 0.07);
}

.obsidian-analytics-dashboard .seg-btn[aria-checked="true"] .seg-count {
  color: rgb(var(--ad-ink));
  background: color-mix(in oklab, var(--accent) 32%, transparent);
}

/* ───────── Switch ───────── */

.obsidian-analytics-dashboard .switch {
  position: relative;
  flex: none;
  width: 36px;
  height: 21px;
  border-radius: 999px;
  background-color: rgb(var(--ad-ink) / 0.13);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.05);
  transition: background-color 200ms var(--ease-ui);
}

.obsidian-analytics-dashboard .switch[aria-checked="true"] {
  background-color: var(--accent);
}

.obsidian-analytics-dashboard .switch-thumb {
  position: absolute;
  top: 2.5px;
  left: 2.5px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / calc(0.35 * var(--ad-shadow)));
  transition:
    transform 250ms var(--ease-smooth-out),
    width 150ms var(--ease-ui);
}

.obsidian-analytics-dashboard .switch[aria-checked="true"] .switch-thumb {
  transform: translateX(15px);
}

/* The thumb stretches while pressed, like a physical toggle. */

.obsidian-analytics-dashboard .switch:active .switch-thumb {
  width: 19px;
}

.obsidian-analytics-dashboard .switch[aria-checked="true"]:active .switch-thumb {
  transform: translateX(12px);
}

/* ───────── Status ───────── */

.obsidian-analytics-dashboard .pill {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 9px 0 7px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
}

.obsidian-analytics-dashboard .pill[data-kind="merged"] {
  color: var(--merged);
  background: rgba(52, 210, 123, 0.1);
}

.obsidian-analytics-dashboard .pill[data-kind="review"] {
  color: var(--review);
  background: rgba(242, 181, 74, 0.1);
}

.obsidian-analytics-dashboard .pill[data-kind="open"] {
  color: var(--open);
  background: rgba(90, 169, 255, 0.1);
}

.obsidian-analytics-dashboard .status-dot {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.obsidian-analytics-dashboard .status-dot[data-kind="merged"] {
  color: var(--merged);
  background: rgba(52, 210, 123, 0.1);
}

.obsidian-analytics-dashboard .status-dot[data-kind="review"] {
  color: var(--review);
  background: rgba(242, 181, 74, 0.1);
}

.obsidian-analytics-dashboard .status-dot[data-kind="open"] {
  color: var(--open);
  background: rgba(90, 169, 255, 0.1);
}

/* ───────── Badges and tags ───────── */

.obsidian-analytics-dashboard .badge {
  display: inline-grid;
  place-items: center;
  min-width: 44px;
  height: 22px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.obsidian-analytics-dashboard .badge-add {
  color: var(--add-fg);
  background: var(--add-bg);
}

.obsidian-analytics-dashboard .badge-del {
  color: var(--del-fg);
  background: var(--del-bg);
}

.obsidian-analytics-dashboard .tag {
  flex: none;
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.55);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.1);
}

/* ───────── Avatars ───────── */

.obsidian-analytics-dashboard .avatar {
  flex: none;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  outline: 1px solid oklch(1 0 0 / 0.1);
  outline-offset: -1px;
}

.obsidian-analytics-dashboard .avatar-40 {
  width: 40px;
  height: 40px;
}

.obsidian-analytics-dashboard .avatar-32 {
  width: 32px;
  height: 32px;
}

.obsidian-analytics-dashboard .avatar-22 {
  width: 22px;
  height: 22px;
}

/* ───────── Buttons ───────── */

.obsidian-analytics-dashboard .btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  background-color: rgb(var(--ad-ink) / 0.04);
  box-shadow: var(--ring);
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease,
    opacity var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .btn:disabled {
  opacity: 0.45;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .btn:not(:disabled):hover {
    background-color: rgb(var(--ad-ink) / 0.08);
    box-shadow: var(--ring-strong);
  }
}

.obsidian-analytics-dashboard .btn-primary {
  min-width: 128px;
  color: #fff;
  background-color: color-mix(in oklab, var(--accent) 82%, black);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .btn-primary:not(:disabled):hover {
    background-color: var(--accent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }
}

.obsidian-analytics-dashboard .btn-primary[data-state="saved"] {
  background-color: color-mix(in oklab, var(--merged) 70%, black);
}

.obsidian-analytics-dashboard .btn-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.obsidian-analytics-dashboard .btn-details {
  flex: none;
  width: 78px;
  height: 35px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14.5px;
  font-weight: 450;
  color: var(--text);
  background-color: rgb(var(--ad-ink) / 0.025);
  box-shadow: var(--ring);
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .btn-details[aria-pressed="true"] {
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 45%, transparent);
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .btn-details:hover {
    background-color: rgb(var(--ad-ink) / 0.07);
    box-shadow: var(--ring-strong);
  }
}

.obsidian-analytics-dashboard .link-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  margin-right: -8px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgb(var(--ad-ink) / 0.55);
  transition:
    color var(--duration-quick) ease,
    background-color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .link-more svg {
  transition: transform var(--duration-fast) var(--ease-smooth-out);
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .link-more:hover {
    color: rgb(var(--ad-ink));
    background-color: rgb(var(--ad-ink) / 0.05);
  }
  .obsidian-analytics-dashboard .link-more:hover svg {
    transform: translateX(2px);
  }
}

/* ───────── Search ───────── */

.obsidian-analytics-dashboard .search {
  position: relative;
  flex: 1;
  max-width: 340px;
  display: flex;
  align-items: center;
}

.obsidian-analytics-dashboard .search-icon {
  position: absolute;
  left: 11px;
  color: rgb(var(--ad-ink) / 0.4);
  pointer-events: none;
}

.obsidian-analytics-dashboard .search input {
  width: 100%;
  height: 34px;
  padding: 0 12px 0 33px;
  border: 0;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  background: rgb(var(--ad-ink) / 0.045);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.06);
  transition:
    box-shadow var(--duration-quick) ease,
    background-color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .search input::placeholder {
  color: rgb(var(--ad-ink) / 0.38);
}

.obsidian-analytics-dashboard .search input:focus-visible {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 65%, transparent);
}

/* ───────── Empty state ───────── */

.obsidian-analytics-dashboard .empty {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 48px 20px;
  border-radius: 14px;
  text-align: center;
  background: rgb(var(--ad-ink) / 0.03);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.05);
}

.obsidian-analytics-dashboard .empty-title {
  font-size: 15px;
  font-weight: 500;
}

.obsidian-analytics-dashboard .empty-sub {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-3);
}

/* ───────── Sparkline ───────── */

.obsidian-analytics-dashboard .spark {
  display: block;
  width: 100%;
  height: 34px;
  overflow: visible;
  color: var(--accent);
}

.obsidian-analytics-dashboard .spark[data-tone="bad"] {
  color: var(--bad);
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .spark {
    animation: obsidian-ad-spark-reveal 900ms var(--ease-smooth-out) both;
    animation-delay: calc(var(--enter-base) + 260ms);
  }
  .obsidian-analytics-dashboard .spark-dot {
    animation: obsidian-ad-fade-in 300ms ease both;
    animation-delay: calc(var(--enter-base) + 900ms);
  }
}

@keyframes obsidian-ad-spark-reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* ───────── PR row (Overview "Today PRs") ───────── */

.obsidian-analytics-dashboard .pr-list {
  display: flex;
  flex-direction: column;
  margin: 4px -10px 0;
}

.obsidian-analytics-dashboard .pr-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 59px;
  padding: 0 10px;
  border-radius: 12px;
  transition: background-color var(--duration-quick) ease;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .pr-row:hover {
    background-color: rgb(var(--ad-ink) / 0.03);
  }
}

.obsidian-analytics-dashboard .pr-text {
  flex: 1;
  min-width: 0;
}

.obsidian-analytics-dashboard .pr-title {
  font-size: 15px;
  line-height: 21px;
  color: rgb(var(--ad-ink) / 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.obsidian-analytics-dashboard .pr-sub {
  margin-top: 2px;
  font-size: 13.5px;
  line-height: 19px;
  color: var(--text-3);
}

@container analytics-dashboard (max-width: 760px) {
  .obsidian-analytics-dashboard .pr-title {
    white-space: normal;
  }
}

@container analytics-dashboard (max-width: 520px) {
  .obsidian-analytics-dashboard .pr-row .pill {
    display: none;
  }
}

/* PR details side panel: content swap, accordions, conversation and composer. */

.obsidian-analytics-dashboard .details {
  grid-column: 3;
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--details-w);
  min-height: 0;
  transition: opacity 250ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .window[data-collapsed="true"] .details {
  opacity: 0;
  pointer-events: none;
}

/* The 28px hide button starts at 11.5px so its 15px glyph sits on the 18px content edge. */

.obsidian-analytics-dashboard .details-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 44px;
  margin-top: 7px;
  padding: 0 20px 0 11.5px;
  flex-shrink: 0;
}

.obsidian-analytics-dashboard .details-hide {
  flex: none;
}

.obsidian-analytics-dashboard .details-bar-title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--ad-ink) / 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.obsidian-analytics-dashboard .details-scroll {
  --obsidian-analytics-dashboard-fade-top: 0px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  padding: 0 20px 164px 18px;
  /* Text fades out as it slides under the floating composer */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--obsidian-analytics-dashboard-fade-top),
    #000 calc(100% - 158px),
    rgb(0 0 0 / calc(0.36 * var(--ad-shadow))) calc(100% - 124px),
    rgb(0 0 0 / calc(0.14 * var(--ad-shadow))) calc(100% - 104px),
    transparent calc(100% - 96px)
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--obsidian-analytics-dashboard-fade-top),
    #000 calc(100% - 158px),
    rgb(0 0 0 / calc(0.36 * var(--ad-shadow))) calc(100% - 124px),
    rgb(0 0 0 / calc(0.14 * var(--ad-shadow))) calc(100% - 104px),
    transparent calc(100% - 96px)
  );
  transition: --obsidian-analytics-dashboard-fade-top 200ms ease;
}

.obsidian-analytics-dashboard .details-scroll::-webkit-scrollbar {
  display: none;
}

.obsidian-analytics-dashboard .details-scroll[data-scrolled="true"] {
  --obsidian-analytics-dashboard-fade-top: 28px;
}

.obsidian-analytics-dashboard .details-body {
  padding-top: 14px;
}

/* ───────── Content swap between PRs ───────── */

.obsidian-analytics-dashboard .details-swap {
  transition:
    opacity 300ms var(--ease-out-strong),
    transform 300ms var(--ease-out-strong),
    filter 300ms var(--ease-out-strong);
}

.obsidian-analytics-dashboard .details-swap[data-phase="out"] {
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(4px);
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.obsidian-analytics-dashboard .details-swap[data-phase="pre"] {
  opacity: 0;
  transform: translateY(12px);
  filter: blur(4px);
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-analytics-dashboard .details-swap,
  .obsidian-analytics-dashboard .details-swap[data-phase] {
    transform: none;
    filter: none;
  }
}

.obsidian-analytics-dashboard .status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 20px;
}

.obsidian-analytics-dashboard .status[data-kind="merged"] {
  color: var(--merged);
}

.obsidian-analytics-dashboard .status[data-kind="review"] {
  color: var(--review);
}

.obsidian-analytics-dashboard .status[data-kind="open"] {
  color: var(--open);
}

.obsidian-analytics-dashboard .details-title {
  margin-top: 7px;
  font-size: 19.5px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.01em;
  color: rgb(var(--ad-ink));
  text-wrap: pretty;
}

.obsidian-analytics-dashboard .kv {
  margin-top: 13px;
  display: flex;
  flex-direction: column;
}

.obsidian-analytics-dashboard .kv > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 28.5px;
}

.obsidian-analytics-dashboard .kv dt {
  font-size: 14.5px;
  color: var(--text-3);
}

.obsidian-analytics-dashboard .kv dd {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  color: rgb(var(--ad-ink) / 0.9);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ───────── Accordion (transitions-dev #21) ───────── */

.obsidian-analytics-dashboard .kv + .acc {
  margin-top: 24px;
}

.obsidian-analytics-dashboard .acc + .acc {
  margin-top: 14px;
}

.obsidian-analytics-dashboard .acc-head {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 24px;
  font-size: 14.5px;
  font-weight: 500;
  color: rgb(var(--ad-ink) / 0.5);
  border-radius: 6px;
  transition: color var(--duration-quick) ease;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .acc-head:hover {
    color: rgb(var(--ad-ink) / 0.78);
  }
}

.obsidian-analytics-dashboard .acc-tri {
  color: rgb(var(--ad-ink) / 0.45);
  transform: rotate(0deg);
  transition: transform 250ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .acc[data-open="true"] .acc-tri {
  transform: rotate(90deg);
}

.obsidian-analytics-dashboard .acc-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .acc[data-open="true"] .acc-panel {
  grid-template-rows: 1fr;
}

.obsidian-analytics-dashboard .acc-inner {
  overflow: hidden;
  opacity: 0;
  filter: blur(2px);
  transition:
    opacity 250ms var(--ease-smooth-out),
    filter 250ms var(--ease-smooth-out);
}

.obsidian-analytics-dashboard .acc[data-open="true"] .acc-inner {
  opacity: 1;
  filter: blur(0);
}

.obsidian-analytics-dashboard .acc-inner p {
  padding-right: 8px;
  font-size: 14.5px;
  line-height: 20.5px;
  color: rgb(var(--ad-ink) / 0.88);
  text-wrap: pretty;
}

.obsidian-analytics-dashboard .acc-inner p:first-child {
  padding-top: 8px;
}

.obsidian-analytics-dashboard .acc-inner p + p {
  margin-top: 9px;
}

.obsidian-analytics-dashboard .code-chip {
  font-family: var(--obsidian-analytics-dashboard-font-mono), ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12.5px;
  padding: 2px 6px;
  border-radius: 6px;
  color: rgb(var(--ad-ink) / 0.72);
  background: rgb(var(--ad-ink) / 0.08);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-analytics-dashboard .acc-panel,
  .obsidian-analytics-dashboard .acc-inner,
  .obsidian-analytics-dashboard .acc-tri {
    transition: none !important;
  }
}

/* ───────── Conversation ───────── */

.obsidian-analytics-dashboard .thread {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.obsidian-analytics-dashboard .msg {
  font-size: 14.5px;
  line-height: 20.5px;
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .msg {
    animation: obsidian-ad-enter 300ms var(--ease-out-strong) both;
  }
}

.obsidian-analytics-dashboard .msg-user {
  align-self: flex-end;
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 14px 14px 4px 14px;
  background: rgb(var(--ad-ink) / 0.09);
  color: rgb(var(--ad-ink));
}

.obsidian-analytics-dashboard .msg-assistant {
  color: rgb(var(--ad-ink) / 0.86);
}

/* ───────── Composer ───────── */

.obsidian-analytics-dashboard .composer-slot {
  position: absolute;
  left: 18px;
  right: 14px;
  bottom: 15px;
}

.obsidian-analytics-dashboard .composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 10px 10px;
  border: 1px solid transparent;
  border-radius: 16px;
  background-color: var(--ad-composer);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.05);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .composer:focus-within {
  background-color: var(--ad-composer-focus);
  box-shadow:
    inset 0 0 0 1px rgb(var(--ad-ink) / 0.14),
    0 8px 24px -8px rgb(0 0 0 / calc(0.45 * var(--ad-shadow)));
}

.obsidian-analytics-dashboard .composer-input {
  display: block;
  width: 100%;
  min-height: 22px;
  max-height: 120px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 14.5px;
  line-height: 22px;
  color: rgb(var(--ad-ink));
  field-sizing: content;
  scrollbar-width: none;
}

.obsidian-analytics-dashboard .composer-input::placeholder {
  color: rgb(var(--ad-ink) / 0.52);
}

.obsidian-analytics-dashboard .composer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.obsidian-analytics-dashboard .chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 29px;
  padding: 0 12px 0 10px;
  border-radius: 999px;
  font-size: 14.5px;
  color: rgb(var(--ad-ink) / 0.75);
  background-color: rgb(var(--ad-ink) / 0.07);
  transition:
    background-color var(--duration-quick) ease,
    color var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .chip:hover {
    background-color: rgb(var(--ad-ink) / 0.11);
    color: rgb(var(--ad-ink));
  }
}

.obsidian-analytics-dashboard .claude-icon {
  transition: transform 400ms var(--ease-smooth-out);
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .chip-claude:hover .claude-icon {
    transform: rotate(40deg) scale(1.08);
  }
}

.obsidian-analytics-dashboard .send {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  border-radius: 50%;
  color: var(--ad-window);
  background-color: rgb(var(--ad-ink));
  transition:
    opacity 200ms var(--ease-ui),
    transform 200ms var(--ease-ui),
    filter 200ms var(--ease-ui);
}

.obsidian-analytics-dashboard .send:disabled {
  opacity: 0;
  transform: scale(0.8);
  filter: blur(4px);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-analytics-dashboard .send,
  .obsidian-analytics-dashboard .send:disabled {
    transform: none;
    filter: none;
  }
}

/* ───────── Slide-over below the desktop breakpoint ───────── */

@container analytics-dashboard (max-width: 1180px) {
  /* grid-column: auto makes the whole window the containing block; column 3
     no longer exists here, which would collapse the panel to zero width. */
  .obsidian-analytics-dashboard .details,
  .obsidian-analytics-dashboard .window[data-collapsed="true"] .details {
    grid-column: auto;
    position: absolute;
    z-index: 6;
    top: 7px;
    right: 7px;
    bottom: 7px;
    width: min(380px, calc(100% - 68px));
    border: 1px solid transparent;
    border-radius: 15px;
    background: var(--ad-overlay);
    backdrop-filter: blur(30px) saturate(160%);
    -webkit-backdrop-filter: blur(30px) saturate(160%);
    box-shadow:
      0 0 0 1px rgb(var(--ad-ink) / 0.08),
      0 24px 60px -12px rgb(0 0 0 / calc(0.6 * var(--ad-shadow)));
    opacity: 0;
    transform: translateX(calc(100% + 16px));
    visibility: hidden;
    pointer-events: none;
    transition:
      transform 350ms var(--ease-smooth-out),
      opacity 350ms var(--ease-smooth-out),
      visibility 0s linear 350ms;
  }

  .obsidian-analytics-dashboard .details[data-open="true"],
  .obsidian-analytics-dashboard .window[data-collapsed="true"] .details[data-open="true"] {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
    pointer-events: auto;
    transition:
      transform 400ms var(--ease-smooth-out),
      opacity 400ms var(--ease-smooth-out),
      visibility 0s;
  }

  .obsidian-analytics-dashboard .details-bar {
    margin-top: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .obsidian-analytics-dashboard .details,
    .obsidian-analytics-dashboard .details[data-open="true"] {
      transform: none;
    }
  }
}

/* Overview route: KPI cards, commit activity chart, contributor leaderboard. */

/* ───────── KPI cards ───────── */

.obsidian-analytics-dashboard .stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}

.obsidian-analytics-dashboard .stat {
  display: flex;
  flex-direction: column;
  padding: 13px 15px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background-color: var(--fill-1);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.025);
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .stat:hover {
    background-color: rgb(var(--ad-ink) / 0.075);
    box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.05);
  }
  .obsidian-analytics-dashboard .stat:hover .stat-icon {
    color: rgb(var(--ad-ink) / 0.85);
  }
}

.obsidian-analytics-dashboard .stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 10px 0 8px;
}

.obsidian-analytics-dashboard .stat-label {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.obsidian-analytics-dashboard .stat-icon {
  flex: none;
  color: rgb(var(--ad-ink) / 0.5);
  transition: color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .delta {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 21px;
  padding: 0 7px 0 5px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.obsidian-analytics-dashboard .delta[data-good="true"] {
  color: var(--add-fg);
  background: var(--add-bg);
}

.obsidian-analytics-dashboard .delta[data-good="false"] {
  color: var(--bad);
  background: rgba(240, 122, 106, 0.12);
}

.obsidian-analytics-dashboard .stat-value {
  min-width: 0;
  font-size: 25px;
  font-weight: 500;
  line-height: 30px;
  letter-spacing: -0.015em;
  color: rgb(var(--ad-ink));
  font-variant-numeric: tabular-nums;
}

/* ───────── Activity + leaderboard grid ───────── */

.obsidian-analytics-dashboard .overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 7px;
  margin-top: 7px;
}

.obsidian-analytics-dashboard .overview-grid > .card {
  padding: 15px 18px 14px;
}

.obsidian-analytics-dashboard .legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 12px;
  font-size: 12.5px;
  color: rgb(var(--ad-ink) / 0.5);
}

.obsidian-analytics-dashboard .legend li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.obsidian-analytics-dashboard .legend i {
  width: 8px;
  height: 8px;
  border-radius: 2.5px;
  background: var(--c);
}

/* ───────── Stacked bar chart ───────── */

.obsidian-analytics-dashboard .chart {
  position: relative;
  height: 196px;
}

.obsidian-analytics-dashboard .chart-grid {
  position: absolute;
  inset: 0 0 24px 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.obsidian-analytics-dashboard .chart-grid span {
  position: relative;
  height: 0;
  border-top: 1px dashed rgb(var(--ad-ink) / 0.07);
}

.obsidian-analytics-dashboard .chart-grid span::before {
  content: attr(data-value);
  position: absolute;
  left: -26px;
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  color: rgb(var(--ad-ink) / 0.32);
  font-variant-numeric: tabular-nums;
}

.obsidian-analytics-dashboard .chart-cols {
  position: absolute;
  inset: 0 0 0 26px;
  display: grid;
  grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
  gap: 12px;
}

.obsidian-analytics-dashboard .chart-col {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 24px;
  min-width: 0;
}

.obsidian-analytics-dashboard .bar-wrap {
  grid-row: 1;
  align-self: end;
  justify-self: center;
  width: min(46px, 100%);
}

.obsidian-analytics-dashboard .bar {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  border-radius: 7px 7px 3px 3px;
  overflow: hidden;
  transform-origin: 50% 100%;
  transition: opacity var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .bar-seg {
  flex-basis: 0;
  min-height: 3px;
  background: var(--c);
}

.obsidian-analytics-dashboard .chart-label {
  grid-row: 2;
  align-self: end;
  font-size: 11.5px;
  line-height: 18px;
  text-align: center;
  color: rgb(var(--ad-ink) / 0.4);
  white-space: nowrap;
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .bar {
    animation: obsidian-ad-bar-grow 650ms var(--ease-out-strong) both;
    animation-delay: calc(var(--enter-base) + 220ms + var(--col) * 60ms);
  }
}

@keyframes obsidian-ad-bar-grow {
  from {
    transform: scaleY(0);
  }
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .chart-cols:hover .chart-col:not(:hover) .bar {
    opacity: 0.4;
  }
  .obsidian-analytics-dashboard .chart-col:hover .bar-wrap::after {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
    transition-duration: 150ms;
  }
}

/* ───────── Leaderboard ───────── */

.obsidian-analytics-dashboard .leaders {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.obsidian-analytics-dashboard .leader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.obsidian-analytics-dashboard .leader-main {
  flex: 1;
  min-width: 0;
}

.obsidian-analytics-dashboard .leader-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.obsidian-analytics-dashboard .leader-name {
  font-size: 14.5px;
  color: var(--text);
}

.obsidian-analytics-dashboard .leader-count {
  font-size: 13px;
  color: rgb(var(--ad-ink) / 0.55);
  font-variant-numeric: tabular-nums;
}

.obsidian-analytics-dashboard .share {
  height: 5px;
  margin: 7px 0 8px;
  border-radius: 999px;
  background: rgb(var(--ad-ink) / 0.06);
  overflow: hidden;
}

.obsidian-analytics-dashboard .share-fill {
  display: block;
  height: 100%;
  width: calc(var(--share) * 100%);
  border-radius: inherit;
  background: var(--c);
  transform-origin: 0 50%;
  transition: width 700ms var(--ease-out-strong);
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .share-fill {
    animation: obsidian-ad-share-grow 700ms var(--ease-out-strong) both;
    animation-delay: calc(var(--enter-base) + 300ms + var(--row) * 80ms);
  }
}

@keyframes obsidian-ad-share-grow {
  from {
    transform: scaleX(0);
  }
}

.obsidian-analytics-dashboard .leader-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
}

.obsidian-analytics-dashboard .leader-pct {
  margin-left: auto;
  font-size: 12.5px;
  color: rgb(var(--ad-ink) / 0.4);
  white-space: nowrap;
}

/* ───────── Responsive ─────────
   Sized off the page container, not the viewport: the sidebar and PR panel
   both change how much room the page gets at the same screen width. */

@container page (max-width: 740px) {
  .obsidian-analytics-dashboard .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .obsidian-analytics-dashboard .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container page (max-width: 420px) {
  .obsidian-analytics-dashboard .stats {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Repositories route: searchable, sortable grid of repository cards. */

.obsidian-analytics-dashboard .repo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.obsidian-analytics-dashboard .repo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 16px 14px 18px;
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .repo:hover {
    background-color: rgb(var(--ad-ink) / 0.07);
    box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.06);
  }
}

.obsidian-analytics-dashboard .repo-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.obsidian-analytics-dashboard .repo-vis-icon {
  flex: none;
  color: rgb(var(--ad-ink) / 0.42);
}

.obsidian-analytics-dashboard .repo-name {
  min-width: 0;
  font-size: 15.5px;
  font-weight: 600;
  line-height: 22px;
  color: rgb(var(--ad-ink));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.obsidian-analytics-dashboard .repo-org {
  font-weight: 450;
  color: rgb(var(--ad-ink) / 0.5);
}

.obsidian-analytics-dashboard .star-btn {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin: -4px -6px -4px auto;
  border-radius: 8px;
  color: rgb(var(--ad-ink) / 0.42);
  transition:
    color var(--duration-quick) ease,
    background-color var(--duration-quick) ease,
    transform var(--duration-quick) ease-out;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .star-btn:hover {
    color: rgb(var(--ad-ink) / 0.85);
    background-color: rgb(var(--ad-ink) / 0.06);
  }
}

.obsidian-analytics-dashboard .star-btn[aria-pressed="true"] {
  color: var(--star);
}

.obsidian-analytics-dashboard .star-btn[aria-pressed="true"] svg {
  fill: currentColor;
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .star-btn[aria-pressed="true"] svg {
    animation: obsidian-ad-star-pop 380ms var(--digit-ease);
  }
}

@keyframes obsidian-ad-star-pop {
  0% {
    transform: scale(0.6);
  }
  60% {
    transform: scale(1.18);
  }
}

.obsidian-analytics-dashboard .repo-desc {
  min-height: 40px;
  font-size: 14px;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.55);
  text-wrap: pretty;
}

/* 14-day commit strip */

.obsidian-analytics-dashboard .mini-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 34px;
}

.obsidian-analytics-dashboard .mini-bars span {
  flex: 1;
  height: calc(var(--h) * 100%);
  min-height: 3px;
  border-radius: 2px;
  background: color-mix(in oklab, var(--accent) 50%, transparent);
  transform-origin: 50% 100%;
}

.obsidian-analytics-dashboard .mini-bars span:last-child {
  background: var(--accent);
}

@media (prefers-reduced-motion: no-preference) {
  .obsidian-analytics-dashboard .mini-bars span {
    animation: obsidian-ad-bar-grow 500ms var(--ease-out-strong) both;
    animation-delay: calc(var(--enter-base) + 200ms + var(--bar) * 22ms);
  }
}

.obsidian-analytics-dashboard .repo-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  font-size: 12.5px;
  color: rgb(var(--ad-ink) / 0.5);
}

.obsidian-analytics-dashboard .repo-lang,
.obsidian-analytics-dashboard .repo-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-variant-numeric: tabular-nums;
}

.obsidian-analytics-dashboard .repo-lang i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.obsidian-analytics-dashboard .repo-updated {
  margin-left: auto;
}

@container analytics-dashboard (max-width: 880px) {
  .obsidian-analytics-dashboard .repo-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container analytics-dashboard (max-width: 520px) {
  .obsidian-analytics-dashboard .toolbar {
    flex-wrap: wrap;
  }
  .obsidian-analytics-dashboard .search {
    max-width: none;
    flex-basis: 100%;
  }
}

/* Code review route: status-filtered pull request queue. */

.obsidian-analytics-dashboard .review-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.obsidian-analytics-dashboard .review-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background-color: rgb(var(--ad-ink) / 0.035);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.03);
  transition:
    background-color var(--duration-quick) ease,
    box-shadow var(--duration-quick) ease;
}

@media (hover: hover) {
  .obsidian-analytics-dashboard .review-row:hover {
    background-color: rgb(var(--ad-ink) / 0.055);
  }
}

.obsidian-analytics-dashboard .review-row[data-selected="true"] {
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 38%, transparent);
}

.obsidian-analytics-dashboard .review-main {
  flex: 1;
  min-width: 0;
}

.obsidian-analytics-dashboard .review-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 7px;
  margin-top: 4px;
  font-size: 13px;
  line-height: 20px;
  color: rgb(var(--ad-ink) / 0.45);
}

.obsidian-analytics-dashboard .review-repo {
  font-family: var(--obsidian-analytics-dashboard-font-mono), ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  color: rgb(var(--ad-ink) / 0.6);
}

.obsidian-analytics-dashboard .review-author,
.obsidian-analytics-dashboard .review-comments {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.obsidian-analytics-dashboard .review-author .avatar-22 {
  width: 18px;
  height: 18px;
}

.obsidian-analytics-dashboard .diffstat {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--obsidian-analytics-dashboard-font-mono), ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.obsidian-analytics-dashboard .diff-add {
  color: var(--add-fg);
}

.obsidian-analytics-dashboard .diff-del {
  color: var(--del-fg);
}

.obsidian-analytics-dashboard .diff-blocks {
  display: inline-flex;
  gap: 2px;
  margin-left: 2px;
}

.obsidian-analytics-dashboard .diff-blocks i {
  width: 7px;
  height: 7px;
  border-radius: 1.5px;
}

.obsidian-analytics-dashboard .diff-blocks i[data-kind="add"] {
  background: var(--add-fg);
}

.obsidian-analytics-dashboard .diff-blocks i[data-kind="del"] {
  background: var(--del-fg);
}

@container analytics-dashboard (max-width: 1000px) {
  .obsidian-analytics-dashboard .review-row .diffstat {
    display: none;
  }
}

@container analytics-dashboard (max-width: 760px) {
  .obsidian-analytics-dashboard .review-row .pill {
    display: none;
  }
}

@container analytics-dashboard (max-width: 520px) {
  /* The filter keeps equal tabs and scrolls sideways instead of squeezing labels into each other. */
  .obsidian-analytics-dashboard .toolbar:has(.seg-wide) {
    margin-inline: -14px -12px;
    padding: 2px 12px 2px 14px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .obsidian-analytics-dashboard .toolbar:has(.seg-wide)::-webkit-scrollbar {
    display: none;
  }
  .obsidian-analytics-dashboard .seg-wide {
    min-width: 100%;
    grid-template-columns: repeat(var(--n), 1fr);
  }
  .obsidian-analytics-dashboard .seg-wide .seg-btn {
    gap: 5px;
    padding: 0 10px;
  }
  .obsidian-analytics-dashboard .review-row {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px 12px;
    padding: 12px;
  }
  .obsidian-analytics-dashboard .review-row .status-dot {
    display: none;
  }
  .obsidian-analytics-dashboard .review-main {
    flex-basis: 0;
  }
  .obsidian-analytics-dashboard .review-row .btn-details {
    flex-basis: 100%;
    width: 100%;
  }
  .obsidian-analytics-dashboard .review-repo {
    flex-basis: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .obsidian-analytics-dashboard .review-repo + [aria-hidden="true"] {
    display: none;
  }
}

/* Settings route: profile fields, notification switches, assistant and appearance. */

.obsidian-analytics-dashboard .settings-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 760px;
}

.obsidian-analytics-dashboard .settings-card {
  padding: 16px 20px 8px;
}

.obsidian-analytics-dashboard .settings-card > .card-title {
  margin-bottom: 2px;
}

.obsidian-analytics-dashboard .profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 16px;
}

.obsidian-analytics-dashboard .profile-name {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--ad-ink));
}

.obsidian-analytics-dashboard .profile-role {
  font-size: 13px;
  color: var(--text-3);
}

.obsidian-analytics-dashboard .fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 12px;
}

.obsidian-analytics-dashboard .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.obsidian-analytics-dashboard .field-label {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--ad-ink) / 0.55);
}

.obsidian-analytics-dashboard .field input {
  height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  outline: none;
  font-size: 14.5px;
  background: rgb(var(--ad-ink) / 0.045);
  box-shadow: inset 0 0 0 1px rgb(var(--ad-ink) / 0.07);
  transition:
    box-shadow var(--duration-quick) ease,
    background-color var(--duration-quick) ease;
}

.obsidian-analytics-dashboard .field input:focus-visible {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 65%, transparent);
}

.obsidian-analytics-dashboard .field input[aria-invalid="true"] {
  box-shadow: inset 0 0 0 1px rgba(240, 75, 75, 0.6);
}

.obsidian-analytics-dashboard .field-hint {
  font-size: 12.5px;
  color: rgb(var(--ad-ink) / 0.4);
}

.obsidian-analytics-dashboard .field-hint[data-error="true"] {
  color: var(--del-fg);
}

.obsidian-analytics-dashboard .setting-list {
  display: flex;
  flex-direction: column;
}

.obsidian-analytics-dashboard .setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
}

.obsidian-analytics-dashboard .setting-list > li + li {
  border-top: 1px solid rgb(var(--ad-ink) / 0.05);
}

.obsidian-analytics-dashboard .setting-title {
  font-size: 14.5px;
  color: var(--text);
}

.obsidian-analytics-dashboard .setting-detail {
  margin-top: 2px;
  font-size: 13px;
  line-height: 18px;
  color: var(--text-3);
  text-wrap: pretty;
}

/* Accent swatches */

.obsidian-analytics-dashboard .swatches {
  flex: none;
  display: flex;
  gap: 10px;
}

.obsidian-analytics-dashboard .swatch {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  background: var(--swatch);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition:
    box-shadow 200ms var(--ease-ui),
    transform var(--duration-quick) ease-out;
}

.obsidian-analytics-dashboard .swatch svg {
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 150ms ease,
    transform 250ms var(--digit-ease);
}

.obsidian-analytics-dashboard .swatch[aria-checked="true"] {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 0 2px var(--ad-surface),
    0 0 0 4px var(--swatch);
}

.obsidian-analytics-dashboard .swatch[aria-checked="true"] svg {
  opacity: 1;
  transform: scale(1);
}

/* Save bar sticks to the bottom of the scroll area */

.obsidian-analytics-dashboard .save-bar {
  position: sticky;
  bottom: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 8px 8px 16px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--ad-save-bar);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    inset 0 0 0 1px rgb(var(--ad-ink) / 0.07),
    0 12px 30px -10px rgb(0 0 0 / calc(0.6 * var(--ad-shadow)));
}

.obsidian-analytics-dashboard .save-note {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  color: rgb(var(--ad-ink) / 0.55);
}

@container analytics-dashboard (max-width: 760px) {
  .obsidian-analytics-dashboard .fields {
    grid-template-columns: minmax(0, 1fr);
  }
  .obsidian-analytics-dashboard .setting-row:has(.seg) {
    flex-wrap: wrap;
  }
}
```

### components/block/analytics-dashboard.tsx

Installation target: `@components/block/analytics-dashboard.tsx`

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  DashboardContext,
  type AnalyticsDashboardAccent,
  type AnalyticsDashboardPage,
  type AnalyticsDashboardUser,
  type AnswerHandler,
} from "@/components/analytics-dashboard/context";
import { analyticsDashboardDemoData, type AnalyticsDashboardData } from "@/components/analytics-dashboard/data";
import { PrDetails, type Phase } from "@/components/analytics-dashboard/details";
import { CodeIcon, HomeIcon, LayersIcon, PanelIcon, SettingsIcon } from "@/components/analytics-dashboard/icons";
import { OverviewPage, RepositoriesPage, ReviewsPage, SettingsPage } from "@/components/analytics-dashboard/pages";
import { Avatar } from "@/components/analytics-dashboard/ui";
import "./analytics-dashboard.css";

export { analyticsDashboardDemoData } from "@/components/analytics-dashboard/data";
export type {
  AnalyticsActivity,
  AnalyticsDashboardData,
  AnalyticsKpi,
  AnalyticsKpiIcon,
  AnalyticsPerson,
  AnalyticsPrStatus,
  AnalyticsPullRequest,
  AnalyticsRange,
  AnalyticsRepository,
} from "@/components/analytics-dashboard/data";
export type { AnalyticsDashboardAccent, AnalyticsDashboardPage, AnalyticsDashboardUser } from "@/components/analytics-dashboard/context";

/** Keep in sync with the `analytics-dashboard` container queries in analytics-dashboard.css. */
const OVERLAY_WIDTH = 1180;
const COMPACT_WIDTH = 760;
const EXIT_MS = 150;

const NAV = [
  { page: "overview", label: "Overview", Icon: HomeIcon },
  { page: "repositories", label: "Repositories", Icon: LayersIcon },
  { page: "reviews", label: "Code review", Icon: CodeIcon },
  { page: "settings", label: "Settings", Icon: SettingsIcon },
] as const satisfies readonly { page: AnalyticsDashboardPage; label: string; Icon: typeof HomeIcon }[];

const PAGES: Record<AnalyticsDashboardPage, () => ReactNode> = {
  overview: OverviewPage,
  repositories: RepositoriesPage,
  reviews: ReviewsPage,
  settings: SettingsPage,
};

const DEFAULT_USER: AnalyticsDashboardUser = {
  name: "atharv",
  email: "atharv@obsidianui.dev",
  avatar: "https://www.obsidianui.dev/analytics-dashboard/avatars/atharv.webp",
  role: "CLI & tooling · Admin",
};

export interface AnalyticsDashboardProps {
  /** People, metrics, activity, repositories, and pull requests. Defaults to demo data. */
  data?: AnalyticsDashboardData;
  /** Product name and optional logo at the top of the sidebar. */
  brand?: { name: string; logo?: ReactNode };
  /** Signed-in account shown in the sidebar and on the Settings page. */
  user?: AnalyticsDashboardUser;
  /** Controlled page. */
  page?: AnalyticsDashboardPage;
  /** Initial page when uncontrolled. */
  defaultPage?: AnalyticsDashboardPage;
  onPageChange?: (page: AnalyticsDashboardPage) => void;
  /** Initial accent color. Settings → Appearance changes it. */
  defaultAccent?: AnalyticsDashboardAccent;
  onAccentChange?: (accent: AnalyticsDashboardAccent) => void;
  /** Assistant name in the PR panel composer. */
  assistantName?: string;
  /** Answers questions asked in the PR panel. Without it, the panel replies with a summary of the pull request. */
  onAsk?: AnswerHandler;
  /** Plain color behind the window. */
  background?: string;
  className?: string;
  style?: CSSProperties;
}

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function AnalyticsDashboard({
  data = analyticsDashboardDemoData,
  brand = { name: "PR Dashboard" },
  user = DEFAULT_USER,
  page: pageProp,
  defaultPage = "overview",
  onPageChange,
  defaultAccent = "blue",
  onAccentChange,
  assistantName = "Claude",
  onAsk,
  background,
  className,
  style,
}: AnalyticsDashboardProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [rootRef, width] = useContainerWidth();
  const [pageState, setPageState] = useState<AnalyticsDashboardPage>(defaultPage);
  const page = pageProp ?? pageState;
  const firstPr = data.pullRequests[0]?.number ?? 0;
  const [selected, setSelected] = useState(firstPr);
  const [shown, setShown] = useState(firstPr);
  const [phase, setPhase] = useState<Phase>("in");
  const [panelOpen, setPanelOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [accent, setAccentState] = useState<AnalyticsDashboardAccent>(defaultAccent);
  const [booted, setBooted] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const reopenRef = useRef<HTMLButtonElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);

  // Layout follows the dashboard's own width, so it also works inside a panel or a preview.
  const overlay = width !== null && width <= OVERLAY_WIDTH;
  const compact = width !== null && width <= COMPACT_WIDTH;
  const layout = useRef({ overlay, compact });
  useEffect(() => {
    layout.current = { overlay, compact };
  }, [overlay, compact]);

  // Desktop keeps the panel docked unless collapsed; narrower layouts slide it over on demand.
  const detailsVisible = overlay ? panelOpen : !collapsed;
  const navFloating = compact && navOpen;

  // First-load entrances wait for the window to land; later page swaps start right away.
  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const navigate = useCallback(
    (next: AnalyticsDashboardPage) => {
      if (pageProp === undefined) setPageState(next);
      onPageChange?.(next);
      if (layout.current.compact) setNavOpen(false);
    },
    [pageProp, onPageChange],
  );

  const setAccent = useCallback(
    (next: AnalyticsDashboardAccent) => {
      setAccentState(next);
      onAccentChange?.(next);
    },
    [onAccentChange],
  );

  const hideDetails = useCallback(() => {
    // Focus would otherwise fall to <body> once the panel turns inert.
    const hadFocus = panelRef.current?.contains(document.activeElement) ?? false;
    if (layout.current.overlay) setPanelOpen(false);
    else setCollapsed(true);
    if (hadFocus) requestAnimationFrame(() => reopenRef.current?.focus({ preventScroll: true }));
  }, []);

  function showDetails() {
    if (layout.current.overlay) setPanelOpen(true);
    else setCollapsed(false);
    requestAnimationFrame(() => hideRef.current?.focus({ preventScroll: true }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (overlay && panelOpen) hideDetails();
    else if (navFloating) setNavOpen(false);
    else return;
    // Marks Escape as handled, so a surrounding dialog or full-screen preview stays open.
    event.preventDefault();
  }

  const people = useMemo(() => new Map(data.people.map((p) => [p.handle, p])), [data.people]);

  const ctx = useMemo(() => {
    function openPr(n: number) {
      setSelected(n);
      if (layout.current.overlay) setPanelOpen(true);
      else setCollapsed(false);
      window.clearTimeout(timer.current);
      if (n === shown) {
        setPhase("in");
        return;
      }
      setPhase("out");
      timer.current = window.setTimeout(() => {
        setShown(n);
        setPhase("pre");
        // Two frames so the "pre" offset paints before transitioning to "in".
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
      }, EXIT_MS);
    }
    return {
      data,
      person: (handle: string) => people.get(handle),
      user,
      assistantName,
      answer: onAsk,
      uid,
      selected,
      openPr,
      navigate,
      accent,
      setAccent,
    };
  }, [data, people, user, assistantName, onAsk, uid, selected, shown, navigate, accent, setAccent]);

  const activeIndex = NAV.findIndex((item) => item.page === page);
  const title = NAV[activeIndex]?.label ?? "";
  const Page = PAGES[page] ?? OverviewPage;
  const shownPr = data.pullRequests.find((pr) => pr.number === shown) ?? data.pullRequests[0];
  const navId = `${uid}-nav`;
  const detailsId = `${uid}-details`;

  return (
    <DashboardContext value={ctx}>
      <div
        ref={rootRef}
        className={cn("obsidian-analytics-dashboard", className)}
        data-compact={compact}
        style={{ "--accent": ACCENTS[accent].ui, ...(background ? { "--obsidian-analytics-dashboard-background": background } : null), ...style } as CSSProperties}
        onKeyDown={onKeyDown}
      >
        <div
          className="window"
          data-panel-open={panelOpen}
          data-collapsed={collapsed || !shownPr}
          data-nav-open={navOpen}
          data-scrim={(overlay && panelOpen) || navFloating}
          data-booted={booted}
        >
          <nav id={navId} className="rail" aria-label="Primary" data-expanded={navOpen}>
            <button type="button" className="rail-brand press" aria-label={`${brand.name} overview`} onClick={() => navigate("overview")}>
              {brand.logo ? (
                <span className="rail-logo-custom">{brand.logo}</span>
              ) : (
                <span className="rail-logo">
                  <span className="rail-logo-shine" />
                </span>
              )}
              <span className="rail-label rail-brand-name" aria-hidden="true">
                {brand.name}
              </span>
            </button>

            <div className="rail-nav" style={{ "--active": Math.max(0, activeIndex) } as CSSProperties}>
              <span className="rail-indicator" aria-hidden="true" data-hidden={activeIndex < 0} />
              <ul className="rail-list">
                {NAV.map(({ page: target, label, Icon }, i) => {
                  const active = i === activeIndex;
                  return (
                    <li key={target}>
                      <button
                        type="button"
                        className="rail-btn press has-tip tip-right"
                        data-tip={label}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        data-active={active}
                        onClick={() => navigate(target)}
                      >
                        <Icon size={19} strokeWidth={1.7} className="rail-icon" />
                        <span className="rail-label" aria-hidden="true">
                          {label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              type="button"
              className="rail-account press has-tip tip-right"
              data-tip={`${user.name} · Settings`}
              aria-label={`${user.name}, account settings`}
              onClick={() => navigate("settings")}
            >
              <Avatar src={user.avatar} size={22} className="rail-icon" />
              <span className="rail-label rail-account-text" aria-hidden="true">
                <span className="rail-account-name">{user.name}</span>
                <span className="rail-account-mail">{user.email}</span>
              </span>
            </button>
          </nav>

          <main className="main">
            <header className="main-bar enter" style={{ "--i": 0 } as CSSProperties}>
              <button
                type="button"
                className="icon-btn press has-tip tip-below"
                data-tip={navOpen ? "Collapse sidebar" : "Expand sidebar"}
                aria-label="Sidebar"
                aria-expanded={navOpen}
                aria-controls={navId}
                onClick={() => setNavOpen((o) => !o)}
              >
                <PanelIcon side="left" open={navOpen} size={15} />
              </button>
              <span className="main-bar-title">
                <span key={title} className="swap-in">
                  {title}
                </span>
              </span>
              {shownPr && (
                <button
                  ref={reopenRef}
                  type="button"
                  className="icon-btn press has-tip tip-below tip-end details-reopen"
                  data-tip="Show PR details"
                  data-visible={!detailsVisible}
                  inert={detailsVisible}
                  aria-label="Show PR details"
                  aria-expanded={detailsVisible}
                  aria-controls={detailsId}
                  onClick={showDetails}
                >
                  <PanelIcon side="right" size={15} />
                </button>
              )}
            </header>
            <div className="main-scroll" ref={scrollRef}>
              {/* Keyed by page so every page swap replays its entrance stagger. */}
              <div key={page} className="page">
                <Page />
              </div>
            </div>
          </main>

          {shownPr && (
            <PrDetails pr={shownPr} phase={phase} open={panelOpen} visible={detailsVisible} panelRef={panelRef} hideRef={hideRef} onHide={hideDetails} />
          )}
          <button
            type="button"
            className="scrim"
            aria-label="Close panel"
            tabIndex={-1}
            // Keep focus where it was instead of parking it on the scrim.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (panelOpen) hideDetails();
              if (layout.current.compact) setNavOpen(false);
            }}
          />
        </div>
      </div>
    </DashboardContext>
  );
}

export default AnalyticsDashboard;
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
| data | AnalyticsDashboardData | Demo data | People, metrics, activity, repositories, and pull requests. |
| brand | { name: string; logo?: ReactNode } | { name: 'PR Dashboard' } | Product name and logo at the top of the sidebar. |
| user | { name: string; email: string; avatar: string; role?: string } | Demo user | Signed-in account in the sidebar and on the Settings page. |
| page | 'overview' \| 'repositories' \| 'reviews' \| 'settings' | - | Controlled page. |
| defaultPage | AnalyticsDashboardPage | 'overview' | First page when uncontrolled. |
| onPageChange | (page: AnalyticsDashboardPage) => void | - | Called when the sidebar changes the page. |
| defaultAccent | 'blue' \| 'violet' \| 'teal' \| 'amber' | 'blue' | First accent color. |
| onAccentChange | (accent: AnalyticsDashboardAccent) => void | - | Called when Settings changes the accent. |
| assistantName | string | 'Claude' | Assistant name in the details panel. |
| onAsk | (question: string, pullRequest: AnalyticsPullRequest) => string \| Promise<string> | - | Answers questions about the selected pull request. |
| background | string | '#f6f6f7' light, '#0b0b0c' dark | Plain color behind the window, in both modes. |
| className | string | - | Additional classes for the root element. |

## Pull request fields

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| number | number | - | Unique pull request number. |
| title | string | - | Title. Text in backticks shows as code in the details panel. |
| author | string | - | Handle of a person in people. |
| status | { kind: 'merged' \| 'review' \| 'open'; label: string } | - | Status pill, icon, and the label in the details panel. |
| repository | string | - | Repository name. |
| opened | string | - | Opening time in the details panel. |
| age | string | - | Short relative time in the review queue, such as 2h. |
| today | boolean | - | Lists the pull request under Today PRs on the overview. |
| additions | number | - | Added lines. |
| deletions | number | - | Removed lines. |
| comments | number | - | Comment count. |
| problem | string[] | - | Paragraphs for the Problem section. |
| approach | string[] | - | Paragraphs for the Approach section. |

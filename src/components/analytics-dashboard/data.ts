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
    { handle: "atharv", avatar: "/analytics-dashboard/avatars/atharv.webp", color: "#f08a3c", role: "CLI & tooling" },
    { handle: "ananya", avatar: "/analytics-dashboard/avatars/ananya.webp", color: "#9d8df5", role: "Web platform" },
    { handle: "rahul", avatar: "/analytics-dashboard/avatars/rahul.webp", color: "#2fd06f", role: "Payments" },
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

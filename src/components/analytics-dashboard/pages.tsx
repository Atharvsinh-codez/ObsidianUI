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

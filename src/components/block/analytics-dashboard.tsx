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
  avatar: "/analytics-dashboard/avatars/atharv.webp",
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

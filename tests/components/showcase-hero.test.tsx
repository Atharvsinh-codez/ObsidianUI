import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ reduced: false as boolean | null, inView: true }));

vi.mock("motion/react", async (importOriginal) => {
  const original = await importOriginal<typeof import("motion/react")>();
  const React = await import("react");
  return {
    ...original,
    useReducedMotion: () => state.reduced,
    useInView: () => state.inView,
    motion: {
      div: React.forwardRef<HTMLDivElement, Record<string, unknown>>(function MotionDiv(props, ref) {
        const visual = new Set(["initial", "animate", "transition"]);
        const native = Object.fromEntries(Object.entries(props).filter(([key]) => !visual.has(key)));
        return React.createElement("div", { ...native, ref });
      }),
    },
  };
});

vi.mock("@/components/catalog/effect-preview", () => ({
  EffectPreview: ({ slug, compact }: { slug: string; compact?: boolean }) => (
    <div data-effect-preview={slug} data-compact={compact} />
  ),
}));

vi.mock("@/components/catalog/dashboard-shell-preview", () => ({ DashboardShellPreview: () => <div data-effect-preview="dashboard-shell" /> }));
vi.mock("@/components/catalog/analytics-dashboard-preview", () => ({ AnalyticsDashboardPreview: () => <div data-effect-preview="analytics-dashboard" /> }));
vi.mock("@/components/catalog/active-sessions-preview", () => ({ ActiveSessionsPreview: () => <div data-effect-preview="active-sessions" /> }));
vi.mock("@/components/catalog/status-bars-preview", () => ({ StatusBarsPreview: () => <div data-effect-preview="status-bars" /> }));
vi.mock("@/components/block/discover-button", () => ({ DiscoverButton: () => <div data-effect-preview="discover-button" /> }));

import { ShowcaseHero } from "@/components/catalog/showcase-hero";

const tour = ["dashboard-shell", "analytics-dashboard", "art-gallery", "active-sessions", "discover-button", "status-bars", "draggable-marquee", "text-stream"];

describe("showcase component tour", () => {
  beforeEach(() => {
    state.reduced = false;
    state.inView = true;
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("focuses the initial card and follows its documentation link", () => {
    const { container } = render(<ShowcaseHero />);
    const previews = container.querySelectorAll("[data-effect-preview]");
    expect(previews).toHaveLength(tour.length);
    expect(screen.queryByRole("button", { name: /(?:pause|play) component tour/i })).not.toBeInTheDocument();
    expect(container.querySelector(".showcase-stage")).toHaveAttribute("inert");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/installation");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("target");
    expect(screen.queryByRole("link", { name: "Star on GitHub" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Dashboard Shell" })).toHaveAttribute("href", "/docs/dashboard-shell");
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Analytics Dashboard" })).toHaveAttribute("href", "/docs/analytics-dashboard");
  });

  it("shows the cards in tour order", () => {
    const { container } = render(<ShowcaseHero />);
    const slugs = Array.from(container.querySelectorAll("[data-effect-preview]"), (node) => node.getAttribute("data-effect-preview"));
    expect(slugs).toEqual(tour);
    expect(container.textContent).not.toMatch(/apple-spotlight|circle-menu|otp-input|folder-preview|masonry-grid|scroll-effect/i);
  });

  it("visits every component once per tour, in order", () => {
    render(<ShowcaseHero />);
    const visited: string[] = [];
    for (let step = 0; step < tour.length; step += 1) {
      visited.push(screen.getByRole("link", { name: /^Explore / }).getAttribute("href")!);
      act(() => vi.advanceTimersByTime(7000));
    }
    expect(visited).toEqual(tour.map(slug => `/docs/${slug}`));
    expect(screen.getByRole("link", { name: "Explore Dashboard Shell" })).toHaveAttribute("href", visited[0]);
  });

  it("pauses the tour offscreen, then resumes when visible", () => {
    const { rerender } = render(<ShowcaseHero />);
    state.inView = false;
    rerender(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByRole("link", { name: "Explore Dashboard Shell" })).toBeInTheDocument();
    state.inView = true;
    rerender(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Analytics Dashboard" })).toBeInTheDocument();
  });

  it("keeps rotating while the showcase is hovered or its documentation link is focused", () => {
    const { container } = render(<ShowcaseHero />);
    const stage = container.querySelector(".showcase-stage-wrap")!;
    fireEvent.pointerEnter(stage);
    act(() => vi.advanceTimersByTime(7000));
    const explore = screen.getByRole("link", { name: "Explore Analytics Dashboard" });
    expect(explore).toBeInTheDocument();

    fireEvent.focus(explore);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole("link", { name: "Explore Art Gallery" })).toBeInTheDocument();
  });

  it("does not advance through cards with reduced motion", () => {
    state.reduced = true;
    render(<ShowcaseHero />);
    act(() => vi.advanceTimersByTime(11200));
    expect(screen.getByRole("link", { name: "Explore Dashboard Shell" })).toBeInTheDocument();
  });

  it("renders the same markup without playback controls before and after the motion preference resolves", () => {
    state.reduced = null;
    const server = renderToString(<ShowcaseHero />);
    state.reduced = false;
    const client = renderToString(<ShowcaseHero />);
    expect(server).toBe(client);
    expect(server).not.toMatch(/(?:Pause|Play) component tour/);
  });
});

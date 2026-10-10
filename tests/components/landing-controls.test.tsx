import { createRef, type ElementType, type ReactNode } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const controls = vi.hoisted(() => ({
  reducedMotion: false,
  motionProps: vi.fn(),
  push: vi.fn(),
}));

// Preserve actual Next links and native events; inspect motion's input without
// relying on animation frames or jsdom's incomplete layout implementation.
vi.mock("motion/react", async () => {
  const React = await import("react");
  const visualProps = new Set(["initial", "animate", "exit", "transition", "whileHover", "whileTap"]);
  function nativeProps(props: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(props).filter(([name]) => !visualProps.has(name)));
  }
  return {
    motion: {
      create: (Component: ElementType) => React.forwardRef<HTMLAnchorElement, Record<string, unknown>>(
        function MotionLink(props, ref) {
          controls.motionProps(props);
          return React.createElement(Component, { ...nativeProps(props), ref });
        },
      ),
      div: React.forwardRef<HTMLDivElement, Record<string, unknown>>(function MotionDiv(props, ref) {
        return React.createElement("div", { ...nativeProps(props), ref });
      }),
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    useReducedMotion: () => controls.reducedMotion,
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: controls.push }) }));

import { MotionButtonLink } from "@/components/site/motion-button-link";
import GlassSearchBar from "@/components/landing/glass-search-bar";

describe("landing controls", () => {
  let hoverCapable: boolean;
  let hoverListeners: Set<() => void>;
  let hoverMedia: MediaQueryList;

  beforeEach(() => {
    controls.reducedMotion = false;
    controls.motionProps.mockClear();
    controls.push.mockClear();
    hoverCapable = true;
    hoverListeners = new Set();
    hoverMedia = {
      get matches() { return hoverCapable; },
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      addEventListener: vi.fn((_event: string, listener: () => void) => hoverListeners.add(listener)),
      removeEventListener: vi.fn((_event: string, listener: () => void) => hoverListeners.delete(listener)),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    } as unknown as MediaQueryList;
    vi.spyOn(window, "matchMedia").mockImplementation(() => hoverMedia);
  });

  it("keeps Browse Components a single keyboard-operable link and forwards its ref and handlers", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLAnchorElement>();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const onKeyDown = vi.fn();
    render(
      <MotionButtonLink href="/components" ref={ref} onClick={onClick} onKeyDown={onKeyDown}>
        Browse Components
      </MotionButtonLink>,
    );

    const link = screen.getByRole("link", { name: "Browse Components" });
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/components");
    expect(ref.current).toBe(link);
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "Enter" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    { name: "a mouse", reduced: false, hover: true, tapEnabled: true, hoverEnabled: true },
    { name: "a touch screen", reduced: false, hover: false, tapEnabled: true, hoverEnabled: false },
    { name: "reduced motion", reduced: true, hover: true, tapEnabled: false, hoverEnabled: false },
  ])("respects interaction preferences for $name", ({ reduced, hover, tapEnabled, hoverEnabled }) => {
    controls.reducedMotion = reduced;
    hoverCapable = hover;
    render(<MotionButtonLink href="/components">Browse Components</MotionButtonLink>);
    const props = controls.motionProps.mock.lastCall![0];
    expect(props.whileTap).toEqual(tapEnabled ? { scale: 0.93 } : undefined);
    expect(props.whileHover).toEqual(hoverEnabled ? { scale: 1.02 } : undefined);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/components");
  });

  it("adapts when a hover-capable pointer is connected and removes its subscription on unmount", () => {
    hoverCapable = false;
    const { unmount } = render(<MotionButtonLink href="/components">Browse Components</MotionButtonLink>);
    expect(controls.motionProps.mock.lastCall![0].whileHover).toBeUndefined();
    expect(hoverListeners.size).toBe(1);

    act(() => {
      hoverCapable = true;
      hoverListeners.forEach((listener) => listener());
    });
    expect(controls.motionProps.mock.lastCall![0].whileHover).toEqual({ scale: 1.02 });
    act(() => {
      hoverCapable = false;
      hoverListeners.forEach((listener) => listener());
    });
    expect(controls.motionProps.mock.lastCall![0].whileHover).toBeUndefined();
    unmount();
    expect(hoverListeners.size).toBe(0);
  });

  it("opens valid default search suggestions and navigates to the keyboard-selected documentation", async () => {
    const user = userEvent.setup();
    render(<GlassSearchBar />);
    const input = screen.getByRole("combobox", { name: "Search components" });
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    const results = within(screen.getByRole("listbox", { name: "Matching components" }));
    expect(results.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Active Sessions", "Analytics Dashboard", "Art Gallery", "Dashboard Shell",
    ]);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(controls.push).toHaveBeenCalledExactlyOnceWith("/docs/analytics-dashboard");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

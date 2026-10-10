import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AnalyticsDashboard } from "@/components/block/analytics-dashboard";

describe("AnalyticsDashboard", () => {
  it("switches pages from the rail and reports the change", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AnalyticsDashboard onPageChange={onPageChange} />);

    const rail = screen.getByRole("navigation", { name: "Primary" });
    expect(within(rail).getByRole("button", { name: "Overview" })).toHaveAttribute("aria-current", "page");

    await user.click(within(rail).getByRole("button", { name: "Repositories" }));
    expect(onPageChange).toHaveBeenCalledWith("repositories");
    expect(within(rail).getByRole("button", { name: "Repositories" })).toHaveAttribute("aria-current", "page");
    expect(within(rail).getByRole("button", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("follows a controlled page without changing it internally", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AnalyticsDashboard page="settings" onPageChange={onPageChange} />);

    const rail = screen.getByRole("navigation", { name: "Primary" });
    await user.click(within(rail).getByRole("button", { name: "Code review" }));
    expect(onPageChange).toHaveBeenCalledWith("reviews");
    expect(within(rail).getByRole("button", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  });

  it("closes the floating sidebar on Escape and marks the key as handled", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    const toggle = screen.getByRole("button", { name: "Sidebar" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const handled = !fireEvent.keyDown(toggle, { key: "Escape" });
    expect(handled).toBe(true);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("applies a plain background color and custom brand", () => {
    const { container } = render(<AnalyticsDashboard background="#101010" brand={{ name: "Acme" }} />);
    const root = container.querySelector(".obsidian-analytics-dashboard") as HTMLElement;
    expect(root.style.getPropertyValue("--obsidian-analytics-dashboard-background")).toBe("#101010");
    expect(screen.getByRole("button", { name: "Acme overview" })).toBeInTheDocument();
  });
});

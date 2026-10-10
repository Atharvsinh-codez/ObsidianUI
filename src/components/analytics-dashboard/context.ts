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

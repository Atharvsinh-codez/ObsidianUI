import type { Metadata } from "next";
import { r2 } from "@/lib/r2";

export const siteTitle = "ObsidianUI - React & Tailwind CSS Components Library";
export const siteDescription = "ObsidianUI is React & Tailwind CSS Component Library featuring components, blocks, and landing page templates.";

export const docsDescriptions: Record<string, string> = {
  "installation": "Create a Next.js project with TypeScript, Tailwind CSS, ESLint, and App Router for ObsidianUI components.",
  "install-tailwind": "Install and configure Tailwind CSS for ObsidianUI components in a Next.js project.",
  "add-utilities": "Set up the utility functions required to use ObsidianUI components in your React project.",
  "cli": "Install ObsidianUI components with the shadcn CLI and connect coding agents through the MCP server.",
  "hover-img": "Preview images that follow the cursor when visitors hover over titles. Explore the Hover Image React component and copy its source.",
  "v-prism": "Explore v-prism, an interactive glass prism that splits a movable light beam into a spectrum. View its settings and React source.",
  "dashboard-shell": "Free React admin dashboard layout for Tailwind CSS and shadcn/ui: resizable sidebar, header actions, animated tabs, filter toolbar, and a mobile drawer.",
  "analytics-dashboard": "Free React analytics dashboard block: pull request overview, KPI charts, repositories, review queue, settings, and a details panel with an assistant composer.",
  "active-sessions": "Preview Active Sessions, a React list of signed-in devices that fold away when you sign them out, one at a time or all at once.",
  "discover-button": "Preview Discover Button, a pill-shaped React button whose arrow circle expands across the label on hover.",
  "status-bars": "Preview Status Bars, a daily uptime strip for React with incident tooltips, keyboard navigation, and an animated uptime total.",
  "split-showcase": "Show two interactive partner cards with hover motion and a dotted divider. Preview the Split Showcase React component.",
  "art-gallery": "Explore Art Gallery, a draggable photo grid with lens distortion and an infinite tiled layout.",
  "flip-text": "Preview Flip Text, an animated React component whose characters flip and rotate on hover.",
  "text-stream": "Preview Text reel, a vertical text stream that changes speed and direction as you scroll.",
  "draggable-marquee": "Explore a looping image marquee with drag momentum and keyboard controls for React interfaces.",
};

export type DocsSearchDetails = {
  /** Search result title; Google shows about 60 characters. */
  title: string;
  keywords: string[];
  datePublished: string;
  dateModified: string;
};

export const docsSearchDetails: Record<string, DocsSearchDetails> = {
  "dashboard-shell": {
    title: "Dashboard Shell: React Admin Dashboard Layout – ObsidianUI",
    keywords: [
      "React dashboard layout",
      "admin dashboard template",
      "Next.js dashboard layout",
      "Tailwind CSS dashboard",
      "shadcn dashboard",
      "shadcn sidebar",
      "resizable sidebar",
      "React sidebar component",
      "dashboard sidebar navigation",
      "app shell",
      "admin panel layout",
      "SaaS dashboard UI",
      "responsive dashboard layout",
      "mobile sidebar drawer",
      "animated tabs",
      "dashboard toolbar with filters",
      "Radix UI dashboard",
      "free dashboard components",
      "Dashboard Shell",
      "ObsidianUI",
    ],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
};

export function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
  type: "website" | "article" = "website",
): Metadata {
  const image = r2("/og-image.png");

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type,
      title,
      description,
      url: pathname,
      siteName: "ObsidianUI",
      locale: "en_US",
      images: [{ url: image, width: 1917, height: 1078, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@athrix_codes",
      creator: "@athrix_codes",
      images: [{ url: image, width: 1917, height: 1078, alt: title }],
    },
  };
}

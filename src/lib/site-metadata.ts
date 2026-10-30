import type { Metadata } from "next";
import routeMap from "@/lib/generated/agent-route-map.json";
import { r2 } from "@/lib/r2";

export const siteOrigin = "https://www.obsidianui.dev";
export const siteTitle = "ObsidianUI - React & Tailwind CSS Components Library";
export const siteDescription = "ObsidianUI is a React & Tailwind CSS component library featuring components, blocks, and landing page templates.";

export const docsDescriptions: Record<string, string> = {
  "index": "Get started with ObsidianUI: install Next.js and Tailwind CSS, add the utilities, then copy React components and blocks into your project.",
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
  "parallax-slider": "Preview Parallax Slider, an endless React image strip you can drag or scroll, with images that drift inside their frames for depth.",
};

export type DocsSearchDetails = {
  /** Search result title; Google shows about 60 characters. */
  title: string;
  /** Guides get article markup only; components and blocks also describe their source code. */
  category: "guide" | "component" | "block";
  keywords: string[];
  datePublished: string;
  dateModified: string;
};

export const docsSearchDetails: Record<string, DocsSearchDetails> = {
  "installation": {
    title: "Install Next.js for ObsidianUI – Setup Guide",
    category: "guide",
    keywords: ["Next.js installation", "create-next-app", "Next.js App Router setup", "TypeScript Next.js project", "React component library setup", "ObsidianUI installation", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-23",
  },
  "install-tailwind": {
    title: "Install Tailwind CSS in Next.js – ObsidianUI",
    category: "guide",
    keywords: ["Tailwind CSS installation", "Tailwind CSS v4 Next.js", "Tailwind CSS setup", "PostCSS Tailwind", "Next.js styling", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-23",
  },
  "add-utilities": {
    title: "Add the cn Utility for ObsidianUI Components",
    category: "guide",
    keywords: ["cn utility", "clsx", "tailwind-merge", "Tailwind class merging", "shadcn utils", "React utility functions", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-23",
  },
  "cli": {
    title: "ObsidianUI CLI: Install Components with shadcn",
    category: "guide",
    keywords: ["shadcn CLI", "shadcn registry", "component registry", "install React components", "MCP server", "coding agents", "ObsidianUI CLI", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-23",
  },
  "active-sessions": {
    title: "Active Sessions: React Device Sign-Out List – ObsidianUI",
    category: "component",
    keywords: ["active sessions component", "React sessions list", "signed-in devices UI", "sign out all devices", "account security UI", "Motion list animation", "Tailwind CSS settings page", "Active Sessions", "ObsidianUI"],
    datePublished: "2026-10-04",
    dateModified: "2026-10-04",
  },
  "art-gallery": {
    title: "Art Gallery: Draggable React Photo Grid – ObsidianUI",
    category: "component",
    keywords: ["React image gallery", "draggable photo grid", "infinite canvas gallery", "lens distortion effect", "WebGL gallery", "interactive portfolio grid", "Art Gallery", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-25",
  },
  "discover-button": {
    title: "Discover Button: Animated React CTA Button – ObsidianUI",
    category: "component",
    keywords: ["React animated button", "CTA button", "pill button hover effect", "arrow button animation", "Tailwind CSS button", "Motion button", "Discover Button", "ObsidianUI"],
    datePublished: "2026-10-04",
    dateModified: "2026-10-04",
  },
  "draggable-marquee": {
    title: "Draggable Marquee: React Image Marquee – ObsidianUI",
    category: "component",
    keywords: ["React marquee", "draggable marquee", "infinite image carousel", "logo marquee", "drag momentum slider", "Motion marquee", "Draggable Marquee", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-25",
  },
  "flip-text": {
    title: "Flip Text: Animated React Text Effect – ObsidianUI",
    category: "component",
    keywords: ["React text animation", "flip text effect", "hover text animation", "character animation", "Motion text effect", "Tailwind CSS typography", "Flip Text", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-23",
  },
  "hover-img": {
    title: "Hover Image: Cursor-Follow Image Preview – ObsidianUI",
    category: "component",
    keywords: ["React hover image", "cursor follow image", "image reveal on hover", "hover preview list", "Motion hover effect", "portfolio link list", "Hover Image", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-25",
  },
  "parallax-slider": {
    title: "Parallax Slider: Infinite React Image Gallery – ObsidianUI",
    category: "component",
    keywords: ["React image slider", "infinite gallery", "parallax carousel", "draggable image strip", "horizontal scroll gallery", "portfolio slider", "Parallax Slider", "ObsidianUI"],
    datePublished: "2026-10-30",
    dateModified: "2026-10-30",
  },
  "split-showcase": {
    title: "Split Showcase: React Partner Cards – ObsidianUI",
    category: "component",
    keywords: ["React showcase cards", "partner logos section", "sponsor cards", "split layout component", "hover card animation", "Tailwind CSS cards", "Split Showcase", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-25",
  },
  "status-bars": {
    title: "Status Bars: React Uptime Status Component – ObsidianUI",
    category: "component",
    keywords: ["React status page", "uptime bars", "uptime monitor UI", "incident tooltip", "status page component", "service health dashboard", "Status Bars", "ObsidianUI"],
    datePublished: "2026-10-04",
    dateModified: "2026-10-04",
  },
  "text-stream": {
    title: "Text Reel: Scroll-Driven React Text Stream – ObsidianUI",
    category: "component",
    keywords: ["React scroll animation", "text reel", "vertical text marquee", "scroll velocity effect", "Motion scroll text", "kinetic typography", "Text reel", "ObsidianUI"],
    datePublished: "2026-09-23",
    dateModified: "2026-09-25",
  },
  "v-prism": {
    title: "v-prism: Interactive Glass Prism Effect – ObsidianUI",
    category: "component",
    keywords: ["React WebGL effect", "glass prism", "light spectrum effect", "interactive hero background", "shader effect React", "refraction effect", "v-prism", "ObsidianUI"],
    datePublished: "2026-09-25",
    dateModified: "2026-09-25",
  },
  "analytics-dashboard": {
    title: "Analytics Dashboard: React PR Dashboard Block – ObsidianUI",
    category: "block",
    keywords: [
      "React analytics dashboard",
      "pull request dashboard",
      "GitHub PR analytics",
      "KPI dashboard",
      "dashboard charts",
      "code review queue",
      "Next.js dashboard template",
      "Tailwind CSS dashboard",
      "light and dark dashboard",
      "free dashboard block",
      "Analytics Dashboard",
      "ObsidianUI",
    ],
    datePublished: "2026-10-10",
    dateModified: "2026-10-10",
  },
  "dashboard-shell": {
    title: "Dashboard Shell: React Admin Dashboard Layout – ObsidianUI",
    category: "block",
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
  const markdown = (routeMap as Record<string, string>)[pathname];

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
      ...(markdown && { types: { "text/markdown": `${siteOrigin}${markdown}` } }),
    },
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

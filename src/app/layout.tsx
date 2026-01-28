import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter_Tight, Pixelify_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Footer from "@/components/mine/landing-page/footer";
import { ClickSpark } from "@/components/ui/click-spark";

// Default font
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Special font for headings
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Font for elegant serif headings
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ObsidianUI - Premium React Components",
  description:
    "Beautiful, modern, and customizable React components. Build stunning interfaces with ObsidianUI - a premium component library for React and Next.js.",
  keywords: [
    "React",
    "Next.js",
    "UI Components",
    "Component Library",
    "Tailwind CSS",
    "Framer Motion",
    "Animation",
    "Web Development",
    "Frontend",
    "ObsidianUI",
    "React UI Library",
    "Motion UI",
  ],
  authors: [{ name: "ObsidianUI" }],
  creator: "ObsidianUI",
  publisher: "ObsidianUI",

  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: "https://www.obsidianui.dev",
    title: "ObsidianUI - Premium React Components",
    description:
      "Beautiful, modern, and customizable React components. Build stunning interfaces with ObsidianUI - a premium component library for React and Next.js.",
    siteName: "ObsidianUI",
    images: [
      {
        url: "https://www.obsidianui.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "ObsidianUI - Design Less. Ship Better.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ObsidianUI - Premium React Components",
    description:
      "Beautiful, modern, and customizable React components. Build stunning interfaces with ObsidianUI.",
    images: ["https://www.obsidianui.dev/og-image.png"],
    creator: "@obsidianui",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.obsidianui.dev",
  },
  metadataBase: new URL("https://www.obsidianui.dev"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.obsidianui.dev/#website",
      url: "https://www.obsidianui.dev",
      name: "ObsidianUI",
      description: "Premium React UI Component Library",
      publisher: { "@id": "https://www.obsidianui.dev/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.obsidianui.dev/components?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.obsidianui.dev/#organization",
      name: "ObsidianUI",
      url: "https://www.obsidianui.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://www.obsidianui.dev/logo/bg-less.png",
      },
      sameAs: [
        "https://github.com/Atharvsinh-codez/ObsidianUI",
        "https://x.com/obsidianui",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.obsidianui.dev/#software",
      name: "ObsidianUI",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: "Premium React UI Component Library with Tailwind CSS and Framer Motion",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1000",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${interTight.variable} ${pixelify.variable} ${playfair.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClickSpark
            sparkColor={undefined}
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          />
          {children}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Geist, Inter_Tight, Pixelify_Sans, Playfair_Display, Six_Caps } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TracwellAnalytics } from "@/components/providers/tracwell-analytics";
import Footer from "@/components/landing/footer";
import { ClickSpark } from "@/components/block/click-spark";
import { SiteHeader } from "@/components/site/site-header";
import { r2 } from "@/lib/r2";
import { siteDescription, siteTitle } from "@/lib/site-metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
});

// Default font
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Ultra-condensed font for animated text
const sixCaps = Six_Caps({
  variable: "--font-sixcaps",
  subsets: ["latin"],
  weight: ["400"],
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
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "React",
    "Next.js",
    "UI Components",
    "Component Library",
    "Tailwind CSS",
    "Motion",
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
    title: siteTitle,
    description: siteDescription,
    siteName: "ObsidianUI",
    images: [
      {
        url: r2("/og-image.png"),
        secureUrl: r2("/og-image.png"),
        width: 1917,
        height: 1078,
        type: "image/png",
        alt: siteTitle,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    site: "@athrix_codes",
    creator: "@athrix_codes",
    images: [
      {
        url: r2("/og-image.png"),
        width: 1917,
        height: 1078,
        alt: siteTitle,
      },
    ],
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
      description: siteDescription,
      publisher: { "@id": "https://www.obsidianui.dev/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://www.obsidianui.dev/#organization",
      name: "ObsidianUI",
      url: "https://www.obsidianui.dev",
      logo: {
        "@type": "ImageObject",
        url: r2("/logo/bg-less.png"),
      },
      sameAs: [
        "https://github.com/Atharvsinh-codez/ObsidianUI",
        "https://x.com/athrix_codes",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.obsidianui.dev/#software",
      name: "ObsidianUI",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: siteDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        <link rel="service-desc" href="/openapi.json" type="application/json" />
        <noscript><style>{`.landing-typography :is([style*="opacity:0;"], [style$="opacity:0"], [style*="opacity: 0;"], [style$="opacity: 0"]) { opacity: 1 !important; transform: none !important; }`}</style></noscript>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..900&display=swap" rel="stylesheet" />
        {/* App Router root layout shares this named font across every route and demo. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geist.variable} ${interTight.variable} ${pixelify.variable} ${playfair.variable} ${sixCaps.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a href="#main-content" className="fixed left-4 top-4 z-[9999] -translate-y-24 rounded-lg bg-background px-4 py-3 text-foreground shadow-lg focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-ring">
            Skip to content
          </a>
          <ClickSpark
            sparkColor={undefined}
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          />
          <SiteHeader />
          {children}
          <Footer />
          <TracwellAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

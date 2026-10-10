"use client";

// Layout and camera motion adapted from EvilCharts (MIT).
// See THIRD_PARTY_NOTICES.md for the original copyright and license.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, cubicBezier, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Component } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { r2 } from "@/lib/r2";
import "./showcase-hero.css";

import { DiscoverButton } from "@/components/block/discover-button";
import { ActiveSessionsPreview } from "./active-sessions-preview";
import { AnalyticsDashboardPreview } from "./analytics-dashboard-preview";
import { DashboardShellPreview } from "./dashboard-shell-preview";
import { EffectPreview } from "./effect-preview";
import { StatusBarsPreview } from "./status-bars-preview";

type StageCard = {
  slug: string;
  title: string;
  x: number;
  y: number;
  aspect: number;
  preview: ReactNode;
};

// The tour follows this order. Cards alternate between the two columns so each
// pan is short; y positions leave a 40px gap below the card above.
const CARDS: StageCard[] = [
  {
    slug: "dashboard-shell", title: "Dashboard Shell", x: 40, y: 40, aspect: 1000 / 714,
    // Rendered at desktop size and scaled to the 404px preview so the docked sidebar shows.
    preview: (
      <div className="absolute left-0 top-0 h-[714px] w-[1000px] origin-top-left scale-[0.404]">
        <DashboardShellPreview compact />
      </div>
    ),
  },
  {
    slug: "analytics-dashboard", title: "Analytics Dashboard", x: 500, y: 20, aspect: 1240 / 820,
    // Wider than the dashboard's 1180px overlay breakpoint so the details panel stays docked.
    preview: (
      <div className="absolute left-0 top-0 h-[820px] w-[1240px] origin-top-left scale-[0.3274]">
        <AnalyticsDashboardPreview />
      </div>
    ),
  },
  { slug: "art-gallery", title: "Art Gallery", x: 40, y: 412, aspect: 1264 / 964, preview: <EffectPreview slug="art-gallery" compact /> },
  {
    slug: "active-sessions", title: "Active Sessions", x: 500, y: 371, aspect: 1.2,
    preview: <div className="flex h-full w-full items-center justify-center overflow-hidden px-4"><ActiveSessionsPreview compact className="max-w-[380px]" /></div>,
  },
  {
    slug: "discover-button", title: "Discover Button", x: 40, y: 804, aspect: 2,
    preview: <div className="flex h-full w-full items-center justify-center bg-[#191715]"><DiscoverButton /></div>,
  },
  {
    slug: "status-bars", title: "Status Bars", x: 500, y: 791, aspect: 1.5,
    preview: <div className="flex h-full w-full items-center justify-center px-5"><StatusBarsPreview className="max-w-[380px]" /></div>,
  },
  { slug: "draggable-marquee", title: "Draggable Marquee", x: 40, y: 1089, aspect: 2034 / 1252, preview: <EffectPreview slug="draggable-marquee" compact /> },
  { slug: "text-stream", title: "Text reel", x: 500, y: 1144, aspect: 1492 / 1266, preview: <EffectPreview slug="text-stream" compact /> },
];

const CARD_WIDTH = 420;
// 14px includes the shell padding and both borders; 42px also includes its title.
const cardHeight = (card: StageCard) => (CARD_WIDTH - 14) / card.aspect + 42;
const START_INDEX = 0;
const TOUR = CARDS.map((_, index) => index);
const TOUR_INTERVAL_MS = 7000;
const panEase = cubicBezier(0.65, 0, 0.35, 1);
const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));

function ComponentsStage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef({ x: 250, y: 653, scale: 0.72 });
  const flightRef = useRef<ReturnType<typeof animate> | null>(null);
  const settledRef = useRef(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(START_INDEX);
  const reduce = useReducedMotion();
  const inView = useInView(viewportRef, { amount: 0.2 });
  const focus = CARDS[active];

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce !== false || !inView) return;
    const timer = setInterval(() => {
      setActive((current) => TOUR[(TOUR.indexOf(current) + 1) % TOUR.length]);
    }, TOUR_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reduce, inView]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport.width || !viewport.height) return;
    const scale = clamp(0.5, Math.min(viewport.width / 800, viewport.height / 650), 0.92);
    const target = { x: focus.x + CARD_WIDTH / 2, y: focus.y + cardHeight(focus) / 2, scale };
    const paintCamera = (camera: typeof target) => {
      cameraRef.current = camera;
      canvas.style.transform = `translate(${viewport.width / 2 - camera.x * camera.scale}px, ${viewport.height / 2 - camera.y * camera.scale}px) scale(${camera.scale})`;
    };

    flightRef.current?.stop();
    if (!settledRef.current || reduce) {
      paintCamera(target);
      settledRef.current = true;
      return;
    }
    if (!inView) return;

    const from = cameraRef.current;
    const distance = Math.hypot(target.x - from.x, target.y - from.y) * scale;
    if (distance < 1) {
      paintCamera(target);
      return;
    }
    const duration = clamp(1.2, 0.9 + distance / 750, 2.3);
    const zoomDepth = scale * 0.18;
    const flight = animate(0, 1, {
      duration,
      ease: "linear",
      onUpdate: (progress) => {
        const pan = panEase(progress);
        paintCamera({
          x: from.x + (target.x - from.x) * pan,
          y: from.y + (target.y - from.y) * pan,
          scale: from.scale + (scale - from.scale) * pan - zoomDepth * Math.sin(Math.PI * progress) ** 2,
        });
      },
    });
    flightRef.current = flight;
    return () => flight.stop();
  }, [focus, viewport, reduce, inView]);

  return (
    <div className="showcase-stage-wrap">
      {/* Decorative: inert keeps the previews' own buttons out of the tab order. */}
      <div ref={viewportRef} className="showcase-stage" aria-hidden="true" inert>
        <div ref={canvasRef} className="showcase-canvas">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.slug}
              className={cn("showcase-stage-card", index === active && "showcase-stage-card-active")}
              style={{ left: card.x, top: card.y, width: CARD_WIDTH, height: cardHeight(card) }}
              initial={false}
              animate={{ opacity: index === active ? 1 : 0.35, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.75, ease: "easeInOut" }}
            >
              <div className="showcase-stage-card-title"><Component size={13} /><span>{card.slug}.tsx</span></div>
              <div className="showcase-stage-card-preview">{card.preview}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="showcase-stage-fade" aria-hidden="true" />
      <div className="showcase-stage-controls">
        <Link href={`/docs/${focus.slug}`} className="showcase-explore-link">Explore {focus.title}<ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

export function ShowcaseHero() {
  return (
    <header className="showcase-hero landing-typography">
      <div className="showcase-hero-copy">
        <div className="showcase-hero-copy-inner">
          <h1 className="showcase-wordmark landing-title"><Image src={r2("/logo/bg-less.png")} alt="" width={64} height={64} priority />ObsidianUI<span className="sr-only"> component showcase</span></h1>
          <p className="showcase-description landing-copy">Animated, interactive components for React. Built with Tailwind CSS and Motion, ready to copy, customize, and ship your next great interface.</p>
          <div className="showcase-hero-actions">
            <Button asChild><a href="#component-gallery">Browse Components<ArrowDown aria-hidden="true" /></a></Button>
            <Button asChild variant="outline"><Link href="/docs/installation">Docs</Link></Button>
          </div>
        </div>
      </div>
      <ComponentsStage />
    </header>
  );
}

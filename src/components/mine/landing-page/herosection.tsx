"use client";
import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MaskedAvatars } from "@/components/ui/masked-avatars";
import GlassSearchBar from "@/components/mine/landing-page/glass-search-bar";
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";
import { GithubButton } from "@/components/github-button";
import { useVisitorCount } from "@/hooks/use-visitor-count";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed state to prevent re-renders on every mouse move
  const lastUpdateRef = useRef<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { count, loading } = useVisitorCount();

  // Direct DOM update for best performance without re-renders
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Throttle via requestAnimationFrame for smoother 60fps tracking
    requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      containerRef.current!.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current!.style.setProperty('--mouse-y', `${y}px`);
    });
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Docs", href: "/docs/installation" },
    { label: "Templates", href: "/templates" },
  ];

  return (
    <div className="w-full flex justify-center items-center pt-2 md:pt-4 pb-8 md:pb-12 bg-[#f5f5f5] min-h-screen">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] min-h-[550px] md:min-h-[600px] max-h-[900px] w-[96%] md:w-[98%] max-w-[1600px] flex flex-col items-center justify-center overflow-hidden rounded-[24px] md:rounded-[40px] transition-all duration-500 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        style={{
          background: `
            radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 0, 0, 0.02), transparent 40%),
            linear-gradient(to bottom, #ffffff 0%, #f9fafb 50%, #f6f7f9 100%)
          `,
        } as React.CSSProperties}
      >
        {/* Vertical Lines Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 100%",
          }}
        />

        {/* Subtle Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Desktop Navbar - Hidden on mobile */}
        <div className="absolute top-0 left-0 right-0 z-50 pt-6 px-6 hidden md:flex justify-center">
          <SpotlightNavbar
            items={navItems}
            defaultActiveIndex={0}
            logo={
              <a href="/" className="flex items-center">
                <img src="/logo/bg-less.png" alt="ObsidianUI" className="h-7 w-7 object-contain" />
              </a>
            }
          />
        </div>

        {/* Mobile Navbar */}
        <div className="absolute top-0 left-0 right-0 z-50 pt-4 px-4 flex md:hidden items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/logo/bg-less.png" alt="ObsidianUI" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-zinc-900 text-sm">ObsidianUI</span>
          </a>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5 items-center justify-center">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 bg-zinc-700 rounded-full block"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-5 h-0.5 bg-zinc-700 rounded-full block"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                className="w-5 h-0.5 bg-zinc-700 rounded-full block"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-4 right-4 z-50 md:hidden bg-white/95 backdrop-blur-xl rounded-2xl border border-zinc-200 shadow-xl overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-zinc-200 mt-2 pt-3">
                  <a
                    href="https://github.com/Atharvsinh-codez/ObsidianUI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GitHub Button - Top Right Inside Hero (Desktop only) */}
        <div className="absolute top-6 right-6 z-50 hidden md:block">
          <GithubButton />
        </div>

        {/* Hero Content */}
        <div className="w-full max-w-7xl z-10 flex flex-col md:flex-row items-center justify-center mb-12 px-4 pt-16 md:pt-0">
          {/* Left Column */}
          <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 sm:px-6 py-8 md:p-12 md:pt-0 z-10 text-pretty">
            <div className="mb-4 md:mb-6">
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-zinc-200 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm backdrop-blur-md shadow-sm">
                New Component every week
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-600 mb-4 md:mb-6 leading-[1.1]">
              Design Less. <br /> Ship Better.
            </h1>

            <h3 className="text-base sm:text-lg md:text-xl font-light tracking-tight md:hidden text-zinc-600 mb-6 md:mb-8 leading-relaxed">
              Spend less time designing and tweaking UI, and more time shipping reliable, visually refined interfaces.
            </h3>

            <div className="mb-8 flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  {[
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Sophia", name: "Sophia", delay: 0 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Liliana", name: "Liliana", delay: 0.15 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Brian", name: "Brian", delay: 0.3 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Robert", name: "Robert", delay: 0.45 },
                  ].map((user) => (
                    <motion.div
                      key={user.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: user.delay,
                        ease: "easeOut",
                      }}
                      className="relative group cursor-pointer"
                      style={{ willChange: "transform" }}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm transform transition-transform duration-200 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-lg"
                        style={{ willChange: "transform" }}
                      />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-zinc-900">
                      {loading ? (
                        <span className="inline-block w-8 h-4 bg-zinc-200 animate-pulse rounded"></span>
                      ) : (
                        <span>{count > 0 ? count.toLocaleString() + "+" : "1000+"}</span>
                      )}
                    </span>
                    <span className="text-sm text-zinc-600">developers</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">trust ObsidianUI</span>
                </motion.div>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium border-t border-zinc-200 pt-3 mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                  React
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                  TypeScript
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                  Tailwind
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:hidden mt-4 gap-4 w-full">
              <Link href="/components" className="w-full sm:w-auto">
                <div className="group relative overflow-hidden rounded-xl bg-zinc-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none whitespace-nowrap shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)] text-center sm:text-left">
                  <span className="relative z-10 font-bold text-sm tracking-wide">Browse Components</span>
                </div>
              </Link>
              <div className="w-full max-w-full sm:max-w-[360px]">
                <GlassSearchBar />
              </div>
            </div>
          </div>

          {/* Right Column (Desktop) */}
          <div className="hidden md:flex flex-col items-start justify-center w-1/2 pl-0 p-12 z-10">
            <h3 className="text-xl font-light tracking-tight text-zinc-600 mb-10 leading-relaxed max-w-lg">
              Spend less time designing and tweaking UI, and more time shipping reliable, visually refined interfaces.
            </h3>
            <div className="flex flex-col gap-8 w-full">
              <div className="flex items-center gap-6">
                <Link href="/components">
                  <div className="group relative overflow-hidden rounded-xl bg-zinc-900 text-white px-8 py-3.5 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none whitespace-nowrap shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)]">
                    <span className="relative z-10 font-bold text-sm tracking-wide">Browse Components</span>
                  </div>
                </Link>
                <GlassSearchBar />
              </div>
            </div>
          </div>
        </div>

        {/* Large Background Text */}
        <div className="w-full h-[3vh] absolute md:bottom-12 bottom-2 sm:bottom-4 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {/* Mobile version - smaller and hidden overflow */}
          <span className="md:hidden text-[60px] sm:text-[100px] z-5 tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/40 via-zinc-300/30 to-transparent select-none whitespace-nowrap">
            ObsidianUI
          </span>
          {/* Desktop version - original styling */}
          <span className="hidden md:block text-[230px] lg:text-[300px] z-5 tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/40 via-zinc-300/30 to-transparent select-none">
            ObsidianUI
          </span>
        </div>
      </div>
    </div>
  );
};

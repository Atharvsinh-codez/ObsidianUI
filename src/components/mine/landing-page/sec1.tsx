"use client";
import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export const Sec1 = () => {
  const { scrollYProgress } = useScroll();

  // Parallax effect for background text
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.06, 0.03, 0.01]);

  return (
    <section className="w-full flex justify-center items-center py-12 bg-[#f5f5f5] dark:bg-neutral-950 min-h-screen">
      <div
        className="relative h-[calc(100vh-6rem)] min-h-[600px] max-h-[900px] w-[98%] max-w-[1600px] flex flex-col items-center justify-center overflow-hidden rounded-[40px] transition-all duration-500 bg-white dark:bg-black shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 50%, #f6f7f9 100%)',
        }}
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

        {/* Large Background "ObsidianUI" Watermark with Parallax */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ y: backgroundY, opacity: backgroundOpacity }}
        >
          <div className="text-[20vw] md:text-[15vw] lg:text-[12vw] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 whitespace-nowrap">
            ObsidianUI
          </div>
        </motion.div>

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent dark:via-black/20 pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center flex flex-col items-center justify-center">
          {/* Main Heading with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4">
              <span className="text-black dark:text-white">
                Ship your next project
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-neutral-500 to-neutral-400 dark:from-neutral-600 dark:via-neutral-500 dark:to-neutral-600">
                faster than ever.
              </span>
            </h2>
          </motion.div>

          {/* Subtitle with Animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 w-full max-w-4xl mx-auto mb-12 leading-relaxed font-light text-center flex flex-col items-center"
          >
            Join thousands of developers building with ObsidianUI.
            <br />
            Beautifully designed components that work seamlessly with your existing stack.
          </motion.p>

          {/* Action Buttons with Staggered Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary Button - Browse Components */}
            <Link href="/components">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl bg-neutral-900 text-white px-8 py-4 font-semibold text-base transition-all duration-300 min-w-[220px] shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.3)]"
              >
                <span className="relative z-10">Browse Components</span>
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </Link>

            {/* Secondary Button - Docs */}
            <Link href="/docs/installation">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl bg-neutral-800 text-white px-8 py-4 font-semibold text-base transition-all duration-300 min-w-[120px] shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.25)]"
              >
                <span className="relative z-10">Docs</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Optional: Small feature badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-600 font-medium"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
              <span>50+ Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
              <span>Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
              <span>Framer Motion</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

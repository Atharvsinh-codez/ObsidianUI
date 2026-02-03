"use client";

import React, { useState } from "react";
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";
import { CommandMenu } from "@/components/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { GitHubStarCounter } from "@/components/github-star-counter";
import { LiquidMetalButton } from "@/components/ui/liquid-metal";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Docs", href: "/docs/installation" },
    { label: "Templates", href: "/templates" },
];

interface NavbarContentProps {
    activeIndex: number;
}

export function NavbarContent({ activeIndex }: NavbarContentProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="w-full sticky top-0 z-50">
            {/* Desktop Navbar - Hidden on mobile */}
            <div className="hidden md:flex justify-center pt-4">
                <SpotlightNavbar
                    items={navItems}
                    defaultActiveIndex={activeIndex}
                    className="!pt-0"
                    logo={
                        <a href="/" className="flex items-center">
                            <img src="/logo/bg-less.png" alt="ObsidianUI" className="h-7 w-7 object-contain" />
                        </a>
                    }
                />
            </div>

            {/* Mobile Navbar - Visible on mobile */}
            <div className="flex md:hidden items-center justify-between px-4 pt-4 pb-2 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                <a href="/" className="flex items-center gap-2">
                    <img src="/logo/bg-less.png" alt="ObsidianUI" className="h-8 w-8 object-contain" />
                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">ObsidianUI</span>
                </a>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-zinc-200 dark:border-neutral-800 shadow-sm"
                        aria-label="Toggle menu"
                    >
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                            <motion.span
                                animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 rounded-full block"
                            />
                            <motion.span
                                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 rounded-full block"
                            />
                            <motion.span
                                animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 rounded-full block"
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-[60px] left-0 right-0 z-50 md:hidden bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 gap-1">
                            {navItems.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeIndex === index
                                        ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800 hover:text-zinc-900 dark:hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between px-4">
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Theme</span>
                                    <ModeToggle />
                                </div>
                                <div className="flex items-center justify-between px-4">
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Search</span>
                                    <CommandMenu />
                                </div>
                                <div className="px-4 flex justify-center">
                                    <GitHubStarCounter />
                                </div>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search, GitHub Stars & Theme Toggle - fixed top right (Desktop Only) */}
            <div className="fixed top-4 right-4 hidden md:flex items-center gap-3 z-50">
                <a href="https://regem.in/" target="_blank" rel="noopener noreferrer" className="mt-1">
                    <LiquidMetalButton
                        size="xs"
                        icon={<img src="/logo/regem-logo.png" alt="Regem" className="w-4 h-4 object-contain" />}
                        metalConfig={{
                            colorBack: "#0066cc",
                            colorTint: "#66b3ff",
                            speed: 0.5,
                            distortion: 0.2
                        }}
                    >
                        Regem
                    </LiquidMetalButton>
                </a>
                <GitHubStarCounter />
                <CommandMenu />
                <ModeToggle />
            </div>
        </div>
    );
}

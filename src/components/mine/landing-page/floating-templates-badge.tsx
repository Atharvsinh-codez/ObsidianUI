"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const FloatingTemplatesBadge = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay appearance slightly for better UX
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <Link href="/templates" className="block">
                        <div className="group relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 border border-zinc-700 dark:border-zinc-300 shadow-lg transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                            {/* Animated Badge */}
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white dark:text-zinc-900 tracking-wide">
                                    New Update
                                </span>
                                <span className="h-3 w-[1px] bg-zinc-600 dark:bg-zinc-400"></span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium group-hover:text-zinc-200 dark:group-hover:text-zinc-800 transition-colors">
                                    Templates Library
                                </span>
                            </div>

                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white dark:text-zinc-500 dark:group-hover:text-zinc-900 transition-colors" />
                        </div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

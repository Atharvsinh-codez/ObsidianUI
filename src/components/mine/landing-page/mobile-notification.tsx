"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

// Custom Laptop SVG Icon based on user's image
const LaptopIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Screen */}
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" fill="white" />
        {/* Base */}
        <path d="M2 17h20l-1.5 3H3.5L2 17z" fill="currentColor" />
        {/* Screen inner */}
        <rect x="6" y="5" width="12" height="8" rx="1" fill="white" stroke="none" />
    </svg>
);

export const MobileNotification = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const timerIdRef = useRef<number | null>(null);

    // Touch tracking
    const touchStartRef = useRef<number | null>(null);
    const touchCurrentRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) return;

        const showTimer = window.setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => window.clearTimeout(showTimer);
    }, [isMobile]);

    useEffect(() => {
        if (!isVisible || !notificationRef.current) return;

        // Animate in from right
        gsap.fromTo(
            notificationRef.current,
            { x: "120%", opacity: 0, scale: 0.95 },
            { x: "0%", opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
        );

        // Start 10 second timer
        timerIdRef.current = window.setTimeout(() => {
            dismissNotification('right');
        }, 10000);

        return () => {
            if (timerIdRef.current) {
                window.clearTimeout(timerIdRef.current);
            }
        };
    }, [isVisible]);

    const dismissNotification = (direction: 'left' | 'right' = 'right') => {
        if (!notificationRef.current) return;

        if (timerIdRef.current) {
            window.clearTimeout(timerIdRef.current);
            timerIdRef.current = null;
        }

        const xTo = direction === 'right' ? "120%" : "-120%";

        gsap.to(notificationRef.current, {
            x: xTo,
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                setIsVisible(false);
            },
        });
    };

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
        setIsPaused(true);
        // Pause timer
        if (timerIdRef.current) {
            window.clearTimeout(timerIdRef.current);
            timerIdRef.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current || !notificationRef.current) return;
        touchCurrentRef.current = e.touches[0].clientX;
        const diff = touchCurrentRef.current - touchStartRef.current;
        gsap.to(notificationRef.current, { x: diff, duration: 0.1, ease: "none" });
    };

    const handleTouchEnd = () => {
        setIsPaused(false);

        const swipeDiff = touchCurrentRef.current && touchStartRef.current
            ? touchCurrentRef.current - touchStartRef.current
            : 0;

        if (Math.abs(swipeDiff) > 100) {
            // Swipe detected
            dismissNotification(swipeDiff > 0 ? 'right' : 'left');
        } else {
            // Snap back and restart timer
            if (notificationRef.current) {
                gsap.to(notificationRef.current, { x: 0, duration: 0.4, ease: "back.out(1.5)" });
            }
            // Restart 10s timer
            timerIdRef.current = window.setTimeout(() => {
                dismissNotification('right');
            }, 10000);
        }

        touchStartRef.current = null;
        touchCurrentRef.current = null;
    };

    if (!isMobile || !isVisible) return null;

    return (
        <div
            ref={notificationRef}
            className="fixed top-24 right-4 z-[90] max-w-[calc(100vw-2rem)] touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative flex items-center gap-3 pl-3 pr-2 py-3 rounded-[24px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {/* Icon Circle - White Background */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-neutral-300 flex items-center justify-center shadow-sm">
                    <span className="text-neutral-900">
                        <LaptopIcon />
                    </span>
                </div>

                {/* Message */}
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 leading-tight pr-2">
                    For better experience visit from a desktop or laptop!
                </p>

                {/* Close Button */}
                <button
                    onClick={() => dismissNotification('right')}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                    <div
                        className="h-full bg-neutral-600 dark:bg-white rounded-full origin-left"
                        style={{
                            animation: "shrink-width 10s linear forwards",
                            animationPlayState: isPaused ? "paused" : "running",
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink-width {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
};

export default MobileNotification;

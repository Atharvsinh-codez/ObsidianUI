"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Bell, User, Slack, Twitter } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// Import live components for previews
import AnimatedTabBar from '@/components/ui/animated-tab-bar'
import CreepyButton from '@/components/ui/creepy-button'
import FlipText from '@/components/ui/flip-text'
import FlipFadeText from '@/components/ui/flip-fade-text'
import GlitchText from '@/components/ui/glitch-text'
import JellyLoader from '@/components/ui/jelly-loader'
import LightLines from '@/components/ui/light-lines'
import PerspectiveGrid from '@/components/ui/perspective-grid'
import SocialFlipButton from '@/components/ui/social-flip-button'
import MaskedAvatars from '@/components/ui/masked-avatars'
import SpotlightNavbar from '@/components/ui/spotlight-navbar'
import GlowBorderCard from '@/components/ui/glow-border-card'
import LiquidOcean from '@/components/ui/liquid-ocean'
import { IconWheel } from '@/components/ui/icon-wheel'
import { StackedLogos } from '@/components/ui/stacked-logos'
import TestimonialsCard from '@/components/ui/testimonials-card'
import LiquidText from '@/components/ui/liquid-text'
import { PixelatedCarousel } from '@/components/ui/pixelated-carousel'
import PixelatedImageTrail from '@/components/ui/pixelated-image-trail'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import InteractiveBook from '@/components/ui/interactive-book'
import { GlassDock } from '@/components/ui/glass-dock'
import { Home, Bookmark, Mail, Github } from 'lucide-react'

// Lazy Video preview component with Intersection Observer
const VideoPreview = ({ src, poster }: { src: string; poster?: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isInView, setIsInView] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        if (video.paused) {
                            video.play().catch(() => {
                                // Ignore autoplay errors
                            })
                        }
                    } else {
                        if (!video.paused) {
                            video.pause()
                        }
                    }
                })
            },
            { threshold: 0.1, rootMargin: '50px' }
        )

        observer.observe(video)

        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <>
            {/* Loading skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            )}

            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                poster={poster}
                preload="metadata"
                onLoadedData={() => setIsLoaded(true)}
                style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            >
                {isInView && <source src={src} type="video/mp4" />}
            </video>
        </>
    )
}

// Sample data for page 3 components
const sampleIcons = [
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
]

const sampleLogoGroups = [
    [
        <img key="1" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="w-8 h-8" />,
        <img key="2" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" alt="Vue" className="w-8 h-8" />,
    ],
    [
        <img key="1" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" alt="Next.js" className="w-8 h-8" />,
        <img key="2" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg" alt="Nuxt" className="w-8 h-8" />,
    ],
]

const sampleTestimonials = [
    { id: 1, title: "Sarah Chen", description: "Amazing component library!", image: "https://i.pravatar.cc/300?img=1" },
    { id: 2, title: "Mike Johnson", description: "Best animations ever!", image: "https://i.pravatar.cc/300?img=2" },
]

const infiniteMovingItems = [
    { quote: "Amazing library!", name: "Sarah", title: "Developer" },
    { quote: "Best animations!", name: "Mike", title: "Designer" },
    { quote: "Love it!", name: "Alex", title: "Engineer" },
]

const bookPages = [
    { content: <div className="p-4 text-sm">Page 1</div>, pageNumber: 1 },
    { content: <div className="p-4 text-sm">Page 2</div>, pageNumber: 2 },
    { content: <div className="p-4 text-sm">Page 3</div>, pageNumber: 3 },
]

const dockItems = [
    { title: "Home", icon: Home },
    { title: "Bookmark", icon: Bookmark },
    { title: "Email", icon: Mail },
    { title: "Github", icon: Github },
]

const sampleCarouselImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
]

// Live component preview wrappers
const LivePreviews: Record<string, React.ReactNode> = {
    "animated-tab-bar": (
        <div className="w-full scale-[0.6] origin-center">
            <AnimatedTabBar />
        </div>
    ),
    "creepy-button": (
        <div className="scale-75">
            <CreepyButton>Hover Me</CreepyButton>
        </div>
    ),
    "flip-text": (
        <div className="scale-90">
            <FlipText>ObsidianUI</FlipText>
        </div>
    ),
    "flip-fade-text": (
        <div className="scale-75">
            <FlipFadeText />
        </div>
    ),
    "glitch-text": (
        <div className="bg-black p-4 rounded-lg">
            <GlitchText className="text-xl">GLITCH</GlitchText>
        </div>
    ),
    "jelly-loader": (
        <div className="scale-75">
            <JellyLoader />
        </div>
    ),
    "light-lines": (
        <div className="w-full h-full">
            <LightLines />
        </div>
    ),
    "perspective-grid": (
        <div className="w-full h-full">
            <PerspectiveGrid />
        </div>
    ),
    "social-flip-button": (
        <div className="scale-90">
            <SocialFlipButton />
        </div>
    ),
    "masked-avatars": (
        <div className="scale-50">
            <MaskedAvatars />
        </div>
    ),
    "spotlight-navbar": (
        <div className="w-full scale-[0.5] origin-center">
            <SpotlightNavbar items={[
                { label: "Home", href: "/" },
                { label: "Alerts", href: "/alerts" },
                { label: "Profile", href: "/profile" },
            ]} />
        </div>
    ),
    "glow-border-card": (
        <div className="scale-[0.4] w-[280px]">
            <GlowBorderCard>
                <div className="p-6 text-center">
                    <h3 className="font-bold text-lg">Glow Card</h3>
                    <p className="text-sm opacity-70">Hover me</p>
                </div>
            </GlowBorderCard>
        </div>
    ),
    "liquid-ocean": (
        <div className="w-full h-full">
            <LiquidOcean />
        </div>
    ),
    "icon-wheel": (
        <div className="scale-[0.4] w-full h-full flex items-center justify-center">
            <IconWheel icons={sampleIcons} radius={100} />
        </div>
    ),
    "stacked-logos": (
        <div className="scale-75 w-full flex items-center justify-center">
            <StackedLogos logoGroups={sampleLogoGroups} logoWidth="60px" />
        </div>
    ),
    "testimonials-card": (
        <div className="scale-[0.5] w-full flex items-center justify-center">
            <TestimonialsCard items={sampleTestimonials} width={280} showNavigation={false} />
        </div>
    ),
    "infinite-moving-cards": (
        <div className="w-full h-full overflow-hidden">
            <InfiniteMovingCards items={infiniteMovingItems} speed="fast" />
        </div>
    ),
    "interactive-book": (
        <div className="scale-[0.4] flex items-center justify-center">
            <InteractiveBook coverImage="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop" pages={bookPages} />
        </div>
    ),
    "glass-dock": (
        <div className="w-full flex items-center justify-center scale-[0.6]">
            <GlassDock items={dockItems} />
        </div>
    ),
    "liquid-text": (
        <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-lg">
            <LiquidText text="3D" fontSize={100} color="#ffffff" className="h-full" />
        </div>
    ),
    "pixelated-carousel": (
        <div className="w-full h-full">
            <PixelatedCarousel images={sampleCarouselImages} pixelSize={50} />
        </div>
    ),
    "pixelated-image-trail": (
        <div className="w-full h-full">
            <PixelatedImageTrail className="h-full" />
        </div>
    ),
    "staggered-grid": (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 p-4 gap-2">
            <span className="text-2xl font-bold text-neutral-800 dark:text-white tracking-tight">GRID</span>
            <div className="grid grid-cols-5 gap-1 w-full">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-sm bg-neutral-200 dark:bg-neutral-700"
                        style={{ opacity: 0.5 + (i % 5) * 0.1 }}
                    />
                ))}
            </div>
        </div>
    ),
}

// All components with video previews or live components
const allComponents = [
    // Page 1 - Video components
    { title: "Apple Spotlight", href: "/docs/apple-spotlight", video: "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4", livePreview: null },
    { title: "Circle Menu", href: "/docs/circle-menu", video: "https://cdn.obsidianui.dev/demos/circle-menu.mp4", livePreview: null },
    { title: "Eagle Vision", href: "/docs/eagle-vision", video: "https://cdn.obsidianui.dev/demos/eagle-vision.mp4", livePreview: null },
    { title: "Flip Scroll", href: "/docs/flip-scroll", video: "https://cdn.obsidianui.dev/demos/flip-scroll.mp4", livePreview: null },
    { title: "Flow Scroll", href: "/docs/flow-scroll", video: "https://cdn.obsidianui.dev/demos/flow-scroll.mp4", livePreview: null },
    { title: "Horizontal Scroll", href: "/docs/horizontal-scroll", video: "https://cdn.obsidianui.dev/demos/horizontal-scroll.mp4", livePreview: null },
    { title: "Image Pile", href: "/docs/image-pile", video: "https://cdn.obsidianui.dev/demos/image-pile.mp4", livePreview: null },
    { title: "Leave Rating", href: "/docs/leave-rating", video: "https://cdn.obsidianui.dev/demos/leave-rating.mp4", livePreview: null },
    { title: "Magnet Tabs", href: "/docs/magnet-tabs", video: "https://cdn.obsidianui.dev/demos/magnet-tabs.mp4", livePreview: null },
    { title: "Mask Cursor Effect", href: "/docs/mask-cursor-effect", video: "https://cdn.obsidianui.dev/demos/mask-cursor-effect.mp4", livePreview: null },
    { title: "Masonry Grid", href: "/docs/masonry-grid", video: "https://cdn.obsidianui.dev/demos/masonry-grid.mp4", livePreview: null },
    { title: "OTP Input", href: "/docs/otp-input", video: "https://cdn.obsidianui.dev/demos/otp-input.mp4", livePreview: null },
    { title: "Rolling Ball Scroll", href: "/docs/rolling-ball-scroll-indicator", video: "https://cdn.obsidianui.dev/demos/rolling-ball-scroll-indicator.mp4", livePreview: null },
    { title: "Rubik Cube", href: "/docs/rubik-cube", video: "https://cdn.obsidianui.dev/demos/rubik-cube.mp4", livePreview: null },
    { title: "Interactive Folder", href: "/docs/folder-preview", video: "https://cdn.obsidianui.dev/demos/interactive-folder.mp4", livePreview: null },
    { title: "Trading Cards", href: "/docs/testimonials-card", video: "https://cdn.obsidianui.dev/demos/trading-cards.mp4", livePreview: null },
    { title: "Glowing Scroll", href: "/docs/glowing-scroll-indicator", video: "https://cdn.obsidianui.dev/demos/glowing-dot-scroll-indicator.mp4", livePreview: null },
    { title: "Stack Scroll", href: "/docs/scroll-effect", video: "https://cdn.obsidianui.dev/demos/stack-scroll.mp4", livePreview: null },
    // Page 2 - Live preview components
    { title: "Animated Tab Bar", href: "/docs/animated-tab-bar", video: null, livePreview: "animated-tab-bar" },
    { title: "Creepy Button", href: "/docs/creepy-button", video: null, livePreview: "creepy-button" },
    { title: "Flip Text", href: "/docs/flip-text", video: null, livePreview: "flip-text" },
    { title: "Flip Fade Text", href: "/docs/flip-fade-text", video: null, livePreview: "flip-fade-text" },
    { title: "Glitch Text", href: "/docs/glitch-text", video: null, livePreview: "glitch-text" },
    { title: "Jelly Loader", href: "/docs/jelly-loader", video: null, livePreview: "jelly-loader" },
    { title: "Light Lines", href: "/docs/light-lines", video: null, livePreview: "light-lines" },
    { title: "Perspective Grid", href: "/docs/perspective-grid", video: null, livePreview: "perspective-grid" },
    { title: "Social Flip Button", href: "/docs/social-flip-button", video: null, livePreview: "social-flip-button" },
    { title: "Spotlight Navbar", href: "/docs/spotlight-navbar", video: null, livePreview: "spotlight-navbar" },
    { title: "Masked Avatars", href: "/docs/masked-avatars", video: null, livePreview: "masked-avatars" },
    { title: "Glow Border Card", href: "/docs/glow-border-card", video: null, livePreview: "glow-border-card" },
    { title: "Glass Dock", href: "/docs/glass-dock", video: null, livePreview: "glass-dock" },
    { title: "Liquid Ocean", href: "/docs/liquid-ocean", video: null, livePreview: "liquid-ocean" },
    { title: "Infinite Moving Cards", href: "/docs/infinite-moving-cards", video: null, livePreview: "infinite-moving-cards" },
    { title: "Interactive Book", href: "/docs/interactive-book", video: null, livePreview: "interactive-book" },
    { title: "Staggered Grid", href: "/docs/staggered-grid", video: null, livePreview: "staggered-grid" },

    // Page 3 - More components with live previews
    { title: "Pixelated Carousel", href: "/docs/pixelated-carousel", video: null, livePreview: "pixelated-carousel" },
    { title: "Pixelated Image Trail", href: "/docs/pixelated-image-trail", video: null, livePreview: "pixelated-image-trail" },
    { title: "Testimonials Card", href: "/docs/testimonials-card", video: null, livePreview: "testimonials-card" },
    { title: "Icon Wheel", href: "/docs/icon-wheel", video: null, livePreview: "icon-wheel" },
]

const ITEMS_PER_PAGE = 20

export const ComponentsGrid = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)
    const totalPages = Math.ceil(allComponents.length / ITEMS_PER_PAGE)

    // Scroll to top smoothly when page changes
    useEffect(() => {
        if (containerRef.current) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [currentPage])

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentComponents = allComponents.slice(startIndex, endIndex)

    return (
        <div ref={containerRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-10">
                {currentComponents.map((component, idx) => (
                    <div key={idx} className="block group relative">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="
                                h-full flex flex-col
                                rounded-[20px] overflow-hidden
                                bg-white dark:bg-[#0A0A0A]
                                border border-neutral-200 dark:border-neutral-800
                                hover:border-neutral-300 dark:hover:border-neutral-700
                                hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/60
                                transition-all duration-500 ease-out
                                p-2
                            "
                        >
                            {/* Preview Area */}
                            <div className="
                                relative w-full aspect-[4/3] rounded-[14px] overflow-hidden
                                bg-neutral-100 dark:bg-zinc-900
                                border border-neutral-100 dark:border-white/5
                                group-hover:border-neutral-200 dark:group-hover:border-white/10
                                transition-colors
                            ">
                                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                    {component.video ? (
                                        <VideoPreview src={component.video} />
                                    ) : component.livePreview && LivePreviews[component.livePreview] ? (
                                        LivePreviews[component.livePreview]
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-neutral-400 dark:text-neutral-600 text-sm">
                                            {component.title}
                                        </div>
                                    )}
                                </div>

                                {/* Inner Shadow for depth */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] rounded-[14px]" />
                            </div>

                            {/* Details Area */}
                            <div className="px-3 pt-4 pb-2 flex items-center justify-between">
                                <div>
                                    <Link href={component.href} className="block">
                                        <h3 className="
                                            text-sm font-semibold transition-colors
                                            text-neutral-900 dark:text-neutral-100
                                            group-hover:text-blue-600 dark:group-hover:text-blue-400
                                        ">
                                            {component.title}
                                        </h3>
                                    </Link>
                                </div>
                                <Link
                                    href={component.href}
                                    className="
                                        w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-105
                                        bg-neutral-100 dark:bg-neutral-800/50
                                        text-neutral-400 dark:text-neutral-500
                                        hover:bg-neutral-200 dark:hover:bg-neutral-700
                                        hover:text-neutral-900 dark:hover:text-neutral-100
                                    "
                                >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="text-sm font-medium">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

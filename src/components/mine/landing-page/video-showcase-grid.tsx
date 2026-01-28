'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface VideoDemo {
    id: string
    name: string
    videoPath: string
    docPath: string
}

const videoDemos: VideoDemo[] = [
    { id: 'apple-spotlight', name: 'Apple Spotlight', videoPath: 'https://cdn.obsidianui.dev/demos/apple-spotlight.mp4', docPath: '/docs/apple-spotlight' },
    { id: 'circle-menu', name: 'Circle Menu', videoPath: 'https://cdn.obsidianui.dev/demos/circle-menu.mp4', docPath: '/docs/circle-menu' },
    { id: 'eagle-vision', name: 'Eagle Vision', videoPath: 'https://cdn.obsidianui.dev/demos/eagle-vision.mp4', docPath: '/docs/eagle-vision' },
    { id: 'flip-scroll', name: 'Flip Scroll', videoPath: 'https://cdn.obsidianui.dev/demos/flip-scroll.mp4', docPath: '/docs/flip-scroll' },
    { id: 'leave-rating', name: 'Leave Rating', videoPath: 'https://cdn.obsidianui.dev/demos/leave-rating.mp4', docPath: '/docs/leave-rating' },
    { id: 'photo-gallery', name: 'Photo Gallery', videoPath: 'https://cdn.obsidianui.dev/demos/photo-gallery.mp4', docPath: '/docs/photo-gallery' },
]

export function VideoShowcaseGrid() {
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!gridRef.current) return

        const items = gridRef.current.querySelectorAll('.video-card')

        gsap.fromTo(items,
            {
                y: 100,
                opacity: 0,
                scale: 0.95,
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 80%',
                    end: 'top 30%',
                    scrub: 1,
                }
            }
        )

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    return (
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">
                        Featured Components
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Explore our most popular components with video previews
                    </p>
                </div>

                {/* Video Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {videoDemos.map((demo) => (
                        <Link
                            key={demo.id}
                            href={demo.docPath}
                            className="video-card group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                        >
                            {/* Video */}
                            <video
                                src={demo.videoPath}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    {demo.name}
                                </span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-white text-black p-2 rounded-full">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/components"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform duration-300"
                    >
                        View All Components
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default VideoShowcaseGrid

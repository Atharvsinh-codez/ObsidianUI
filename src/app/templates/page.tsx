"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { NavbarContent } from "@/components/navbar-content";
import { ArrowUpRight } from "lucide-react";

const templates = [
    {
        id: "project-one",
        title: "Project One",
        tags: ["Landing", "Fintech", "Web3"],
        href: "/project-one",
        videoUrl: "https://cdn.obsidianui.dev/templates/project-one.mp4",
        poster: "https://image.mux.com/douTLfhlOThh95tbZdrKwYDGynkP2LG9lKiUbJ00X77Q/thumbnail.png?time=1",
    },
];

function TemplateCard({ template }: { template: typeof templates[0] }) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isHovered) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovered]);

    return (
        <Link
            href={template.href}
            className="group block w-full max-w-[600px] mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                {/* 16:9 Container */}
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {/* Thumbnail */}
                    <img
                        src={template.poster}
                        alt={template.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Video */}
                    <video
                        ref={videoRef}
                        src={template.videoUrl}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        playsInline
                        muted
                        loop
                        preload="auto"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {template.title}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            {template.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-black">
            <NavbarContent activeIndex={3} />

            <main className="w-full flex flex-col items-center px-4 py-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                        Templates
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Production-ready UI for your next project.
                    </p>
                </div>

                {/* Templates List */}
                <div className="w-full max-w-[1000px] flex flex-col items-center gap-8">
                    {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </main>
        </div>
    );
}

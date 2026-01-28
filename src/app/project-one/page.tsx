"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Zap } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { NavbarContent } from "@/components/navbar-content";

const project = {
    title: "Project One",
    videoUrl: "https://cdn.obsidianui.dev/templates/project-one.mp4",
    previewUrl: "https://project-one.obsidianui.dev/",
    githubUrl: "https://github.com/Atharvsinh-codez/Project-1",
    tags: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Next.js"],
};

import { useRef, useEffect } from "react";

export default function ProjectOnePage() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-black">
            <NavbarContent activeIndex={3} />

            <main className="w-full px-4 sm:px-6 py-12 flex flex-col items-center">
                <div className="w-full max-w-[900px]">
                    {/* Header Section */}
                    <header className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {project.title}
                                </h1>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href={project.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900"
                                    aria-label="Live Preview"
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900"
                                    aria-label="View on GitHub"
                                >
                                    <FaGithub className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </header>

                    {/* Video Preview */}
                    <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-zinc-100 dark:bg-zinc-900 mb-12 border border-zinc-200 dark:border-zinc-800">
                        <video
                            ref={videoRef}
                            src={project.videoUrl}
                            className="w-full aspect-video object-cover"
                            autoPlay
                            playsInline
                            muted
                            loop
                        />
                    </div>

                    {/* Premium About Card */}
                    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
                            About this template
                        </h2>

                        {/* Intro Text */}
                        <div className="space-y-6 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <p>
                                This template is a <span className="font-semibold text-zinc-900 dark:text-zinc-100">premium landing page concept</span> that explores a bold, futuristic visual direction centered around the evolving <span className="font-semibold text-zinc-900 dark:text-zinc-100">creator economy</span> — presenting creators as valuable digital assets through a sleek and modern interface.
                            </p>
                            <p>
                                Built purely as a <span className="font-semibold text-zinc-900 dark:text-zinc-100">design resource</span>, the template focuses on aesthetics, layout structure, and product storytelling. Every section is carefully composed to demonstrate how complex <span className="font-semibold text-zinc-900 dark:text-zinc-100">fintech</span> or <span className="font-semibold text-zinc-900 dark:text-zinc-100">Web3-style</span> ideas can be communicated with clarity, hierarchy, and strong visual appeal.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10 mt-10 pt-10 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            {/* What it's for */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    What it&apos;s for
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "UI inspiration",
                                        "Startup concepts",
                                        "Fintech showcases",
                                        "Modern web apps"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                            <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Design Goals */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    Design Goals
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Premium visual language",
                                        "Strong typography",
                                        "Modular sections",
                                        "High-end storytelling"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-2 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tech Stack - New Section */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Tech Stack
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        { label: "Framework", val: "Next.js 15" },
                                        { label: "Styling", val: "Tailwind CSS" },
                                        { label: "Animations", val: "Framer Motion" },
                                        { label: "Database", val: "PostgreSQL" }
                                    ].map((item, i) => (
                                        <li key={i} className="flex flex-col text-sm">
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.label}</span>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-200">{item.val}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center sm:text-left">
                            <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                                This is a conceptual UI template only — created to help makers launch beautiful, professional-looking websites faster.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

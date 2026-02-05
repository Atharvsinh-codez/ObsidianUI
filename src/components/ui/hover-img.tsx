"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import "./hover-img.css";

interface ProjectItem {
    title: string;
    label: string;
    imageSrc: string;
}

const defaultProjects: ProjectItem[] = [
    {
        title: "Shree Krishna",
        label: "The Supreme Personality of Godhead",
        imageSrc: "/hover-img/image-1.jpg",
    },
    {
        title: "Radha Krishna",
        label: "The Divine Couple",
        imageSrc: "/hover-img/image-2.jpg",
    },
    {
        title: "Divine Love",
        label: "Eternal Bond",
        imageSrc: "/hover-img/image-3.jpg",
    },
];

interface HoverImgProps {
    projects?: ProjectItem[];
    className?: string;
    isContained?: boolean; // New prop for grid previews
    compact?: boolean; // New prop for compact layout
}

export function HoverImg({ projects = defaultProjects, className, isContained = false, compact = false }: HoverImgProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const thumbnailRef = useRef<HTMLDivElement>(null);
    const xToRef = useRef<gsap.QuickToFunc | null>(null);
    const yToRef = useRef<gsap.QuickToFunc | null>(null);

    useEffect(() => {
        const projectThumbnail = thumbnailRef.current;
        const projectsContainer = containerRef.current?.querySelector(
            ".hover-img-projects"
        ) as HTMLElement | null;

        if (!projectThumbnail || !projectsContainer) return;

        const projectElements = gsap.utils.toArray(
            ".hover-img-project",
            projectsContainer
        ) as HTMLElement[];
        const thumbnails = gsap.utils.toArray(
            ".hover-img-thumbnail",
            projectThumbnail
        ) as HTMLElement[];

        gsap.set(projectThumbnail, { scale: 0, xPercent: -50, yPercent: -50 });

        xToRef.current = gsap.quickTo(projectThumbnail, "x", {
            duration: 0.4,
            ease: "power3.out",
        });
        yToRef.current = gsap.quickTo(projectThumbnail, "y", {
            duration: 0.4,
            ease: "power3.out",
        });

        const handleMouseMove = (e: MouseEvent) => {
            let x = e.clientX;
            let y = e.clientY;

            if (isContained && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }

            xToRef.current?.(x);
            yToRef.current?.(y);
        };

        const handleMouseLeave = () => {
            gsap.to(projectThumbnail, {
                scale: 0,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto",
            });
        };

        projectsContainer.addEventListener("mousemove", handleMouseMove);
        projectsContainer.addEventListener("mouseleave", handleMouseLeave);

        const projectListeners: Array<() => void> = [];

        projectElements.forEach((project, index) => {
            const handleMouseEnter = () => {
                gsap.to(projectThumbnail, {
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto",
                });

                gsap.to(thumbnails, {
                    yPercent: -100 * index,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            };

            project.addEventListener("mouseenter", handleMouseEnter);
            projectListeners.push(() =>
                project.removeEventListener("mouseenter", handleMouseEnter)
            );
        });

        return () => {
            projectsContainer.removeEventListener("mousemove", handleMouseMove);
            projectsContainer.removeEventListener("mouseleave", handleMouseLeave);
            projectListeners.forEach((cleanup) => cleanup());
        };
    }, [projects, isContained]);

    return (
        <div className={`hover-img-container ${compact ? "hover-img-compact" : ""} ${className || ""}`} ref={containerRef}>
            <div className="hover-img-projects">
                {projects.map((project, index) => (
                    <div className="hover-img-project" key={index}>
                        <h2>{project.title}</h2>
                        <p>{project.label}</p>
                    </div>
                ))}
            </div>

            <div
                className="hover-img-thumbnail-wrapper"
                ref={thumbnailRef}
                style={isContained ? { position: "absolute" } : undefined}
            >
                {projects.map((project, index) => (
                    <div className="hover-img-thumbnail" key={index}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.imageSrc} alt={project.title} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HoverImg;

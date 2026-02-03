"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Eye, Copy, Check, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "next-themes";

interface ComponentPreviewProps {
    component: React.ReactNode;
    code: string;
    title?: string;
    className?: string;
    description?: string;
    previewClassName?: string;
}

export function ComponentPreview({
    component,
    code,
    title,
    className,
    description,
    previewClassName,
}: ComponentPreviewProps) {
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [hasCopied, setHasCopied] = useState(false);
    const [previewWidth, setPreviewWidth] = useState<string | number>("100%");
    const [renderKey, setRenderKey] = useState(0);
    const { resolvedTheme } = useTheme();
    const uniqueId = React.useId();

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleReload = () => {
        setRenderKey((prev) => prev + 1);
    };

    const vibrantDarkTheme = {
        plain: {
            color: "#22c55e",
            backgroundColor: "transparent",
        },
        styles: [
            {
                types: ["comment", "prolog", "doctype", "cdata"],
                style: { color: "#525252" },
            },
            {
                types: ["punctuation", "operator"],
                style: { color: "#737373" },
            },
            {
                types: ["property", "tag", "boolean", "number", "constant", "symbol", "deleted"],
                style: { color: "#38bdf8" },
            },
            {
                types: ["selector", "attr-name", "string", "char", "builtin", "inserted"],
                style: { color: "#fbbf24" },
            },
            {
                types: ["url", "variable", "function", "class-name"],
                style: { color: "#38bdf8" },
            },
            {
                types: ["atrule", "attr-value", "keyword"],
                style: { color: "#e879f9" },
            },
            {
                types: ["regex", "important"],
                style: { color: "#f87171" },
            },
        ],
    };

    return (
        <div className={cn("group relative my-8 flex flex-col gap-4", className)}>
            {description && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                    {description}
                </p>
            )}

            <div className="flex items-center justify-between gap-4">
                {/* Tabs */}
                <div className="relative inline-flex p-1 gap-1 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-md">
                    {["preview", "code"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as "preview" | "code")}
                            className={cn(
                                "relative flex items-center justify-center min-w-[80px] px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-10 capitalize cursor-pointer",
                                activeTab === tab
                                    ? "text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            )}
                        >
                            <span className="relative z-10">{tab}</span>
                            {activeTab === tab && (
                                <motion.div
                                    layoutId={`previewActiveTab-${uniqueId}`}
                                    className="absolute inset-0 bg-white dark:bg-zinc-700/80 rounded-full -z-10 shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2">
                    {/* Device Toggles */}
                    <div className="hidden sm:flex items-center p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                        <button
                            onClick={() => setPreviewWidth("100%")}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                previewWidth === "100%"
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                            title="Desktop"
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPreviewWidth("375px")}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                previewWidth === "375px"
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                            title="Mobile"
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Reload */}
                    <button
                        onClick={handleReload}
                        className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Reload Component"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative min-h-[450px] flex bg-zinc-50/50 dark:bg-zinc-900/20 overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
                {/* Refined Grid Pattern Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <AnimatePresence mode="wait">
                    {activeTab === "preview" ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, width: previewWidth }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={cn(
                                "relative z-10 overflow-hidden m-auto bg-transparent",
                                previewWidth === "100%"
                                    ? "w-full h-full"
                                    : "border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl bg-background my-8"
                            )}
                        >
                            <div
                                key={renderKey}
                                className={cn(
                                    "min-h-[450px] w-full h-full flex items-center justify-center p-8",
                                    previewClassName
                                )}
                            >
                                <div className="w-full flex items-center justify-center">
                                    {component}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="code"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 w-full h-full"
                        >
                            <div className="w-full h-full bg-white dark:bg-zinc-950/50 flex flex-col">
                                <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            Example
                                        </span>
                                    </div>
                                    <button
                                        onClick={onCopy}
                                        className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        {hasCopied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <Highlight
                                        theme={resolvedTheme === 'dark' ? vibrantDarkTheme as any : themes.vsLight}
                                        code={code}
                                        language="tsx"
                                    >
                                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                            <pre className={cn(className, "p-6 text-sm leading-relaxed font-mono")} style={{ ...style, backgroundColor: 'transparent' }}>
                                                {tokens.map((line, i) => (
                                                    <div key={i} {...getLineProps({ line })}>
                                                        <span className="select-none opacity-30 mr-4 w-4 inline-block text-right text-xs text-zinc-600">{i + 1}</span>
                                                        {line.map((token, key) => (
                                                            <span key={key} {...getTokenProps({ token })} />
                                                        ))}
                                                    </div>
                                                ))}
                                            </pre>
                                        )}
                                    </Highlight>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

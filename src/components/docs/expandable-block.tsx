"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpandableBlockProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    initialHeight?: string
}

export function ExpandableBlock({
    children,
    initialHeight = "400px",
    className,
    ...props
}: ExpandableBlockProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
        <div
            className={cn("relative rounded-lg", className)}
            {...props}
        >
            <div
                className={cn("overflow-hidden transition-all duration-300 ease-in-out")}
                style={{
                    height: isExpanded ? "auto" : initialHeight,
                    maxHeight: isExpanded ? "none" : initialHeight
                }}
            >
                {children}
            </div>

            {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/10 to-transparent backdrop-blur-sm flex items-end justify-center pb-8">
                    {/* Blur overlay */}
                </div>
            )}

            <div className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
                !isExpanded ? "" : "relative bottom-auto left-auto transform-none mt-4 flex justify-center"
            )}>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shadow-sm bg-background/80 backdrop-blur-md hover:bg-background/90 border"
                >
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Show More <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

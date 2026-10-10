"use client";

import { JetBrains_Mono } from 'next/font/google'
import { AnalyticsDashboard, type AnalyticsDashboardProps } from '@/components/block/analytics-dashboard'
import { cn } from '@/lib/utils'

// The site already loads Inter as --font-inter; the dashboard's code text uses JetBrains Mono.
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap', preload: false })

export function AnalyticsDashboardPreview({ className, ...props }: AnalyticsDashboardProps) {
    return (
        <div className={cn(mono.variable, 'h-full w-full')}>
            <AnalyticsDashboard className={className} {...props} />
        </div>
    )
}

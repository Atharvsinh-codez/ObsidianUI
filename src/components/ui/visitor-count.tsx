'use client'

import { Eye } from 'lucide-react'
import { useVisitorCount } from '@/hooks/use-visitor-count'

export function VisitorCount({ className }: { className?: string }) {
    const { count, loading } = useVisitorCount()

    if (loading) {
        return (
            <div className={`inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 ${className || ''}`}>
                <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
        )
    }

    if (count === 0) {
        return null
    }

    return (
        <div className={`inline-flex items-center gap-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2.5 ${className || ''}`}>
            <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
                <Eye className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                You are the <span className="font-semibold text-black dark:text-white">{count.toLocaleString()}<sup className="text-[10px]">th</sup></span> visitor
            </span>
        </div>
    )
}

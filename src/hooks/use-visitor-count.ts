"use client";

import { useEffect, useState } from 'react';
import { getOrCreateVisitorId } from '@/lib/fingerprint';

interface VisitorStats {
    uniqueVisitors: number;
}

export function useVisitorCount() {
    const [stats, setStats] = useState<VisitorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function trackAndFetchStats() {
            try {
                // Ensure client-side only
                if (typeof window === 'undefined') return;

                const fingerprint = getOrCreateVisitorId();

                // Track visit
                await fetch('/api/visitors', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fingerprint }),
                    cache: 'no-store'
                });

                // Fetch stats
                const response = await fetch('/api/visitors', {
                    method: 'GET',
                    cache: 'no-store'
                });

                if (response.ok && mounted) {
                    const data = await response.json();
                    setStats({
                        uniqueVisitors: data.uniqueVisitors || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch visitor stats:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        trackAndFetchStats();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        count: stats?.uniqueVisitors || 0,
        loading
    };
}

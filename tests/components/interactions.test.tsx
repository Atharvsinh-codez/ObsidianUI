import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

// Keep native controls and event bubbling intact while skipping visual timelines.
vi.mock('motion/react', async () => {
    const ReactModule = await import('react');
    const components = new Map<string, React.ComponentType>();
    const visualProps = new Set(['initial', 'animate', 'exit', 'transition', 'layout', 'layoutId', 'whileInView', 'whileHover', 'whileTap', 'viewport', 'variants', 'custom']);
    return {
        motion: new Proxy({}, { get: (_target, tag: string) => {
            if (!components.has(tag)) {
                components.set(tag, ReactModule.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
                    const nativeProps = Object.fromEntries(Object.entries(props).filter(([key]) => !visualProps.has(key)));
                    return ReactModule.createElement(tag, { ...nativeProps, ref });
                }));
            }
            return components.get(tag);
        } }),
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
        useReducedMotion: () => true,
        useAnimationControls: () => ({ start: () => Promise.resolve(), stop: () => {}, set: () => {} }),
    };
});
vi.mock('@paper-design/shaders-react', () => ({ LiquidMetal: () => null }));

import { LiquidMetalButton } from '@/components/block/liquid-metal';

describe('component interactions', () => {
    it('renders a liquid metal navigation control as one native link', () => {
        render(<LiquidMetalButton href="/docs" target="_blank" rel="noopener noreferrer">Read docs</LiquidMetalButton>);
        const link = screen.getByRole('link', { name: 'Read docs' });
        expect(link).toHaveAttribute('href', '/docs');
        expect(link).toHaveAttribute('target', '_blank');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('keeps a disabled liquid metal link out of the tab order and blocks activation', () => {
        const onClick = vi.fn();
        render(<LiquidMetalButton href="/docs" disabled onClick={onClick}>Read docs</LiquidMetalButton>);
        const control = screen.getByText('Read docs').closest('a')!;
        expect(control).not.toHaveAttribute('href');
        expect(control).toHaveAttribute('aria-disabled', 'true');
        expect(control).toHaveAttribute('tabindex', '-1');
        fireEvent.click(control);
        expect(onClick).not.toHaveBeenCalled();
    });
});

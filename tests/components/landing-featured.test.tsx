import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const previewInteraction = vi.hoisted(() => vi.fn())

vi.mock('motion/react', async importOriginal => ({
    ...await importOriginal<typeof import('motion/react')>(),
    useReducedMotion: () => true,
}))

vi.mock('@/hooks/use-prefers-fine-hover', () => ({ usePrefersFineHover: () => false }))

vi.mock('@/components/catalog/effect-preview', () => ({
    EffectPreview: ({ slug }: { slug: string }) => (
        <button type="button" onClick={() => previewInteraction(slug)}>Try {slug}</button>
    ),
}))

vi.mock('@/components/block/hover-img', () => ({
    HoverImg: ({ projects }: { projects: { title: string }[] }) => (
        <div>{projects.map(project => <span key={project.title}>{project.title}</span>)}</div>
    ),
}))

vi.mock('@/components/catalog/status-bars-preview', () => ({ StatusBarsPreview: () => <div>Status Bars preview</div> }))
vi.mock('@/components/catalog/active-sessions-preview', () => ({ ActiveSessionsPreview: () => <div>Active Sessions preview</div> }))
vi.mock('@/components/catalog/analytics-dashboard-preview', () => ({ AnalyticsDashboardPreview: () => <div>Analytics Dashboard preview</div> }))
vi.mock('@/components/catalog/dashboard-shell-preview', () => ({ DashboardShellPreview: () => <div>Dashboard Shell preview</div> }))

import { ComponentsShowcase } from '@/components/landing/components-showcase'
import { ComponentsGrid } from '@/components/catalog/components-grid'

describe('landing featured components', () => {
    beforeEach(() => {
        previewInteraction.mockClear()
        vi.stubGlobal('IntersectionObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
        })
    })

    it('shows Art Gallery and Hover Image in the shared showcase cards', () => {
        const { container } = render(<ComponentsShowcase />)
        const section = screen.getByRole('region', { name: 'Featured Components' })

        expect(within(section).getAllByRole('article')).toHaveLength(2)
        expect(within(section).getByRole('link', { name: 'View Art Gallery documentation' })).toHaveAttribute('href', '/docs/art-gallery')
        expect(within(section).getByRole('link', { name: 'View Hover Image documentation' })).toHaveAttribute('href', '/docs/hover-img')
        expect(container.querySelectorAll('.component-showcase-card')).toHaveLength(2)
        expect(within(section).getByText('Shree Krishna')).toBeInTheDocument()
        expect(within(section).queryByText('Text reel')).not.toBeInTheDocument()
        expect(within(section).queryByText('Draggable Marquee')).not.toBeInTheDocument()
    })

    it('keeps the Art Gallery interaction separate from its docs link', async () => {
        const user = userEvent.setup()
        render(<ComponentsShowcase />)
        const preview = screen.getByRole('button', { name: 'Try art-gallery' })

        expect(preview.closest('a')).toBeNull()
        await user.click(preview)
        expect(previewInteraction).toHaveBeenCalledWith('art-gallery')
    })

    it('keeps v-prism featured with the newest component first', () => {
        const { container } = render(<ComponentsGrid />)
        expect(container.querySelector('.component-showcase-featured a[aria-label]'))
            .toHaveAttribute('href', '/docs/v-prism')
        const links = container.querySelectorAll('.component-showcase-grid a[aria-label$=" documentation"]')
        expect([...links].map(link => link.getAttribute('href'))).toEqual([
            '/docs/analytics-dashboard', '/docs/dashboard-shell', '/docs/active-sessions', '/docs/status-bars', '/docs/discover-button', '/docs/split-showcase', '/docs/art-gallery', '/docs/hover-img',
            '/docs/draggable-marquee', '/docs/text-stream', '/docs/flip-text',
        ])
    })

    it('marks only the newest gallery cards as New and leaves the featured card unbadged', () => {
        const { container } = render(<ComponentsGrid />)
        const badged = [...container.querySelectorAll('.component-showcase-grid .component-showcase-badge')]
            .map(badge => badge.closest('article')?.querySelector('a[aria-label]')?.getAttribute('href'))
        expect(badged).toEqual(['/docs/analytics-dashboard', '/docs/dashboard-shell', '/docs/active-sessions', '/docs/status-bars', '/docs/discover-button'])
        expect(container.querySelector('.component-showcase-featured .component-showcase-badge')).toBeNull()
    })
})

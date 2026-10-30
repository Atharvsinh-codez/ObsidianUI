import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultParallaxSlides, ParallaxSlider } from '@/components/block/parallax-slider'

const slides = [
    { title: 'Studio Tide', image: '/studio-tide.webp', href: '/work/studio-tide' },
    { title: 'Petal Room', image: '/petal-room.webp', href: '/work/petal-room' },
]

describe('ParallaxSlider', () => {
    it('exposes one readable copy of the slides to assistive technology', () => {
        render(<ParallaxSlider slides={slides} label="Projects" />)
        const carousel = screen.getByRole('group', { name: /^Projects\./ })

        expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
        expect(carousel).toHaveAttribute('tabindex', '0')
        expect(within(carousel).getAllByRole('group').map(slide => slide.getAttribute('aria-label')))
            .toEqual(['1 of 2: Studio Tide', '2 of 2: Petal Room'])
        expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/work/studio-tide', '/work/petal-room'])
        expect(screen.getAllByRole('img').map(image => image.getAttribute('alt'))).toEqual(['Studio Tide', 'Petal Room'])
    })

    it('keeps the duplicate slides out of the tab order', () => {
        const { container } = render(<ParallaxSlider slides={slides} />)
        const links = [...container.querySelectorAll('a')]

        expect(links.length).toBeGreaterThan(slides.length)
        expect(links.filter(link => link.getAttribute('tabindex') !== '-1')).toHaveLength(slides.length)
    })

    it('renders the header only when header content is given', () => {
        const { rerender } = render(<ParallaxSlider slides={slides} />)
        expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        expect(screen.getByRole('region', { name: 'Gallery' })).toBeInTheDocument()

        rerender(<ParallaxSlider slides={slides} eyebrow="Infinite Gallery" title="Quiet Frames" description="Drag to browse." />)
        expect(screen.getByRole('heading', { level: 2, name: 'Quiet Frames' })).toBeInTheDocument()
        expect(screen.getByText('Infinite Gallery')).toBeInTheDocument()
    })

    it('takes over the wheel only when scrollOnWheel is on', () => {
        const { container, rerender } = render(<ParallaxSlider slides={slides} />)
        const viewport = () => container.querySelector('.obsidian-parallax-slider__viewport')!

        expect(fireEvent.wheel(viewport(), { deltaY: 120 })).toBe(false)
        rerender(<ParallaxSlider slides={slides} scrollOnWheel={false} />)
        expect(fireEvent.wheel(viewport(), { deltaY: 120 })).toBe(true)
    })

    it('defaults to portrait frames and switches to landscape', () => {
        const { rerender } = render(<ParallaxSlider slides={slides} />)
        expect(screen.getByRole('region', { name: 'Gallery' })).toHaveAttribute('data-orientation', 'portrait')

        rerender(<ParallaxSlider slides={slides} orientation="landscape" />)
        expect(screen.getByRole('region', { name: 'Gallery' })).toHaveAttribute('data-orientation', 'landscape')
    })

    it('passes each slide focus to its image', () => {
        render(<ParallaxSlider slides={[{ ...slides[0], focus: '30% 60%' }, slides[1]]} />)
        const [first, second] = screen.getAllByRole('img')

        expect(first).toHaveAttribute('data-focus', '30% 60%')
        expect(first.style.objectPosition).toBe('30% 60%')
        expect(second).not.toHaveAttribute('data-focus')
    })

    it('ships demo slides served from the ObsidianUI CDN', () => {
        expect(defaultParallaxSlides).toHaveLength(5)
        for (const slide of defaultParallaxSlides) {
            expect(slide.image).toMatch(/^https:\/\/cdn-new\.obsidianui\.dev\/parallax-slider-images\/[a-z-]+\.webp$/)
            expect(slide.alt).toBeTruthy()
        }
    })
})

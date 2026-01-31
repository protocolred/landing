;(() => {
    const container = document.getElementById('horizon-bg')
    if (!container) return

    const vbWidth = 1024
    const vbHeight = 608
    const section = container.closest('section')
    const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const clamp01 = (value) => Math.max(0, Math.min(1, value))

    let parallaxLayer = null
    let parallaxRaf = 0

    const getParallaxProgress = () => {
        if (section) {
            const rect = section.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
            if (!viewportHeight) return 0
            return clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height))
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
        const docHeight = document.documentElement.scrollHeight || 0
        const maxScroll = Math.max(1, docHeight - viewportHeight)
        return clamp01((window.scrollY || 0) / maxScroll)
    }

    const updateParallax = () => {
        if (!parallaxLayer || prefersReducedMotion) return

        const progress = getParallaxProgress()
        const centered = progress - 0.5

        const translateY = centered * vbHeight * 0.06
        const scale = 1 + centered * 0.02

        const cx = vbWidth / 2
        const cy = vbHeight / 2

        parallaxLayer.attr(
            'transform',
            `translate(0 ${translateY}) translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`
        )
    }

    const scheduleParallax = () => {
        if (parallaxRaf) return
        parallaxRaf = requestAnimationFrame(() => {
            parallaxRaf = 0
            updateParallax()
        })
    }

    const renderWithD3 = () => {
        const d3 = window.d3
        if (!d3) return false

        container.innerHTML = ''

        const horizonY = vbHeight * 0.56

        const svg = d3
            .select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${vbWidth} ${vbHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('aria-hidden', 'true')
            .style('display', 'block')

        const defs = svg.append('defs')
        parallaxLayer = svg.append('g').attr('data-layer', 'horizon')

        const hazeGradient = defs
            .append('radialGradient')
            .attr('id', 'horizonHaze')
            .attr('cx', '50%')
            .attr('cy', `${(horizonY / vbHeight) * 100}%`)
            .attr('r', '70%')

        hazeGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0.12)

        hazeGradient
            .append('stop')
            .attr('offset', '70%')
            .attr('stop-color', '#000213')
            .attr('stop-opacity', 0)

        const horizonGradient = defs
            .append('linearGradient')
            .attr('id', 'horizonLine')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')

        horizonGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0)

        horizonGradient
            .append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0.9)

        horizonGradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0)

        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vbWidth)
            .attr('height', vbHeight)
            .attr('fill', '#00000b')

        parallaxLayer
            .append('ellipse')
            .attr('cx', vbWidth / 2)
            .attr('cy', horizonY)
            .attr('rx', vbWidth * 0.6)
            .attr('ry', vbHeight * 0.28)
            .attr('fill', 'url(#horizonHaze)')

        parallaxLayer
            .append('line')
            .attr('x1', vbWidth * 0.08)
            .attr('x2', vbWidth * 0.92)
            .attr('y1', horizonY)
            .attr('y2', horizonY)
            .attr('stroke', 'url(#horizonLine)')
            .attr('stroke-width', 2)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('opacity', 0.45)

        updateParallax()
        return true
    }

    const render = () => {
        renderWithD3()
    }

    let scheduled = 0
    const scheduleRender = () => {
        if (scheduled) return
        scheduled = requestAnimationFrame(() => {
            scheduled = 0
            render()
        })
    }

    const init = () => {
        render()

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => scheduleRender())
            observer.observe(container)
        } else {
            window.addEventListener('resize', scheduleRender, { passive: true })
        }

        if (!prefersReducedMotion) {
            window.addEventListener('scroll', scheduleParallax, { passive: true })
            window.addEventListener('resize', scheduleParallax, { passive: true })
            scheduleParallax()
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true })
    } else {
        init()
    }
})()

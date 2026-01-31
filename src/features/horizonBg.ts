import * as d3 from 'd3'

import { IDS } from '@/core/constants'
import { byId, prefersReducedMotion } from '@/core/dom'

export function initHorizonBg(): void {
    const container = byId<HTMLElement>(IDS.horizonBg)
    if (!container) return

    const vbWidth = 1024
    const vbHeight = 608

    const render = () => {
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
        const horizonLayer = svg.append('g').attr('data-layer', 'horizon')

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

        horizonLayer
            .append('ellipse')
            .attr('cx', vbWidth / 2)
            .attr('cy', horizonY)
            .attr('rx', vbWidth * 0.6)
            .attr('ry', vbHeight * 0.28)
            .attr('fill', 'url(#horizonHaze)')

        horizonLayer
            .append('line')
            .attr('x1', vbWidth * 0.08)
            .attr('x2', vbWidth * 0.92)
            .attr('y1', horizonY)
            .attr('y2', horizonY)
            .attr('stroke', 'url(#horizonLine)')
            .attr('stroke-width', 2)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('opacity', 0.45)
    }

    let scheduled = 0
    const scheduleRender = () => {
        if (scheduled) return
        scheduled = requestAnimationFrame(() => {
            scheduled = 0
            render()
        })
    }

    render()

    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => scheduleRender())
        observer.observe(container)
    } else {
        window.addEventListener('resize', scheduleRender, { passive: true })
    }

    if (prefersReducedMotion()) return
}

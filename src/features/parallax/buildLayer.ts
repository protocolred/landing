import * as d3 from 'd3'

import { PARALLAX_CONFIG } from '@/data/parallax'

import type { DotNode, LayerConfig, SimulationWithRestart } from './types'
import {
    createColorSampler,
    createJitterForce,
    getOrbitOffset,
    getOrbitPhase,
    randomBetween,
} from './utils'

export const buildLayer = (layer: HTMLElement, config: LayerConfig) => {
    // Layer viewport size (dots are positioned in this coordinate system)
    const rect = layer.getBoundingClientRect()
    const rawWidth = Math.max(layer.clientWidth, rect.width)
    const rawHeight = Math.max(layer.clientHeight, rect.height)
    const width = Math.max(1, rawWidth > 1 ? rawWidth : window.innerWidth)
    const height = Math.max(1, rawHeight > 1 ? rawHeight : window.innerHeight)

    const { count, sizeMin, sizeMax, jitter } = config

    const svg = d3
        .select(layer)
        .selectAll('svg')
        .data([null])
        .join('svg')
        .attr('class', PARALLAX_CONFIG.svgClassName)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)

    const colorSampler = createColorSampler()
    const nodes: DotNode[] = d3.range(count).map(() => {
        const sample = colorSampler()
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: randomBetween(sizeMin, sizeMax),
            color: sample.color,
            opacity: randomBetween(
                PARALLAX_CONFIG.defaults.opacityMin,
                PARALLAX_CONFIG.defaults.opacityMax
            ),
            orbitRadiusPx: randomBetween(
                PARALLAX_CONFIG.orbit.radiusPxMin,
                PARALLAX_CONFIG.orbit.radiusPxMax
            ),
            orbitSpeedRad: randomBetween(
                PARALLAX_CONFIG.orbit.speedRadMin,
                PARALLAX_CONFIG.orbit.speedRadMax
            ),
            orbitPhase: getOrbitPhase(),
            orbitWobbleSpeedRad: randomBetween(
                PARALLAX_CONFIG.orbit.wobbleSpeedRadMin,
                PARALLAX_CONFIG.orbit.wobbleSpeedRadMax
            ),
            orbitWobblePhase: getOrbitPhase(),
        }
    })

    const dots = svg.selectAll('g.parallax-dot').data(nodes).join('g').attr('class', 'parallax-dot')

    dots.selectAll('circle.parallax-dot__outer')
        .data((node: DotNode) => [node])
        .join('circle')
        .attr('class', 'parallax-dot__outer')
        .attr('r', (node: DotNode) => node.r)
        .attr('fill', (node: DotNode) => node.color)
        .attr('opacity', (node: DotNode) => node.opacity)
        .attr('cx', 0)
        .attr('cy', 0)

    dots.selectAll('circle.parallax-dot__inner')
        .data((node: DotNode) => [node])
        .join('circle')
        .attr('class', 'parallax-dot__inner')
        .attr('r', (node: DotNode) => node.r * 0.75)
        .attr('fill', (node: DotNode) => node.color)
        .attr('opacity', (node: DotNode) => Math.min(1, node.opacity * 1.6))
        .attr('cx', 0)
        .attr('cy', 0)

    const padding = PARALLAX_CONFIG.padding
    let rafId = 0
    let latestTime = 0
    const updateFrame = () => {
        rafId = 0
        const t = latestTime
        for (const node of nodes) {
            if (node.x < -padding) node.x = width + padding
            if (node.x > width + padding) node.x = -padding
            if (node.y < -padding) node.y = height + padding
            if (node.y > height + padding) node.y = -padding
        }

        dots.attr('transform', (node: DotNode) => {
            const { dx, dy } = getOrbitOffset(node, t)
            return `translate(${node.x + dx}, ${node.y + dy})`
        })
    }

    const scheduleFrame = () => {
        if (rafId) return
        rafId = requestAnimationFrame(updateFrame)
    }
    const simulation = d3
        .forceSimulation(nodes)
        .force('jitter', createJitterForce(jitter))
        .velocityDecay(PARALLAX_CONFIG.simulation.velocityDecay)
        .alpha(PARALLAX_CONFIG.simulation.alpha)
        .alphaDecay(PARALLAX_CONFIG.simulation.alphaDecay)

    simulation.on('tick', () => {
        latestTime = performance.now() / 1000
        scheduleFrame()
    })

    const destroy = () => {
        if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = 0
        }
    }

    return { layer, simulation: simulation as SimulationWithRestart, destroy }
}

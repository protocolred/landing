import * as d3 from 'd3'

import { PARALLAX_CONFIG } from '@/data/parallax'
import type { DotNode } from './types'
import {
    createColorSampler,
    createJitterForce,
    getLayerConfig,
    getOrbitOffset,
    getOrbitPhase,
    randomBetween,
} from './utils'

export const buildLayer = (layer: HTMLElement) => {
    // Layer viewport size (dots are positioned in this coordinate system)
    const width = Math.max(1, layer.clientWidth)
    const height = Math.max(1, layer.clientHeight)

    const { count, sizeMin, sizeMax, jitter } = getLayerConfig(layer)

    const svg = d3
        .select(layer)
        .selectAll('svg')
        .data([null])
        .join('svg')
        .attr('class', PARALLAX_CONFIG.svgClassName)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'none')

    const colorSampler = createColorSampler()
    const nodes: DotNode[] = d3.range(count).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: randomBetween(sizeMin, sizeMax),
        color: colorSampler(),
        opacity: randomBetween(
            PARALLAX_CONFIG.defaults.opacityMin,
            PARALLAX_CONFIG.defaults.opacityMax
        ),
        orbitRadiusPx: randomBetween(PARALLAX_CONFIG.orbit.radiusPxMin, PARALLAX_CONFIG.orbit.radiusPxMax),
        orbitSpeedRad: randomBetween(PARALLAX_CONFIG.orbit.speedRadMin, PARALLAX_CONFIG.orbit.speedRadMax),
        orbitPhase: getOrbitPhase(),
        orbitWobbleSpeedRad: randomBetween(
            PARALLAX_CONFIG.orbit.wobbleSpeedRadMin,
            PARALLAX_CONFIG.orbit.wobbleSpeedRadMax
        ),
        orbitWobblePhase: getOrbitPhase(),
    }))

    const circles = svg
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', (node: DotNode) => node.r)
        .attr('fill', (node: DotNode) => node.color)
        .attr('opacity', (node: DotNode) => node.opacity)

    const padding = PARALLAX_CONFIG.padding
    const simulation = d3
        .forceSimulation(nodes)
        .force('x', d3.forceX(width / 2).strength(PARALLAX_CONFIG.simulation.forceStrength))
        .force('y', d3.forceY(height / 2).strength(PARALLAX_CONFIG.simulation.forceStrength))
        .force('jitter', createJitterForce(jitter))
        .velocityDecay(PARALLAX_CONFIG.simulation.velocityDecay)
        .alpha(PARALLAX_CONFIG.simulation.alpha)
        .alphaDecay(PARALLAX_CONFIG.simulation.alphaDecay)
        .on('tick', () => {
            const t = performance.now() / 1000
            for (const node of nodes) {
                if (node.x < -padding) node.x = width + padding
                if (node.x > width + padding) node.x = -padding
                if (node.y < -padding) node.y = height + padding
                if (node.y > height + padding) node.y = -padding
            }

            circles
                .attr('cx', (node: DotNode) => {
                    const { dx } = getOrbitOffset(node, t)
                    return node.x + dx
                })
                .attr('cy', (node: DotNode) => {
                    const { dy } = getOrbitOffset(node, t)
                    return node.y + dy
                })
        })

    return { layer, simulation }
}

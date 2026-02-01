import * as d3 from 'd3'

import { PARALLAX_CONFIG } from '@/data/parallax'

interface DotNode extends d3.SimulationNodeDatum {
    x: number
    y: number
    vx?: number
    vy?: number
    r: number
    color: string
    opacity: number
}

interface LayerState {
    layer: HTMLElement
    simulation: d3.Simulation<DotNode, undefined>
}

type SizeUnit = 'px' | 'dvh' | 'dwh' | 'dvw' | 'vh' | 'vw' | '%'

interface SizeValue {
    value: number
    unit: SizeUnit
}

const createJitterForce = (strength: number) => {
    let nodes: DotNode[] = []
    const force = (alpha: number) => {
        const scaled = strength * alpha
        for (const node of nodes) {
            node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * scaled
            node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * scaled
        }
    }
    force.initialize = (newNodes: DotNode[]) => {
        nodes = newNodes
    }
    return force as d3.Force<DotNode, undefined>
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const parseSizeValue = (value: string): SizeValue | null => {
    const trimmed = value.trim()
    const match = trimmed.match(/^(-?\d*\.?\d+)(px|dvh|dwh|dvw|vh|vw|%)?$/)
    if (!match) return null
    const numeric = Number(match[1])
    if (!Number.isFinite(numeric)) return null
    return {
        value: numeric,
        unit: (match[2] ?? 'px') as SizeUnit,
    }
}

const resolveSizePx = (value: string): number | null => {
    const parsed = parseSizeValue(value)
    if (!parsed) return null
    switch (parsed.unit) {
        case 'px':
            return parsed.value
        case 'dvh':
        case 'dwh':
        case 'vh':
            return (window.innerHeight * parsed.value) / 100
        case 'dvw':
        case 'vw':
            return (window.innerWidth * parsed.value) / 100
        case '%': {
            const basis = Math.min(window.innerWidth, window.innerHeight)
            return (basis * parsed.value) / 100
        }
        default:
            return null
    }
}

const createColorSampler = () => {
    const gray = d3.interpolateRgb(
        PARALLAX_CONFIG.colorSampler.grayStart,
        PARALLAX_CONFIG.colorSampler.grayEnd
    )
    const red = d3.interpolateRgb(
        PARALLAX_CONFIG.colorSampler.redStart,
        PARALLAX_CONFIG.colorSampler.redEnd
    )
    return () => {
        const roll = Math.random()
        if (roll < PARALLAX_CONFIG.colorSampler.grayChance) {
            return gray(Math.random())
        }
        if (roll < PARALLAX_CONFIG.colorSampler.redChance) {
            return red(Math.random())
        }
        const mix = d3.interpolateRgb(gray(Math.random()), red(Math.random()))
        return mix(Math.random())
    }
}

const buildLayer = (layer: HTMLElement) => {
    const width = Math.max(1, layer.clientWidth)
    const height = Math.max(1, layer.clientHeight)
    const count = Number.parseInt(
        layer.dataset.count ?? String(PARALLAX_CONFIG.defaultLayer.count),
        10
    )
    const sizeMin = Number.parseFloat(
        layer.dataset.sizeMin ?? String(PARALLAX_CONFIG.defaultLayer.sizeMin)
    )
    const sizeMax = Number.parseFloat(
        layer.dataset.sizeMax ?? String(PARALLAX_CONFIG.defaultLayer.sizeMax)
    )
    const jitter = Number.parseFloat(
        layer.dataset.jitter ?? String(PARALLAX_CONFIG.defaultLayer.jitter)
    )

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
            for (const node of nodes) {
                if (node.x < -padding) node.x = width + padding
                if (node.x > width + padding) node.x = -padding
                if (node.y < -padding) node.y = height + padding
                if (node.y > height + padding) node.y = -padding
            }

            circles.attr('cx', (node: DotNode) => node.x).attr('cy', (node: DotNode) => node.y)
        })

    return { layer, simulation }
}

export const initParallax = () => {
    const container = document.querySelector<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const layers = Array.from(
        container.querySelectorAll<HTMLElement>(PARALLAX_CONFIG.layerSelector)
    )
    if (layers.length === 0) return

    const states = new Map<HTMLElement, LayerState>()

    const getScrollRatio = () => {
        const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        return Math.min(1, Math.max(0, window.scrollY / scrollMax))
    }

    const setContainerSize = (scrollRatio: number) => {
        const startSizePx = resolveSizePx(PARALLAX_CONFIG.containerSize.start)
        const endSizePx = resolveSizePx(PARALLAX_CONFIG.containerSize.end)
        if (startSizePx === null || endSizePx === null) return
        const sizePx = startSizePx + (endSizePx - startSizePx) * scrollRatio
        container.style.setProperty('--parallax-size', `${Math.max(0, sizePx)}px`)
    }

    const rebuild = () => {
        setContainerSize(getScrollRatio())
        for (const state of states.values()) {
            state.simulation.stop()
        }
        states.clear()

        for (const layer of layers) {
            const svg = layer.querySelector('svg')
            if (svg) {
                svg.remove()
            }
            const state = buildLayer(layer)
            if (prefersReducedMotion.matches) {
                state.simulation.stop()
            }
            states.set(layer, state)
        }
    }

    const applyParallax = (() => {
        let ticking = false
        let latestScroll = window.scrollY
        const update = () => {
            const scrollRatio = getScrollRatio()
            setContainerSize(scrollRatio)
            const maxShrink = PARALLAX_CONFIG.motion.maxShrink
            const frontLayer = layers[layers.length - 1]
            for (const layer of layers) {
                const speed = Number.parseFloat(
                    layer.dataset.speed ?? String(PARALLAX_CONFIG.motion.defaultSpeed)
                )
                const shrink = Number.parseFloat(
                    layer.dataset.shrink ?? String(PARALLAX_CONFIG.motion.defaultShrink)
                )
                const effectiveShrink = layer === frontLayer ? 0 : shrink
                const scale = 1 - scrollRatio * maxShrink * effectiveShrink
                layer.style.transform = `translate3d(0, ${latestScroll * speed}px, 0) scale(${scale})`
            }
            ticking = false
        }
        return () => {
            latestScroll = window.scrollY
            if (!ticking) {
                ticking = true
                requestAnimationFrame(update)
            }
        }
    })()

    const handleResize = (() => {
        let raf = 0
        return () => {
            if (raf) cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                rebuild()
                applyParallax()
            })
        }
    })()

    rebuild()
    applyParallax()

    window.addEventListener('scroll', applyParallax, { passive: true })
    window.addEventListener('resize', handleResize)
    prefersReducedMotion.addEventListener('change', rebuild)
}

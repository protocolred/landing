import * as d3 from 'd3'

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

const createColorSampler = () => {
    const gray = d3.interpolateRgb('rgb(10, 10, 10)', 'rgb(170, 170, 170)')
    const red = d3.interpolateRgb('rgb(40, 12, 12)', 'rgb(210, 50, 50)')
    return () => {
        const roll = Math.random()
        if (roll < 0.55) {
            return gray(Math.random())
        }
        if (roll < 0.85) {
            return red(Math.random())
        }
        const mix = d3.interpolateRgb(gray(Math.random()), red(Math.random()))
        return mix(Math.random())
    }
}

const buildLayer = (layer: HTMLElement) => {
    const width = Math.max(1, window.innerWidth)
    const height = Math.max(1, window.innerHeight)
    const count = Number.parseInt(layer.dataset.count ?? '60', 10)
    const sizeMin = Number.parseFloat(layer.dataset.sizeMin ?? '1')
    const sizeMax = Number.parseFloat(layer.dataset.sizeMax ?? '3')
    const jitter = Number.parseFloat(layer.dataset.jitter ?? '0.35')

    const svg = d3
        .select(layer)
        .selectAll('svg')
        .data([null])
        .join('svg')
        .attr('class', 'parallax-svg')
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
        opacity: randomBetween(0.35, 0.9),
    }))

    const circles = svg
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', (node) => node.r)
        .attr('fill', (node) => node.color)
        .attr('opacity', (node) => node.opacity)

    const padding = 12
    const simulation = d3
        .forceSimulation(nodes)
        .force('x', d3.forceX(width / 2).strength(0.002))
        .force('y', d3.forceY(height / 2).strength(0.002))
        .force('jitter', createJitterForce(jitter))
        .velocityDecay(0.35)
        .alpha(0.9)
        .alphaDecay(0.004)
        .on('tick', () => {
            for (const node of nodes) {
                if (node.x < -padding) node.x = width + padding
                if (node.x > width + padding) node.x = -padding
                if (node.y < -padding) node.y = height + padding
                if (node.y > height + padding) node.y = -padding
            }

            circles.attr('cx', (node) => node.x).attr('cy', (node) => node.y)
        })

    return { layer, simulation }
}

export const initParallax = () => {
    const container = document.querySelector<HTMLElement>('.parallax')
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const layers = Array.from(container.querySelectorAll<HTMLElement>('.parallax-layer'))
    if (layers.length === 0) return

    const states = new Map<HTMLElement, LayerState>()

    const rebuild = () => {
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
            const scrollMax = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight
            )
            const scrollRatio = Math.min(1, Math.max(0, latestScroll / scrollMax))
            const maxShrink = 0.08
            for (const layer of layers) {
                const speed = Number.parseFloat(layer.dataset.speed ?? '0.1')
                const shrink = Number.parseFloat(layer.dataset.shrink ?? '0')
                const scale = 1 - scrollRatio * maxShrink * shrink
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
            })
        }
    })()

    rebuild()
    applyParallax()

    window.addEventListener('scroll', applyParallax, { passive: true })
    window.addEventListener('resize', handleResize)
    prefersReducedMotion.addEventListener('change', rebuild)
}

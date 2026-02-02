import { PARALLAX_CONFIG } from '@/data/parallax'
import type { LayerState } from './types'
import { buildLayer } from './buildLayer'
import { getLayerConfig, resolveSizePx } from './utils'

export const initParallax = () => {
    const container = document.querySelector<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const layers = Array.from(
        container.querySelectorAll<HTMLElement>(PARALLAX_CONFIG.layerSelector)
    )
    if (layers.length === 0) return

    const states = new Map<HTMLElement, LayerState>()
    let observer: IntersectionObserver | null = null

    const startSimulation = (state: LayerState) => {
        if (prefersReducedMotion.matches) return
        if (state.running) return
        state.simulation.alpha(PARALLAX_CONFIG.simulation.alpha).restart()
        state.running = true
    }

    const stopSimulation = (state: LayerState) => {
        if (!state.running) return
        state.simulation.stop()
        state.running = false
    }

    const getScrollRatio = () => {
        // 0..1 value used for container size + layer scaling
        const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        return Math.min(1, Math.max(0, window.scrollY / scrollMax))
    }

    const containerSizePx = {
        start: null as number | null,
        end: null as number | null,
    }

    const refreshContainerSizeBounds = () => {
        containerSizePx.start = resolveSizePx(PARALLAX_CONFIG.containerSize.start)
        containerSizePx.end = resolveSizePx(PARALLAX_CONFIG.containerSize.end)
    }

    const setContainerSize = (scrollRatio: number) => {
        // Writes CSS var `--parallax-size` so CSS can react to scroll
        if (containerSizePx.start === null || containerSizePx.end === null) return
        const sizePx =
            containerSizePx.start + (containerSizePx.end - containerSizePx.start) * scrollRatio
        container.style.setProperty('--parallax-size', `${Math.max(0, sizePx)}px`)
    }

    const rebuild = () => {
        refreshContainerSizeBounds()
        setContainerSize(getScrollRatio())
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()

        for (const layer of layers) {
            const svg = layer.querySelector('svg')
            if (svg) {
                svg.remove()
            }
            const state = buildLayer(layer)
            const running = !prefersReducedMotion.matches
            if (!running) {
                state.simulation.stop()
            }
            states.set(layer, {
                ...state,
                isVisible: true,
                running,
            })
        }
        setupObserver()
    }

    const setupObserver = () => {
        if (observer) observer.disconnect()
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const target = entry.target as HTMLElement
                    const state = states.get(target)
                    if (!state) continue
                    state.isVisible = entry.isIntersecting
                    if (entry.isIntersecting) {
                        startSimulation(state)
                    } else {
                        stopSimulation(state)
                    }
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0.01,
            }
        )
        for (const layer of layers) {
            observer.observe(layer)
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
                // Per-layer motion overrides
                const { speed, shrink } = getLayerConfig(layer)
                const effectiveShrink = layer === frontLayer ? 0 : shrink
                const scale = 1 - scrollRatio * maxShrink * effectiveShrink
                // Translate on scroll + optional scale to create depth
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

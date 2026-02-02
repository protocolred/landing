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

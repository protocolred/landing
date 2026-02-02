import { SELECTORS } from '@/core/constants'
import { prefersReducedMotion, qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { buildLayer } from './buildLayer'
import { createLayerObserver } from './observer'
import { createParallaxScroller } from './scroll'
import type { LayerState } from './types'
import { resolveSizePx } from './utils'

export const initParallax: FeatureInit = () => {
    const container = qs<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const layers = qsa<HTMLElement>(PARALLAX_CONFIG.layerSelector, container)
    if (layers.length === 0) return

    const states = new Map<HTMLElement, LayerState>()

    const startSimulation = (state: LayerState) => {
        if (prefersReducedMotion()) return
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

    const observerControls = createLayerObserver({
        layers,
        states,
        onVisibilityChange: (state, isVisible) => {
            if (isVisible) {
                startSimulation(state)
            } else {
                stopSimulation(state)
            }
        },
    })

    const rebuild = () => {
        refreshContainerSizeBounds()
        setContainerSize(getScrollRatio())
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()

        for (const layer of layers) {
            const svg = layer.querySelector(SELECTORS.parallaxLayerSvg)
            if (svg) {
                svg.remove()
            }
            const state = buildLayer(layer)
            const running = !prefersReducedMotion()
            if (!running) {
                state.simulation.stop()
            }
            states.set(layer, {
                ...state,
                isVisible: true,
                running,
            })
        }
        observerControls.observeAll()
    }

    const applyParallax = createParallaxScroller({
        layers,
        getScrollRatio,
        setContainerSize,
    })

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
    motionQuery.addEventListener('change', rebuild)

    return () => {
        window.removeEventListener('scroll', applyParallax)
        window.removeEventListener('resize', handleResize)
        motionQuery.removeEventListener('change', rebuild)
        observerControls.disconnect()
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()
    }
}

import { createDisposer } from '@/core/dispose'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { createLayerObserver } from './observer'
import { createParallaxScroller } from './scroll'
import { createParallaxStateManager } from './state'
import { resolveSizePx } from './utils'

export const initParallax: FeatureInit = () => {
    const container = qs<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const disposer = createDisposer()
    const layers = qsa<HTMLElement>(PARALLAX_CONFIG.layerSelector, container)
    if (layers.length === 0) return

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

    const stateManager = createParallaxStateManager({
        layers,
        getScrollRatio,
        setContainerSize,
        refreshContainerSizeBounds,
    })

    const observerControls = createLayerObserver({
        layers,
        states: stateManager.states,
        onVisibilityChange: (state, isVisible) => {
            if (isVisible) {
                stateManager.startSimulation(state)
            } else {
                stateManager.stopSimulation(state)
            }
        },
    })

    const rebuild = () => {
        stateManager.rebuild()
        observerControls.observeAll()
    }

    const applyParallax = createParallaxScroller({
        layers,
        getScrollRatio,
        setContainerSize,
    })

    let resizeRaf = 0
    const handleResize = () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf)
        resizeRaf = requestAnimationFrame(() => {
            rebuild()
            applyParallax()
        })
    }

    rebuild()
    applyParallax()

    disposer.addListener(window, 'scroll', applyParallax, { passive: true })
    disposer.addListener(window, 'resize', handleResize)
    disposer.addListener(motionQuery, 'change', rebuild)

    return () => {
        if (resizeRaf) {
            cancelAnimationFrame(resizeRaf)
            resizeRaf = 0
        }
        disposer.disposeAll()
        observerControls.disconnect()
        stateManager.destroy()
    }
}

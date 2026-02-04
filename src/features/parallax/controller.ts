import { createDisposer } from '@/core/dispose'
import { SELECTORS } from '@/core/constants'
import { shouldAnimate } from '@/core/dom'
import { createLogger } from '@/core/log'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { buildLayer } from './buildLayer'
import type { LayerState } from './types'
import { getLayerConfig, resolveSizePx } from './utils'

export const createParallaxController = (options: {
    container: HTMLElement
    layers: HTMLElement[]
    motionQuery: MediaQueryList
}) => {
    const { layers, motionQuery, container } = options
    const disposer = createDisposer()
    const states = new Map<HTMLElement, LayerState>()
    const logger = createLogger('parallax', PARALLAX_CONFIG.debug)

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

    const startSimulation = (state: LayerState) => {
        if (!shouldAnimate()) return
        if (state.running) return
        state.simulation.alpha(PARALLAX_CONFIG.simulation.alpha).restart()
        state.running = true
    }

    const stopSimulation = (state: LayerState) => {
        if (!state.running) return
        state.simulation.stop()
        state.running = false
    }

    let observer: IntersectionObserver | null = null
    const observeAll = () => {
        if (observer) observer.disconnect()
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const target = entry.target as HTMLElement
                    const state = states.get(target)
                    if (!state) continue
                    state.isVisible = entry.isIntersecting
                    if (entry.isIntersecting && shouldAnimate()) {
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
        for (const layer of layers) observer.observe(layer)
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
            const svg = layer.querySelector(SELECTORS.parallaxLayerSvg)
            if (svg) svg.remove()
            const state = buildLayer(layer)
            const running = shouldAnimate()
            if (!running) {
                state.simulation.stop()
            }
            states.set(layer, {
                ...state,
                isVisible: true,
                running,
            })
        }
    }

    let ticking = false
    let latestScroll = window.scrollY
    const updateParallax = () => {
        const scrollRatio = getScrollRatio()
        setContainerSize(scrollRatio)
        const maxShrink = PARALLAX_CONFIG.motion.maxShrink
        const frontLayer = layers[layers.length - 1]
        for (const layer of layers) {
            const { speed, shrink } = getLayerConfig(layer)
            const effectiveShrink = layer === frontLayer ? 0 : shrink
            const scale = 1 - scrollRatio * maxShrink * effectiveShrink
            layer.style.transform = `translate3d(0, ${latestScroll * speed}px, 0) scale(${scale})`
        }
        ticking = false
    }

    const applyParallax = () => {
        latestScroll = window.scrollY
        if (!ticking) {
            ticking = true
            requestAnimationFrame(updateParallax)
        }
    }

    let resizeRaf = 0
    const handleResize = () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf)
        resizeRaf = requestAnimationFrame(() => {
            rebuild()
            applyParallax()
        })
    }

    const handleMotionChange = () => {
        const enabled = shouldAnimate()
        logger.info(`motion ${enabled ? 'enabled' : 'reduced'}`)
        rebuild()
        observeAll()
    }

    rebuild()
    observeAll()
    applyParallax()

    disposer.addListener(window, 'scroll', applyParallax, { passive: true })
    disposer.addListener(window, 'resize', handleResize)
    disposer.addListener(motionQuery, 'change', handleMotionChange)

    const destroy = () => {
        if (resizeRaf) {
            cancelAnimationFrame(resizeRaf)
            resizeRaf = 0
        }
        if (observer) observer.disconnect()
        observer = null
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()
        disposer.disposeAll()
    }

    return { destroy }
}

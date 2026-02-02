import { SELECTORS } from '@/core/constants'
import { qs, shouldAnimate } from '@/core/dom'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { buildLayer } from './buildLayer'
import type { LayerState } from './types'

export const createParallaxStateManager = (options: {
    layers: HTMLElement[]
    getScrollRatio: () => number
    setContainerSize: (scrollRatio: number) => void
    refreshContainerSizeBounds: () => void
}) => {
    const { layers, getScrollRatio, setContainerSize, refreshContainerSizeBounds } = options
    const states = new Map<HTMLElement, LayerState>()

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

    const rebuild = () => {
        refreshContainerSizeBounds()
        setContainerSize(getScrollRatio())
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()

        for (const layer of layers) {
            const svg = qs(SELECTORS.parallaxLayerSvg, layer)
            if (svg) {
                svg.remove()
            }
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

    const destroy = () => {
        for (const state of states.values()) {
            stopSimulation(state)
            state.destroy()
        }
        states.clear()
    }

    return {
        states,
        rebuild,
        destroy,
        startSimulation,
        stopSimulation,
    }
}

import { createDisposer } from '@/core/dispose'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { createParallaxController } from './controller'

export const initParallax: FeatureInit = () => {
    const container = qs<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return
    const layerSelector = `.${PARALLAX_CONFIG.layerClassName}`

    // Render parallax layers from config so HTML stays structure-only.
    const desiredLayerCount = Math.max(1, PARALLAX_CONFIG.layerParams.length)
    const existingLayers = qsa<HTMLElement>(layerSelector, container)
    if (existingLayers.length !== desiredLayerCount) {
        existingLayers.forEach((layer) => layer.remove())
        for (let i = 0; i < desiredLayerCount; i += 1) {
            const layer = document.createElement('div')
            layer.className = PARALLAX_CONFIG.layerClassName
            container.append(layer)
        }
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const disposer = createDisposer()
    const layers = qsa<HTMLElement>(layerSelector, container)
    if (layers.length === 0) return

    const controller = createParallaxController({ container, layers, motionQuery })
    disposer.add(controller.destroy)

    return () => {
        disposer.disposeAll()
    }
}

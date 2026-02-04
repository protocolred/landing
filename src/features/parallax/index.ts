import { createDisposer } from '@/core/dispose'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { PARALLAX_CONFIG } from '@/data/parallax'

import { createParallaxController } from './controller'

export const initParallax: FeatureInit = () => {
    const container = qs<HTMLElement>(PARALLAX_CONFIG.containerSelector)
    if (!container) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const disposer = createDisposer()
    const layers = qsa<HTMLElement>(PARALLAX_CONFIG.layerSelector, container)
    if (layers.length === 0) return

    const controller = createParallaxController({ container, layers, motionQuery })
    disposer.add(controller.destroy)

    return () => {
        disposer.disposeAll()
    }
}

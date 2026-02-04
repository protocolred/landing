import { PARALLAX_CONFIG } from '@/data/parallax'

import { getLayerConfig } from './utils'

export const createParallaxScroller = (options: {
    layers: HTMLElement[]
    getScrollRatio: () => number
    setContainerSize: (scrollRatio: number) => void
}) => {
    const { layers, getScrollRatio, setContainerSize } = options

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
}

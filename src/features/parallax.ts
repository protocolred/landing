import { IDS, PARALLAX } from '@/core/constants'
import { byId, prefersReducedMotion, qs } from '@/core/dom'

type ParallaxLayer = {
    element: HTMLElement
    speed: number
    scale: number
}

export function initParallax(): void {
    const horizon = byId<HTMLElement>(IDS.horizonBg)
    const stars = qs<HTMLElement>(PARALLAX.layers[0].selector)
    const nebula = qs<HTMLElement>(PARALLAX.layers[1].selector)
    const grid = qs<HTMLElement>(PARALLAX.layers[2].selector)

    if (!stars || !nebula || !grid || !horizon) return
    if (prefersReducedMotion()) return

    const layers: ParallaxLayer[] = [
        { element: stars, speed: PARALLAX.layers[0].speed, scale: PARALLAX.layers[0].scale },
        { element: nebula, speed: PARALLAX.layers[1].speed, scale: PARALLAX.layers[1].scale },
        { element: grid, speed: PARALLAX.layers[2].speed, scale: PARALLAX.layers[2].scale },
        { element: horizon, speed: PARALLAX.layers[3].speed, scale: PARALLAX.layers[3].scale },
    ]

    let scheduled = 0
    const update = () => {
        scheduled = 0
        const scrollY = window.scrollY || window.pageYOffset || 0
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0

        layers.forEach(({ element, speed, scale }) => {
            const startOffset = Math.min(
                PARALLAX.maxOffsetPx,
                viewportHeight * speed * PARALLAX.startOffsetFactor
            )
            const raw = -startOffset + scrollY * speed
            const offset = Math.max(-PARALLAX.maxOffsetPx, Math.min(0, raw))
            element.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`
        })
    }

    const schedule = () => {
        if (scheduled) return
        scheduled = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()
}

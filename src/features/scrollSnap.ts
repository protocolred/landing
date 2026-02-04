import { createDisposer } from '@/core/dispose'
import { qsa, shouldAnimate } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { SCROLL_SNAP_CONFIG } from '@/data/scrollSnap'

type EasingFn = (t: number) => number

const EASINGS: Record<string, EasingFn> = {
    easeInOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const initScrollSnap: FeatureInit = () => {
    if (!SCROLL_SNAP_CONFIG.enabled) return
    if (!shouldAnimate()) return

    const sections = qsa<HTMLElement>(SCROLL_SNAP_CONFIG.sectionSelector)
    if (sections.length === 0) return

    const disposer = createDisposer()
    let positions = sections.map((section) =>
        Math.round(section.getBoundingClientRect().top + window.scrollY)
    )

    let scrollTimeout = 0
    let animationRaf = 0
    let isAnimating = false
    let previousScrollBehavior = ''

    const getDuration = (distance: number) => {
        const { minMs, maxMs, msPerPx } = SCROLL_SNAP_CONFIG.duration
        return clamp(distance * msPerPx, minMs, maxMs)
    }

    const stopAnimation = () => {
        if (animationRaf) {
            cancelAnimationFrame(animationRaf)
            animationRaf = 0
        }
        if (isAnimating) {
            document.documentElement.style.scrollBehavior = previousScrollBehavior
            isAnimating = false
        }
    }

    const refreshPositions = () => {
        positions = sections.map((section) =>
            Math.round(section.getBoundingClientRect().top + window.scrollY)
        )
    }

    const getNearestTarget = (currentY: number) => {
        let nearest = positions[0] ?? 0
        let minDistance = Math.abs(currentY - nearest)
        for (let i = 1; i < positions.length; i += 1) {
            const distance = Math.abs(currentY - positions[i])
            if (distance < minDistance) {
                minDistance = distance
                nearest = positions[i]
            }
        }
        return { nearest, minDistance }
    }

    const animateTo = (targetY: number) => {
        const startY = window.scrollY
        const delta = targetY - startY
        const distance = Math.abs(delta)
        if (distance < SCROLL_SNAP_CONFIG.minDistancePx) return

        stopAnimation()
        isAnimating = true
        previousScrollBehavior = document.documentElement.style.scrollBehavior
        document.documentElement.style.scrollBehavior = 'auto'

        const startTime = performance.now()
        const duration = getDuration(distance)
        const easing =
            EASINGS[SCROLL_SNAP_CONFIG.easing] ?? EASINGS.easeInOutCubic

        const step = (now: number) => {
            const elapsed = now - startTime
            const t = clamp(elapsed / duration, 0, 1)
            const eased = easing(t)
            window.scrollTo(0, Math.round(startY + delta * eased))
            if (t < 1) {
                animationRaf = requestAnimationFrame(step)
                return
            }
            stopAnimation()
        }

        animationRaf = requestAnimationFrame(step)
    }

    const maybeSnap = () => {
        if (!shouldAnimate()) return
        if (isAnimating) return
        const { nearest, minDistance } = getNearestTarget(window.scrollY)
        if (minDistance < SCROLL_SNAP_CONFIG.minDistancePx) return
        animateTo(nearest)
    }

    const scheduleSnap = () => {
        if (scrollTimeout) window.clearTimeout(scrollTimeout)
        scrollTimeout = window.setTimeout(maybeSnap, SCROLL_SNAP_CONFIG.settleDelayMs)
    }

    const onScroll = () => {
        if (isAnimating) return
        scheduleSnap()
    }

    const cancelOnUserInput = () => {
        stopAnimation()
        scheduleSnap()
    }

    const handleResize = () => {
        refreshPositions()
        scheduleSnap()
    }

    refreshPositions()
    scheduleSnap()

    disposer.addListener(window, 'scroll', onScroll, { passive: true })
    disposer.addListener(window, 'resize', handleResize)
    disposer.addListener(window, 'wheel', cancelOnUserInput, { passive: true })
    disposer.addListener(window, 'touchstart', cancelOnUserInput, { passive: true })
    disposer.addListener(window, 'keydown', cancelOnUserInput)
    disposer.addListener(window, 'load', refreshPositions)

    return () => {
        if (scrollTimeout) window.clearTimeout(scrollTimeout)
        stopAnimation()
        disposer.disposeAll()
    }
}

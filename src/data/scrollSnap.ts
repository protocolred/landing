export type ScrollSnapEasing = 'easeInOutCubic' | 'easeOutCubic'

export const SCROLL_SNAP_CONFIG = {
    // Enable/disable scroll snapping behavior
    enabled: true,
    // Selector for the snap sections (expected 4 blocks)
    sectionSelector: '.desktop .list > .block',
    // Wait after last scroll event before snapping (ms)
    settleDelayMs: 140,
    // Ignore tiny distances to avoid micro-snaps (px)
    minDistancePx: 12,
    // Duration tuning: duration = clamp(min, max, distance * msPerPx)
    duration: {
        minMs: 220,
        maxMs: 520,
        msPerPx: 0.45,
    },
    // Easing curve for snap animation
    easing: 'easeInOutCubic' as ScrollSnapEasing,
} as const

export const PERFORMANCE_HUD_CONFIG = {
    // Enable HUD bootstrap; runtime capability checks still apply.
    enabled: true,
    // Show HUD only on desktop viewport.
    desktopMediaQuery: '(width > 900px)',
    // Long task entry type used for rough CPU load estimate.
    longTaskEntryType: 'longtask',
    // UI refresh interval.
    updateIntervalMs: 1000,
    labels: {
        cpu: 'CPU',
        memory: 'MEM',
        fps: 'FPS',
    },
} as const

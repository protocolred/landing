export const THREE_BODY_CONFIG = {
    containerSelector: '.three-body',
    canvasClassName: 'three-body-canvas',
    bodyCount: 3,
    motion: {
        speed: 0.08,
        wobbleSpeed: 0.22,
        linkSpeed: 0.14,
    },
    orbit: {
        baseRadiusRatio: 0.18,
        linkRadiusRatio: 0.07,
        wobbleRadiusRatio: 0.04,
        linkPhaseMultiplier: 1.8,
    },
    body: {
        coreRadiusRatio: 0.003,
        glowRadiusRatio: 0.01,
        pulseAmplitude: 0.2,
        pulseSpeed: 0.6,
    },
    glow: {
        coreColor: 'rgba(245, 250, 255, 0.95)',
        haloColor: 'rgba(160, 200, 255, 0.45)',
        outerColor: 'rgba(160, 200, 255, 0)',
    },
    trail: {
        fadeAlpha: 0.12,
    },
    quality: {
        maxDpr: 2,
        maxFps: 60,
    },
} as const

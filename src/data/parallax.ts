export const PARALLAX_CONFIG = {
    containerSelector: '.parallax',
    layerSelector: '.parallax-layer',
    svgClassName: 'parallax-svg',
    containerSize: {
        start: '100dvw',
        end: '100dvw',
    },
    padding: 12,
    defaultLayer: {
        count: 10,
        sizeMin: 1,
        sizeMax: 3,
        jitter: 0.35,
    },
    motion: {
        maxShrink: 0.9,
        defaultSpeed: 0.1,
        defaultShrink: 0,
    },
    simulation: {
        forceStrength: 0.002,
        velocityDecay: 0.35,
        alpha: 0.9,
        alphaDecay: 0.004,
    },
    colorSampler: {
        grayStart: 'rgb(110, 10, 10)',
        grayEnd: 'rgb(110, 10, 10)',
        redStart: 'rgb(40, 12, 12)',
        redEnd: 'rgb(210, 50, 50)',
        grayChance: 0.55,
        redChance: 0.85,
    },
    defaults: {
        opacityMin: 0.35,
        opacityMax: 0.9,
    },
} as const

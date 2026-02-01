export const PARALLAX_CONFIG = {
    // Root container for the parallax stack
    containerSelector: '.parallax',
    // Individual layers inside container; each layer gets its own SVG + simulation
    layerSelector: '.parallax-layer',
    // Class applied to generated SVG
    svgClassName: 'parallax-svg',

    // Parallax container size interpolation across scroll (used for CSS variable --parallax-size)
    containerSize: {
        start: '100dvw',
        end: '100dvw',
    },

    // Extra margin beyond viewport before dots wrap around to the other side (px)
    padding: 12,

    // Defaults for a layer when no data-* attrs are provided on `.parallax-layer`
    defaultLayer: {
        // How many dots to spawn in the layer (can be overridden by `data-count`)
        count: 10,
        // Dot radius range in px (overridden by `data-size-min` / `data-size-max`)
        sizeMin: .1,
        sizeMax: 4,
        // Random velocity "noise" strength (overridden by `data-jitter`)
        jitter: 0.35,
    },

    // Scroll-driven parallax transform settings
    motion: {
        // Maximum layer shrink factor applied via scale()
        maxShrink: -0.9,
        // Translate speed multiplier for layer (overridden by `data-speed`)
        defaultSpeed: -0.01,
        // Shrink multiplier for layer (overridden by `data-shrink`)
        defaultShrink: 1,
    },

    // D3 physics simulation parameters (how dots drift/settle)
    simulation: {
        forceStrength: 0.0001,
        velocityDecay: 0.1,
        alpha: 0.9,
        alphaDecay: 0.004,
    },

    // Per-dot circular micro-motion (atom-like orbit) drawn on top of simulated position
    orbit: {
        // Orbit radius range in px
        radiusPxMin: 1.5,
        radiusPxMax: 10,
        // Angular speed range in rad/s (negative means opposite direction)
        speedRadMin: -2.2,
        speedRadMax: 2.2,
        // Extra "breathing" wobble of orbit radius (rad/s)
        wobbleSpeedRadMin: 0.6,
        wobbleSpeedRadMax: 1.6,
    },

    // Dot color distribution
    colorSampler: {
        grayStart: 'rgba(204,61,61,0.5)',
        grayEnd: 'rgba(179,110,110,0.5)',
        redStart: 'rgba(0,0,0,0.1)',
        redEnd: 'rgba(210, 50, 50, .9)',
        // Probability thresholds:
        // - roll < grayChance  => pick from gray gradient
        // - roll < redChance   => pick from red gradient
        // - otherwise          => mix gray+red
        grayChance: 0.55,
        redChance: 0.85,
    },

    // Dot opacity range
    defaults: {
        opacityMin: 0.35,
        opacityMax: 0.9,
    },
} as const

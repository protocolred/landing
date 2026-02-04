type NumericRange = readonly [number, number]

type LayerField = 'speed' | 'shrink' | 'count' | 'sizeMin' | 'sizeMax' | 'jitter'

const lerp = (range: NumericRange, t: number) => range[0] + (range[1] - range[0]) * t

const valueByIndex = (range: NumericRange, index: number, total: number, curvePower: number) => {
    if (total <= 1) return range[0]
    const linearT = index / (total - 1)
    const easedT = Math.pow(linearT, curvePower)
    return lerp(range, easedT)
}

const roundTo = (value: number, digits: number) => {
    const factor = 10 ** digits
    return Math.round(value * factor) / factor
}

const LAYER_SERIES: {
    layerCount: number
    ranges: Record<LayerField, NumericRange>
    curves: Record<LayerField, number>
} = {
    layerCount: 4,
    ranges: {
        speed: [0.06, 0.24],
        shrink: [0.75, 0],
        count: [70, 130],
        sizeMin: [0.8, 2.2],
        sizeMax: [2.4, 5.6],
        jitter: [0.45, 0.22],
    },
    curves: {
        speed: 1.35,
        shrink: 1,
        count: 1,
        sizeMin: 1.12,
        sizeMax: 1.24,
        jitter: 0.9,
    },
}

const buildLayerParams = () =>
    Array.from({ length: LAYER_SERIES.layerCount }, (_, index) => ({
        speed: roundTo(
            valueByIndex(
                LAYER_SERIES.ranges.speed,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.speed
            ),
            3
        ),
        shrink: roundTo(
            valueByIndex(
                LAYER_SERIES.ranges.shrink,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.shrink
            ),
            3
        ),
        count: Math.round(
            valueByIndex(
                LAYER_SERIES.ranges.count,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.count
            )
        ),
        sizeMin: roundTo(
            valueByIndex(
                LAYER_SERIES.ranges.sizeMin,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.sizeMin
            ),
            3
        ),
        sizeMax: roundTo(
            valueByIndex(
                LAYER_SERIES.ranges.sizeMax,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.sizeMax
            ),
            3
        ),
        jitter: roundTo(
            valueByIndex(
                LAYER_SERIES.ranges.jitter,
                index,
                LAYER_SERIES.layerCount,
                LAYER_SERIES.curves.jitter
            ),
            3
        ),
    }))

export const PARALLAX_CONFIG = {
    // Enable extra debug logs for the parallax controller
    debug: false,
    // Root container for the parallax stack
    containerSelector: '.parallax',
    // Class for generated layer nodes (each layer gets its own SVG + simulation)
    layerClassName: 'parallax-layer',
    // Class applied to generated SVG
    svgClassName: 'parallax-svg',

    // Parallax container size interpolation across scroll (used for CSS variable --parallax-size)
    containerSize: {
        start: '100dvw',
        end: '100dvw',
    },

    // Extra margin beyond viewport before dots wrap around to the other side (px)
    padding: 12,

    // Base fallback values for layer params when index-specific params are omitted.
    defaultLayer: {
        count: 1,
        // Dot radius range in px
        sizeMin: 0.02,
        sizeMax: 2,
        // Random velocity "noise" strength
        jitter: 0.8,
    },

    // Scroll-driven parallax transform settings
    motion: {
        // Maximum layer shrink factor applied via scale()
        maxShrink: -0.9,
        // Translate speed multiplier for layer
        defaultSpeed: -0.01,
        // Shrink multiplier for layer
        defaultShrink: 1,
    },

    // Layer params are generated from one normalized series config.
    // To retune all layers, edit `LAYER_SERIES` above.
    layerParams: buildLayerParams(),

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
        grayStart: 'rgba(180,180,185,0.5)',
        grayEnd: 'rgba(140,145,150,0.5)',
        redStart: 'rgba(30,30,35,0.1)',
        redEnd: 'rgba(170, 100, 100, .9)',
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

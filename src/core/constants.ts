export const IDS = {
    horizonBg: 'horizon-bg',
    protocolText: 'protocol-text',
    protocolJoke: 'protocol-joke',
    storeMain: 'store-main',
    bottomHero: 'bottom-hero',
    bottomSub: 'bottom-sub',
    appSection: 'app',
} as const

export const SELECTORS = {
    headerNavItems: '.header [data-target]',
    headerLogoButton: '.header .logo-button',
    glitchLetters: '.glitch-letter',
    pageBgLayers: '[data-parallax-layer]',
    pageBgLayerStars: '.page-bg__layer--stars',
    pageBgLayerNebula: '.page-bg__layer--nebula',
    pageBgLayerGrid: '.page-bg__layer--grid',
} as const

export const PARALLAX = {
    layers: [
        { selector: SELECTORS.pageBgLayerStars, speed: 0.02, scale: 1.06, baseOffset: -80 },
        { selector: SELECTORS.pageBgLayerNebula, speed: 0.04, scale: 1.08, baseOffset: -140 },
        { selector: SELECTORS.pageBgLayerGrid, speed: 0.08, scale: 1.12, baseOffset: -220 },
        { selector: `#${IDS.horizonBg}`, speed: 0.06, scale: 1.0, baseOffset: 0 },
    ],
    maxOffsetPx: 220,
} as const

export const TEXT = {
    glitchCharacters: '2470ABCDEFGHIJKLNOPQRSTUVXYZ',
    scrambleCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
} as const

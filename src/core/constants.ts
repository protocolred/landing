export const SELECTORS = {
    headerNavItems: '.header [data-target]',
    headerLogoButton: '.header .logo-button',
    glitchLetters: '.glitch-letter',
    protocolTextLetters: '.main-text-row .glitch-letter',
    protocolText: '.protocol-text',
    protocolJoke: '.protocol-joke',
    storeMain: '.store-main',
    bottomHeadline: '.bottom-headline',
    bottomSub: '.bottom-sub',
    bottomSubParagraphs: 'p',
    appSection: '.app',
    parallaxLayerSvg: 'svg',
} as const

export const TEXT = {
    glitchCharacters: '2470ABCDEFGHIJKLNOPQRSTUVXYZ',
    scrambleCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
} as const

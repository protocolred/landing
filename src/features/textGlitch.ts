import { SELECTORS, TEXT } from '@/core/constants'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { pickRandomAvoid, pickRandomChar } from '@/core/random'

const createSingleLetterScheduler = (options: {
    protocolLetters: HTMLElement[]
    baseIntervalMs: number
    getRandomChar: (avoidChar?: string) => string
}) => {
    const { protocolLetters, baseIntervalMs, getRandomChar } = options
    let singleLetterActive = false
    let singleLetterTimeoutId: number | undefined
    let singleLetterIntervalId: number | undefined
    let schedulerTimeoutId: number | undefined
    let lastSingleLetter: HTMLElement | null = null

    const runSingleLetterGlitch = (onDone: () => void) => {
        if (singleLetterActive) return
        if (protocolLetters.length === 0) {
            onDone()
            return
        }
        singleLetterActive = true

        if (singleLetterTimeoutId) {
            window.clearTimeout(singleLetterTimeoutId)
            singleLetterTimeoutId = undefined
        }
        if (singleLetterIntervalId) {
            window.clearInterval(singleLetterIntervalId)
            singleLetterIntervalId = undefined
        }

        const targetLetter =
            pickRandomAvoid(protocolLetters, lastSingleLetter, 10) ?? protocolLetters[0]
        lastSingleLetter = targetLetter
        const finalChar = targetLetter.dataset.final || targetLetter.textContent || ''
        if (!finalChar) {
            singleLetterActive = false
            onDone()
            return
        }

        targetLetter.textContent = getRandomChar(finalChar)
        singleLetterTimeoutId = window.setTimeout(() => {
            singleLetterIntervalId = window.setInterval(() => {
                const nextChar = getRandomChar()
                targetLetter.textContent = nextChar
            }, baseIntervalMs)
            singleLetterTimeoutId = window.setTimeout(() => {
                if (singleLetterIntervalId) {
                    window.clearInterval(singleLetterIntervalId)
                    singleLetterIntervalId = undefined
                }
                targetLetter.textContent = finalChar
                singleLetterActive = false
                onDone()
            }, 1000)
        }, 1000)
    }

    const scheduleNextSingleLetter = () => {
        if (schedulerTimeoutId) window.clearTimeout(schedulerTimeoutId)
        const delayMs = 5000 + Math.random() * 10000
        schedulerTimeoutId = window.setTimeout(() => {
            runSingleLetterGlitch(scheduleNextSingleLetter)
        }, delayMs)
    }

    const start = () => {
        scheduleNextSingleLetter()
    }

    const dispose = () => {
        if (singleLetterTimeoutId) window.clearTimeout(singleLetterTimeoutId)
        if (singleLetterIntervalId) window.clearInterval(singleLetterIntervalId)
        if (schedulerTimeoutId) window.clearTimeout(schedulerTimeoutId)
        singleLetterTimeoutId = undefined
        singleLetterIntervalId = undefined
        schedulerTimeoutId = undefined
    }

    return { start, dispose }
}

export const initTextGlitch: FeatureInit = () => {
    const protocolText = qs<HTMLElement>(SELECTORS.protocolText)
    const letters = qsa<HTMLElement>(SELECTORS.glitchLetters)
    if (letters.length === 0) return
    const protocolLetters = protocolText
        ? Array.from(protocolText.querySelectorAll<HTMLElement>(SELECTORS.protocolTextLetters))
        : []
    const baseIntervalMs = 80

    const getRandomChar = (avoidChar = ''): string =>
        pickRandomChar(TEXT.glitchCharacters, avoidChar)

    const runTextEffect = () => {
        let tick = 0
        const maxTicks = 18
        const settleOffsets = Array.from({ length: letters.length }, (_, i) => i + 4)

        const timer = window.setInterval(() => {
            tick++
            letters.forEach((letter, index) => {
                const finalChar = letter.dataset.final || letter.textContent || ''
                if (tick < settleOffsets[index]) {
                    letter.textContent = getRandomChar()
                } else {
                    letter.textContent = finalChar
                }
            })

            if (tick > maxTicks + letters.length) {
                window.clearInterval(timer)
            }
        }, baseIntervalMs)
    }

    letters.forEach((letter) => {
        letter.dataset.final = letter.textContent || ''
    })

    runTextEffect()
    if (protocolText) protocolText.addEventListener('click', runTextEffect)

    const scheduler = createSingleLetterScheduler({
        protocolLetters,
        baseIntervalMs,
        getRandomChar,
    })
    scheduler.start()

    return () => {
        if (protocolText) protocolText.removeEventListener('click', runTextEffect)
        scheduler.dispose()
    }
}

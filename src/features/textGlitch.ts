import { SELECTORS, TEXT } from '@/core/constants'
import { qs, qsa } from '@/core/dom'

export function initTextGlitch(): void {
    const protocolText = qs<HTMLElement>(SELECTORS.protocolText)
    const letters = qsa<HTMLElement>(SELECTORS.glitchLetters)
    if (letters.length === 0) return
    const protocolLetters = protocolText
        ? Array.from(protocolText.querySelectorAll<HTMLElement>('.main-text-row .glitch-letter'))
        : []
    const baseIntervalMs = 80

    const getRandomChar = (avoidChar = ''): string => {
        if (TEXT.glitchCharacters.length === 0) return avoidChar
        let nextChar = avoidChar
        while (nextChar === avoidChar) {
            const randomIndex = Math.floor(Math.random() * TEXT.glitchCharacters.length)
            nextChar = TEXT.glitchCharacters[randomIndex]
        }
        return nextChar
    }

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

    let singleLetterActive = false
    let singleLetterTimeoutId: number | undefined
    let singleLetterIntervalId: number | undefined
    let schedulerTimeoutId: number | undefined
    let lastSingleLetterIndex = -1

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

        let targetIndex = Math.floor(Math.random() * protocolLetters.length)
        if (protocolLetters.length > 1) {
            let guard = 0
            while (targetIndex === lastSingleLetterIndex && guard < 10) {
                targetIndex = Math.floor(Math.random() * protocolLetters.length)
                guard += 1
            }
        }
        lastSingleLetterIndex = targetIndex
        const targetLetter = protocolLetters[targetIndex]
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

    scheduleNextSingleLetter()
}

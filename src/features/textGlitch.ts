import { SELECTORS, TEXT, TIMINGS } from '@/core/constants'
import { createDisposer } from '@/core/dispose'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { pickRandomChar } from '@/core/random'
import { createSingleLetterScheduler } from '@/features/textGlitch/scheduler'

export const initTextGlitch: FeatureInit = () => {
    const protocolText = qs<HTMLElement>(SELECTORS.protocolText)
    const letters = qsa<HTMLElement>(SELECTORS.glitchLetters)
    if (letters.length === 0) return
    const protocolLetters = protocolText
        ? qsa<HTMLElement>(SELECTORS.protocolTextLetters, protocolText)
        : []
    const baseIntervalMs = TIMINGS.glitch.baseIntervalMs
    const disposer = createDisposer()
    let runTextEffectIntervalId: number | undefined

    const getRandomChar = (avoidChar = ''): string =>
        pickRandomChar(TEXT.glitchCharacters, avoidChar)

    const runTextEffect = () => {
        let tick = 0
        const maxTicks = TIMINGS.glitch.maxTicks
        const settleOffsets = Array.from(
            { length: letters.length },
            (_, i) => i + TIMINGS.glitch.settleOffsetStart
        )

        if (runTextEffectIntervalId) {
            window.clearInterval(runTextEffectIntervalId)
            runTextEffectIntervalId = undefined
        }
        runTextEffectIntervalId = disposer.addInterval(() => {
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
                if (runTextEffectIntervalId) {
                    window.clearInterval(runTextEffectIntervalId)
                    runTextEffectIntervalId = undefined
                }
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
        if (runTextEffectIntervalId) window.clearInterval(runTextEffectIntervalId)
        runTextEffectIntervalId = undefined
        disposer.disposeAll()
    }
}

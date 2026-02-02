import { TIMINGS } from '@/core/constants'
import { createDisposer } from '@/core/dispose'
import { pickRandomAvoid } from '@/core/random'

export const createSingleLetterScheduler = (options: {
    protocolLetters: HTMLElement[]
    baseIntervalMs: number
    getRandomChar: (avoidChar?: string) => string
}) => {
    const { protocolLetters, baseIntervalMs, getRandomChar } = options
    const disposer = createDisposer()
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
        singleLetterTimeoutId = disposer.addTimeout(() => {
            singleLetterIntervalId = disposer.addInterval(() => {
                const nextChar = getRandomChar()
                targetLetter.textContent = nextChar
            }, baseIntervalMs)
            singleLetterTimeoutId = disposer.addTimeout(() => {
                if (singleLetterIntervalId) {
                    window.clearInterval(singleLetterIntervalId)
                    singleLetterIntervalId = undefined
                }
                targetLetter.textContent = finalChar
                singleLetterActive = false
                onDone()
            }, TIMINGS.glitch.singleLetterDurationMs)
        }, TIMINGS.glitch.singleLetterDelayMs)
    }

    const scheduleNextSingleLetter = () => {
        if (schedulerTimeoutId) window.clearTimeout(schedulerTimeoutId)
        const delayMs =
            TIMINGS.glitch.singleLetterMinPauseMs +
            Math.random() * TIMINGS.glitch.singleLetterJitterMs
        schedulerTimeoutId = disposer.addTimeout(() => {
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
        disposer.disposeAll()
    }

    return { start, dispose }
}

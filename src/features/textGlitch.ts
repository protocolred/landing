import { SELECTORS, TEXT } from '@/core/constants'
import { qs, qsa } from '@/core/dom'

export function initTextGlitch(): void {
    const letters = qsa<HTMLElement>(SELECTORS.glitchLetters)
    if (letters.length === 0) return

    const protocolText = qs<HTMLElement>(SELECTORS.protocolText)

    const runTextEffect = () => {
        let tick = 0
        const maxTicks = 18
        const settleOffsets = Array.from({ length: letters.length }, (_, i) => i + 4)

        const timer = window.setInterval(() => {
            tick++
            letters.forEach((letter, index) => {
                const finalChar = letter.dataset.final || letter.textContent || ''
                if (tick < settleOffsets[index]) {
                    const randomIndex = Math.floor(Math.random() * TEXT.glitchCharacters.length)
                    letter.textContent = TEXT.glitchCharacters[randomIndex]
                } else {
                    letter.textContent = finalChar
                }
            })

            if (tick > maxTicks + letters.length) {
                window.clearInterval(timer)
            }
        }, 80)
    }

    letters.forEach((letter) => {
        letter.dataset.final = letter.textContent || ''
    })

    runTextEffect()
    if (protocolText) protocolText.addEventListener('click', runTextEffect)
}

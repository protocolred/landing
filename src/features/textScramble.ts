export type ScrambleText = (
    element: HTMLElement,
    fromText: string,
    toText: string,
    durationMs?: number
) => Promise<void>

export const createTextScrambler = (options: {
    prefersReducedMotion: () => boolean
    randomChar: () => string
}): ScrambleText => {
    const { prefersReducedMotion, randomChar } = options
    const scrambleTokens = new WeakMap<Element, number>()

    return (element, fromText, toText, durationMs = 500) => {
        if (prefersReducedMotion()) {
            element.textContent = toText
            return Promise.resolve()
        }

        const from = typeof fromText === 'string' ? fromText : String(fromText ?? '')
        const nextText = typeof toText === 'string' ? toText : String(toText ?? '')
        if (from === nextText) {
            element.textContent = nextText
            return Promise.resolve()
        }

        const token = (scrambleTokens.get(element) || 0) + 1
        scrambleTokens.set(element, token)

        const maxLen = Math.max(from.length, nextText.length)
        const toPadded = nextText.padEnd(maxLen, ' ')

        const order = Array.from({ length: maxLen }, (_, i) => i)
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[order[i], order[j]] = [order[j], order[i]]
        }

        const settledMask = Array.from({ length: maxLen }, () => false)
        let nextToSettle = 0
        const start = performance.now()

        return new Promise<void>((resolve) => {
            const frame = (now: number) => {
                if (scrambleTokens.get(element) !== token) return resolve()

                const progress = Math.min(1, (now - start) / durationMs)
                const desiredSettled = Math.floor(progress * maxLen)
                while (nextToSettle < desiredSettled) {
                    const idx = order[nextToSettle]
                    settledMask[idx] = true
                    nextToSettle++
                }

                let out = ''
                for (let i = 0; i < maxLen; i++) {
                    const targetChar = toPadded[i]
                    if (settledMask[i]) {
                        out += targetChar
                        continue
                    }
                    if (targetChar === ' ' || targetChar === '\n' || targetChar === '\t') {
                        out += targetChar
                        continue
                    }
                    out += randomChar()
                }

                element.textContent = out.replace(/\s+$/, '')

                if (progress < 1) {
                    requestAnimationFrame(frame)
                    return
                }

                element.textContent = nextText
                resolve()
            }

            requestAnimationFrame(frame)
        })
    }
}

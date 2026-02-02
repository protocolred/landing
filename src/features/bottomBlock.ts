import { SELECTORS, TEXT } from '@/core/constants'
import { prefersReducedMotion, qs } from '@/core/dom'
import { getBottomBlockCopies, type BottomBlockCopy } from '@/data/api'

export function initBottomBlock(): void {
    const bottomHeadlineElement = qs<HTMLElement>(SELECTORS.bottomHeadline)
    const bottomSubElement = qs<HTMLElement>(SELECTORS.bottomSub)
    const bottomBlockElement = qs<HTMLElement>(SELECTORS.appSection)

    if (!bottomHeadlineElement || !bottomSubElement || !bottomBlockElement) return

    const scrambleTokens = new WeakMap<Element, number>()

    const getRandomChar = () => {
        const randomIndex = Math.floor(Math.random() * TEXT.scrambleCharacters.length)
        return TEXT.scrambleCharacters[randomIndex]
    }

    const animateScrambleText = (
        element: HTMLElement,
        fromText: string,
        toText: string,
        durationMs = 500
    ) => {
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
                    out += getRandomChar()
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

    const renderParagraphs = (element: HTMLElement, paragraphs: string[]) => {
        element.innerHTML = ''
        paragraphs.forEach((text) => {
            const p = document.createElement('p')
            p.textContent = text
            element.appendChild(p)
        })
    }

    const applyBottomBlockCopy = (copy: BottomBlockCopy) => {
        if (typeof copy.headline === 'string' && copy.headline.trim()) {
            bottomHeadlineElement.textContent = copy.headline
        }
        if (Array.isArray(copy.paragraphs) && copy.paragraphs.length > 0) {
            renderParagraphs(bottomSubElement, copy.paragraphs)
        }
    }

    const bottomCopies = getBottomBlockCopies()
    if (bottomCopies.length === 0) return

    let currentBottomCopy: BottomBlockCopy | null = null

    const pickNextBottomCopy = () => {
        if (bottomCopies.length === 1) return bottomCopies[0] ?? null
        const getRandomItem = () => bottomCopies[Math.floor(Math.random() * bottomCopies.length)]!

        let next = getRandomItem()
        let guard = 0
        while (next === currentBottomCopy && guard < 10) {
            next = getRandomItem()
            guard++
        }
        return next
    }

    const transitionBottomBlockCopy = async (copy: BottomBlockCopy) => {
        const headlineTo = typeof copy.headline === 'string' ? copy.headline : ''
        const paragraphsTo = Array.isArray(copy.paragraphs) ? copy.paragraphs : []

        const headlineFrom = bottomHeadlineElement.textContent ?? ''
        const jobs: Array<Promise<void>> = []
        jobs.push(animateScrambleText(bottomHeadlineElement, headlineFrom, headlineTo, 500))

        const existing = Array.from(bottomSubElement.querySelectorAll('p'))
        while (existing.length < paragraphsTo.length) {
            const p = document.createElement('p')
            bottomSubElement.appendChild(p)
            existing.push(p)
        }

        for (let i = 0; i < existing.length; i++) {
            const element = existing[i]!
            const from = element.textContent ?? ''
            const nextText = paragraphsTo[i] ?? ''
            jobs.push(
                animateScrambleText(element, from, nextText, 500).then(() => {
                    if (i >= paragraphsTo.length) element.remove()
                })
            )
        }

        await Promise.all(jobs)
        currentBottomCopy = copy
    }

    const initial = pickNextBottomCopy()
    if (initial) {
        currentBottomCopy = initial
        applyBottomBlockCopy(initial)
    }

    const onBottomBlockActivate = (event?: Event) => {
        if ((event?.target as HTMLElement | null)?.closest?.('a')) return
        const next = pickNextBottomCopy()
        if (!next) return
        transitionBottomBlockCopy(next)
    }

    bottomBlockElement.addEventListener('click', onBottomBlockActivate)
    bottomBlockElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        if ((event.target as HTMLElement | null)?.closest?.('a')) return
        event.preventDefault()
        onBottomBlockActivate(event)
    })

    if (!bottomBlockElement.hasAttribute('tabindex')) bottomBlockElement.tabIndex = 0
}

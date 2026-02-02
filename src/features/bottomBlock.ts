import { SELECTORS, TEXT, TIMINGS } from '@/core/constants'
import { qs, shouldAnimate } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { pickRandomChar } from '@/core/random'
import { getBottomBlockCopies, type BottomBlockCopy } from '@/data/api'
import {
    applyBottomBlockCopy,
    ensureParagraphElements,
    normalizeBottomSubParagraphs,
} from '@/features/bottomBlock/render'
import { createBottomBlockPicker } from '@/features/bottomBlock/selection'
import { createTextScrambler } from '@/features/textScramble'

export const initBottomBlock: FeatureInit = () => {
    const bottomHeadlineElement = qs<HTMLElement>(SELECTORS.bottomHeadline)
    const bottomSubElement = qs<HTMLElement>(SELECTORS.bottomSub)
    const bottomBlockElement = qs<HTMLElement>(SELECTORS.appSection)

    if (!bottomHeadlineElement || !bottomSubElement || !bottomBlockElement) return

    const getRandomChar = () => pickRandomChar(TEXT.scrambleCharacters)
    const animateScrambleText = createTextScrambler({
        shouldAnimate,
        randomChar: getRandomChar,
    })

    const bottomCopies = getBottomBlockCopies()
    if (bottomCopies.length === 0) return

    let currentBottomCopy: BottomBlockCopy | null = null

    const pickNextBottomCopy = createBottomBlockPicker(bottomCopies)

    const transitionBottomBlockCopy = async (copy: BottomBlockCopy) => {
        const headlineTo = typeof copy.headline === 'string' ? copy.headline : ''
        const rawParagraphsTo = Array.isArray(copy.paragraphs) ? copy.paragraphs : []
        const { lines: paragraphsTo, rightAlignedLineIndex } =
            normalizeBottomSubParagraphs(rawParagraphsTo)

        const headlineFrom = bottomHeadlineElement.textContent ?? ''
        const jobs: Array<Promise<void>> = []
        jobs.push(
            animateScrambleText(
                bottomHeadlineElement,
                headlineFrom,
                headlineTo,
                TIMINGS.bottomBlock.scrambleDurationMs
            )
        )

        const existing = ensureParagraphElements(bottomSubElement, rawParagraphsTo.length)

        for (let i = 0; i < existing.length; i++) {
            const element = existing[i]!
            const from = element.textContent ?? ''
            const nextText = paragraphsTo[i] ?? ''
            element.classList.toggle('app-sub-right', rightAlignedLineIndex === i)
            jobs.push(
                animateScrambleText(
                    element,
                    from,
                    nextText,
                    TIMINGS.bottomBlock.scrambleDurationMs
                ).then(() => {
                    if (i >= paragraphsTo.length) element.remove()
                })
            )
        }

        await Promise.all(jobs)
        currentBottomCopy = copy
    }

    const initial = pickNextBottomCopy(currentBottomCopy)
    if (initial) {
        currentBottomCopy = initial
        applyBottomBlockCopy(
            {
                headline: bottomHeadlineElement,
                sub: bottomSubElement,
            },
            initial
        )
    }

    const onBottomBlockActivate = (event?: Event) => {
        if ((event?.target as HTMLElement | null)?.closest?.('a')) return
        const next = pickNextBottomCopy(currentBottomCopy)
        if (!next) return
        transitionBottomBlockCopy(next)
    }

    const onBottomBlockKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        if ((event.target as HTMLElement | null)?.closest?.('a')) return
        event.preventDefault()
        onBottomBlockActivate(event)
    }

    bottomBlockElement.addEventListener('click', onBottomBlockActivate)
    bottomBlockElement.addEventListener('keydown', onBottomBlockKeydown)

    if (!bottomBlockElement.hasAttribute('tabindex')) bottomBlockElement.tabIndex = 0

    return () => {
        bottomBlockElement.removeEventListener('click', onBottomBlockActivate)
        bottomBlockElement.removeEventListener('keydown', onBottomBlockKeydown)
    }
}

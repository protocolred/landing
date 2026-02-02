import { SELECTORS, TEXT } from '@/core/constants'
import { prefersReducedMotion, qs } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { pickRandomAvoid, pickRandomChar } from '@/core/random'
import { getBottomBlockCopies, type BottomBlockCopy } from '@/data/api'
import { createTextScrambler } from '@/features/textScramble'

export const initBottomBlock: FeatureInit = () => {
    const bottomHeadlineElement = qs<HTMLElement>(SELECTORS.bottomHeadline)
    const bottomSubElement = qs<HTMLElement>(SELECTORS.bottomSub)
    const bottomBlockElement = qs<HTMLElement>(SELECTORS.appSection)

    if (!bottomHeadlineElement || !bottomSubElement || !bottomBlockElement) return

    const getRandomChar = () => pickRandomChar(TEXT.scrambleCharacters)
    const animateScrambleText = createTextScrambler({
        prefersReducedMotion,
        randomChar: getRandomChar,
    })

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
        return pickRandomAvoid(bottomCopies, currentBottomCopy, 10) ?? null
    }

    const transitionBottomBlockCopy = async (copy: BottomBlockCopy) => {
        const headlineTo = typeof copy.headline === 'string' ? copy.headline : ''
        const paragraphsTo = Array.isArray(copy.paragraphs) ? copy.paragraphs : []

        const headlineFrom = bottomHeadlineElement.textContent ?? ''
        const jobs: Array<Promise<void>> = []
        jobs.push(animateScrambleText(bottomHeadlineElement, headlineFrom, headlineTo, 500))

        const existing = Array.from(
            bottomSubElement.querySelectorAll(SELECTORS.bottomSubParagraphs)
        )
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

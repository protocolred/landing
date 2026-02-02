import { SELECTORS } from '@/core/constants'
import { qsa } from '@/core/dom'
import type { BottomBlockCopy } from '@/data/api'

type NormalizedParagraphs = {
    lines: string[]
    rightAlignedLineIndex: number | null
}

export const normalizeBottomSubParagraphs = (paragraphs: string[]): NormalizedParagraphs => {
    if (paragraphs.length >= 3) {
        return {
            lines: [`${paragraphs[0] ?? ''} ${paragraphs[1] ?? ''}`.trim(), ...paragraphs.slice(2)],
            rightAlignedLineIndex: 1,
        }
    }

    return { lines: paragraphs, rightAlignedLineIndex: null }
}

export const renderParagraphs = (element: HTMLElement, paragraphs: string[]) => {
    const { lines, rightAlignedLineIndex } = normalizeBottomSubParagraphs(paragraphs)
    element.innerHTML = ''
    lines.forEach((text, index) => {
        const p = document.createElement('p')
        p.textContent = text
        if (rightAlignedLineIndex === index) p.classList.add('app-sub-right')
        element.appendChild(p)
    })
}

export const applyBottomBlockCopy = (
    elements: {
        headline: HTMLElement
        sub: HTMLElement
    },
    copy: BottomBlockCopy
) => {
    if (typeof copy.headline === 'string' && copy.headline.trim()) {
        elements.headline.textContent = copy.headline
    }
    if (Array.isArray(copy.paragraphs) && copy.paragraphs.length > 0) {
        renderParagraphs(elements.sub, copy.paragraphs)
    }
}

export const ensureParagraphElements = (container: HTMLElement, count: number) => {
    const normalizedCount =
        count >= 3
            ? // first 2 paragraphs are rendered as a single line
              Math.max(1, count - 1)
            : count

    const existing = qsa<HTMLElement>(SELECTORS.bottomSubParagraphs, container)
    while (existing.length < normalizedCount) {
        const p = document.createElement('p')
        container.appendChild(p)
        existing.push(p)
    }
    return existing
}

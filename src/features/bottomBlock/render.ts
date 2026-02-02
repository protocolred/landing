import { SELECTORS } from '@/core/constants'
import { qsa } from '@/core/dom'
import type { BottomBlockCopy } from '@/data/api'

export const renderParagraphs = (element: HTMLElement, paragraphs: string[]) => {
    element.innerHTML = ''
    paragraphs.forEach((text) => {
        const p = document.createElement('p')
        p.textContent = text
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
    const existing = qsa<HTMLElement>(SELECTORS.bottomSubParagraphs, container)
    while (existing.length < count) {
        const p = document.createElement('p')
        container.appendChild(p)
        existing.push(p)
    }
    return existing
}

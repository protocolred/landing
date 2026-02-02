import { SELECTORS } from '@/core/constants'
import { qs, qsa } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'

export const initHeaderNav: FeatureInit = () => {
    const headerItems = qsa<HTMLElement>(SELECTORS.headerNavItems)
    if (headerItems.length === 0) return

    const sections: HTMLElement[] = []
    const sectionIds = new Map<HTMLElement, string>()
    headerItems.forEach((item) => {
        const targetClass = item.getAttribute('data-target')
        if (!targetClass) return
        const matches = qsa<HTMLElement>(`.${targetClass}`)
        matches.forEach((section) => {
            sections.push(section)
            sectionIds.set(section, targetClass)
        })
    })

    const setActive = (id: string) => {
        headerItems.forEach((item) => {
            const isActive = item.getAttribute('data-target') === id
            item.classList.toggle('active', isActive)
        })
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return
                const targetId = sectionIds.get(entry.target as HTMLElement)
                if (targetId) setActive(targetId)
            })
        },
        { root: null, threshold: 0.6 }
    )

    sections.forEach((section) => observer.observe(section))

    const initActive = () => {
        const first = sections[0]
        if (!first) return
        const targetId = sectionIds.get(first)
        if (targetId) setActive(targetId)
    }

    requestAnimationFrame(initActive)
    window.addEventListener('load', initActive)

    const itemHandlers = new Map<HTMLElement, (event: Event) => void>()

    headerItems.forEach((item) => {
        const onItemClick = (event: Event) => {
            const mouseEvent = event instanceof MouseEvent ? event : null
            if (mouseEvent) {
                if (mouseEvent.defaultPrevented) return
                if (mouseEvent.button !== 0) return
                if (
                    mouseEvent.metaKey ||
                    mouseEvent.ctrlKey ||
                    mouseEvent.shiftKey ||
                    mouseEvent.altKey
                )
                    return
            }

            const targetId = item.getAttribute('data-target')
            if (!targetId) return
            const element = qs<HTMLElement>(`.${targetId}`)
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActive(targetId)
        }
        itemHandlers.set(item, onItemClick)
        item.addEventListener('click', onItemClick)
    })

    return () => {
        observer.disconnect()
        window.removeEventListener('load', initActive)
        headerItems.forEach((item) => {
            const handler = itemHandlers.get(item)
            if (handler) item.removeEventListener('click', handler)
        })
    }
}

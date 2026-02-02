import { SELECTORS } from '@/core/constants'
import { qsa } from '@/core/dom'

export function initHeaderNav(): void {
    const headerItems = qsa<HTMLElement>(SELECTORS.headerNavItems)
    if (headerItems.length === 0) return

    const sections: HTMLElement[] = []
    const sectionIds = new Map<HTMLElement, string>()
    headerItems.forEach((item) => {
        const targetClass = item.getAttribute('data-target')
        if (!targetClass) return
        const section = document.querySelector<HTMLElement>(`.${targetClass}`)
        if (!section) return
        sections.push(section)
        sectionIds.set(section, targetClass)
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

    headerItems.forEach((item) => {
        item.addEventListener('click', (event) => {
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
            const element = document.querySelector<HTMLElement>(`.${targetId}`)
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActive(targetId)
        })
    })
}

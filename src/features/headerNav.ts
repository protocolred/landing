import { SELECTORS } from '@/core/constants'
import { qsa } from '@/core/dom'

export function initHeaderNav(): void {
    const headerItems = qsa<HTMLElement>(SELECTORS.headerNavItems)
    if (headerItems.length === 0) return

    const sections = headerItems
        .map((item) => document.getElementById(item.getAttribute('data-target') || ''))
        .filter((section): section is HTMLElement => Boolean(section))

    const setActive = (id: string) => {
        headerItems.forEach((item) => {
            const isActive = item.getAttribute('data-target') === id
            item.classList.toggle('active', isActive)
        })
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id)
            })
        },
        { root: null, threshold: 0.6 }
    )

    sections.forEach((section) => observer.observe(section))

    const initActive = () => {
        if (sections[0]) setActive(sections[0].id)
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
            const element = document.getElementById(targetId)
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActive(targetId)
        })
    })
}

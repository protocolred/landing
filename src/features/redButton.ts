import { SELECTORS } from '@/core/constants'
import { qs } from '@/core/dom'

export function initRedButton(): void {
    const redButton = qs<HTMLButtonElement>(SELECTORS.headerLogoButton)
    if (!redButton) return

    redButton.setAttribute('aria-pressed', 'false')

    const setExpanded = (isExpanded: boolean) => {
        redButton.classList.toggle('is-expanded', isExpanded)
        redButton.setAttribute('aria-pressed', String(isExpanded))
    }

    const collapseViaZero = () => {
        redButton.classList.add('is-collapsing')
        setExpanded(false)

        let cleaned = false
        const cleanup = () => {
            if (cleaned) return
            cleaned = true
            redButton.classList.remove('is-collapsing')
        }

        const onTransitionEnd = (event: TransitionEvent) => {
            if (event.propertyName !== 'transform') return
            cleanup()
        }

        redButton.addEventListener('transitionend', onTransitionEnd, { once: true })
        window.setTimeout(cleanup, 260)
    }

    redButton.addEventListener('click', () => {
        const isExpanded = redButton.classList.contains('is-expanded')
        if (isExpanded) {
            collapseViaZero()
        } else {
            redButton.classList.remove('is-collapsing')
            setExpanded(true)
        }
    })
}

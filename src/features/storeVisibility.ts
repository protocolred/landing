import { SELECTORS } from '@/core/constants'
import { qs } from '@/core/dom'

export function initStoreVisibility(): void {
    const storeMain = qs<HTMLElement>(SELECTORS.storeMain)
    if (!storeMain) return

    const toggleStoreOnScroll = () => {
        const isAtTop = window.scrollY <= 1
        storeMain.classList.toggle('is-hidden', !isAtTop)
    }

    window.addEventListener('scroll', toggleStoreOnScroll, { passive: true })
    toggleStoreOnScroll()
}

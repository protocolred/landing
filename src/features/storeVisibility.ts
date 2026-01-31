import { IDS } from '@/core/constants'
import { byId } from '@/core/dom'

export function initStoreVisibility(): void {
    const storeMain = byId<HTMLElement>(IDS.storeMain)
    if (!storeMain) return

    const toggleStoreOnScroll = () => {
        const isAtTop = window.scrollY <= 1
        storeMain.classList.toggle('is-hidden', !isAtTop)
    }

    window.addEventListener('scroll', toggleStoreOnScroll, { passive: true })
    toggleStoreOnScroll()
}

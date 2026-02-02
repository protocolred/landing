import { SELECTORS } from '@/core/constants'
import { qs } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'

export const initStoreVisibility: FeatureInit = () => {
    const storeMain = qs<HTMLElement>(SELECTORS.storeMain)
    if (!storeMain) return

    const toggleStoreOnScroll = () => {
        const isAtTop = window.scrollY <= 1
        storeMain.classList.toggle('is-hidden', !isAtTop)
    }

    window.addEventListener('scroll', toggleStoreOnScroll, { passive: true })
    toggleStoreOnScroll()

    return () => {
        window.removeEventListener('scroll', toggleStoreOnScroll)
    }
}

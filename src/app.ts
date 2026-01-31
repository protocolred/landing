import { initBottomBlock } from '@/features/bottomBlock'
import { initHeaderNav } from '@/features/headerNav'
import { initHorizonBg } from '@/features/horizonBg'
import { initJokes } from '@/features/jokes'
import { initParallax } from '@/features/parallax'
import { initRedButton } from '@/features/redButton'
import { initStoreVisibility } from '@/features/storeVisibility'
import { initTextGlitch } from '@/features/textGlitch'

const init = () => {
    initHorizonBg()
    initParallax()
    initTextGlitch()
    initHeaderNav()
    initStoreVisibility()
    initJokes()
    initBottomBlock()
    initRedButton()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
    init()
}

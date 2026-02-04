import { createDisposer } from '@/core/dispose'
import { initBottomBlock } from '@/features/bottomBlock'
import { initHeaderNav } from '@/features/headerNav'
import { initJokes } from '@/features/jokes'
import { initParallax } from '@/features/parallax'
import { initPerformanceHud } from '@/features/performanceHud'
import { initRedButton } from '@/features/redButton'
import { initStoreVisibility } from '@/features/storeVisibility'
import { initTextGlitch } from '@/features/textGlitch'

const init = () => {
    const disposer = createDisposer()

    disposer.add(initTextGlitch())
    disposer.add(initHeaderNav())
    disposer.add(initStoreVisibility())
    disposer.add(initJokes())
    disposer.add(initBottomBlock())
    disposer.add(initRedButton())
    disposer.add(initParallax())
    disposer.add(initPerformanceHud())

    window.addEventListener('pagehide', disposer.disposeAll, { once: true })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
    init()
}

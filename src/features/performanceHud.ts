import { createDisposer } from '@/core/dispose'
import type { FeatureInit } from '@/core/feature'

type PerformanceMemory = {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
}

const isChrome = () => {
    const userAgentData = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } })
        .userAgentData
    if (userAgentData?.brands?.length) {
        const brands = userAgentData.brands
        const hasChrome = brands.some((brand) => brand.brand === 'Google Chrome')
        const hasEdge = brands.some((brand) => brand.brand === 'Microsoft Edge')
        const hasOpera = brands.some((brand) => brand.brand === 'Opera')
        return hasChrome && !hasEdge && !hasOpera
    }

    const ua = navigator.userAgent
    const isChromium = ua.includes('Chrome')
    const isEdge = ua.includes('Edg/')
    const isOpera = ua.includes('OPR/')
    const isBrave = ua.includes('Brave')
    return isChromium && !isEdge && !isOpera && !isBrave
}

const isDesktopView = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(width > 900px)').matches


export const initPerformanceHud: FeatureInit = () => {
    if (!isChrome()) return
    if (typeof PerformanceObserver === 'undefined') return
    if (!PerformanceObserver.supportedEntryTypes?.includes('longtask')) return

    const memory = (performance as Performance & { memory?: PerformanceMemory }).memory
    if (!memory) return

    const media = window.matchMedia('(width > 900px)')
    let stopHud: (() => void) | null = null

    const syncHud = () => {
        if (!media.matches) {
            if (stopHud) {
                stopHud()
                stopHud = null
            }
            return
        }

        if (stopHud) return
        stopHud = startHud()
    }

    const onChange = () => syncHud()
    media.addEventListener('change', onChange)
    syncHud()

    return () => {
        media.removeEventListener('change', onChange)
        if (stopHud) stopHud()
    }
}

const startHud = () => {
    const disposer = createDisposer()
    if (!isDesktopView()) return disposer.disposeAll

    const container = document.createElement('div')
    container.className = 'perf-hud'

    const makeRow = (label: string) => {
        const row = document.createElement('div')
        row.className = 'perf-hud-row'
        const labelEl = document.createElement('span')
        labelEl.className = 'perf-hud-label'
        labelEl.textContent = label
        const valueEl = document.createElement('span')
        valueEl.className = 'perf-hud-value'
        valueEl.textContent = '...'
        row.append(labelEl, valueEl)
        return { row, valueEl }
    }

    const cpuRow = makeRow('CPU')
    const memoryRow = makeRow('MEM')
    const fpsRow = makeRow('FPS')

    container.append(cpuRow.row, memoryRow.row, fpsRow.row)
    document.body.appendChild(container)
    disposer.add(() => container.remove())

    let busyTimeMs = 0
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            const duration = entry.duration
            if (duration > 0) busyTimeMs += duration
        })
    })
    observer.observe({ type: 'longtask', buffered: true })
    disposer.add(() => observer.disconnect())

    let frameCount = 0
    let rafId = 0
    let lastTick = performance.now()

    const onFrame = () => {
        frameCount += 1
        rafId = requestAnimationFrame(onFrame)
    }
    rafId = requestAnimationFrame(onFrame)
    disposer.add(() => cancelAnimationFrame(rafId))

    const update = () => {
        const now = performance.now()
        const delta = Math.max(1, now - lastTick)
        const fps = Math.round((frameCount * 1000) / delta)
        const cpu = Math.min(100, Math.round((busyTimeMs / delta) * 100))

        frameCount = 0
        busyTimeMs = 0
        lastTick = now

        const memory = (performance as Performance & { memory?: PerformanceMemory }).memory
        const usedMb = memory ? Math.max(0, memory.usedJSHeapSize) / 1048576 : 0

        cpuRow.valueEl.textContent = `${cpu}%`
        memoryRow.valueEl.textContent = `${usedMb.toFixed(1)} MB`
        fpsRow.valueEl.textContent = `${fps}`
    }

    update()
    disposer.addInterval(update, 1000)

    return disposer.disposeAll
}

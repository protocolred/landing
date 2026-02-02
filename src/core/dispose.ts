import type { Disposer } from './feature'

type MaybeDisposer = void | Disposer

export const createDisposer = () => {
    const disposers: Disposer[] = []

    const addDisposer = (dispose: Disposer) => {
        disposers.push(dispose)
        return () => {
            const index = disposers.indexOf(dispose)
            if (index >= 0) disposers.splice(index, 1)
        }
    }

    const add = (maybeDisposer: MaybeDisposer) => {
        if (typeof maybeDisposer === 'function') disposers.push(maybeDisposer)
    }

    const addListener = <T extends EventTarget>(
        target: T,
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): Disposer => {
        target.addEventListener(type, listener, options)
        const dispose = () =>
            target.removeEventListener(type, listener, options as boolean | EventListenerOptions)
        disposers.push(dispose)
        return dispose
    }

    const addTimeout = (handler: () => void, timeoutMs: number) => {
        let timeoutId = 0
        const remove = addDisposer(() => window.clearTimeout(timeoutId))
        timeoutId = window.setTimeout(() => {
            remove()
            handler()
        }, timeoutMs)
        return timeoutId
    }

    const addInterval = (handler: () => void, intervalMs: number) => {
        const intervalId = window.setInterval(handler, intervalMs)
        addDisposer(() => window.clearInterval(intervalId))
        return intervalId
    }

    const addRaf = (handler: FrameRequestCallback) => {
        let rafId = 0
        const remove = addDisposer(() => cancelAnimationFrame(rafId))
        rafId = requestAnimationFrame((time) => {
            remove()
            handler(time)
        })
        return rafId
    }

    const disposeAll = () => {
        disposers.forEach((dispose) => dispose())
        disposers.length = 0
    }

    return { add, addListener, addTimeout, addInterval, addRaf, disposeAll }
}

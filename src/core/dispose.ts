import type { Disposer } from './feature'

type MaybeDisposer = void | Disposer

export const createDisposer = () => {
    const disposers: Disposer[] = []

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

    const disposeAll = () => {
        disposers.forEach((dispose) => dispose())
        disposers.length = 0
    }

    return { add, addListener, disposeAll }
}

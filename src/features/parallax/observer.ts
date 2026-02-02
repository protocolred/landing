import type { LayerState } from './types'

type VisibilityHandler = (state: LayerState, isVisible: boolean) => void

export const createLayerObserver = (options: {
    layers: HTMLElement[]
    states: Map<HTMLElement, LayerState>
    onVisibilityChange: VisibilityHandler
}) => {
    const { layers, states, onVisibilityChange } = options
    let observer: IntersectionObserver | null = null

    const observeAll = () => {
        if (observer) observer.disconnect()
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const target = entry.target as HTMLElement
                    const state = states.get(target)
                    if (!state) continue
                    state.isVisible = entry.isIntersecting
                    onVisibilityChange(state, entry.isIntersecting)
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0.01,
            }
        )
        for (const layer of layers) {
            observer.observe(layer)
        }
    }

    const disconnect = () => {
        if (observer) observer.disconnect()
        observer = null
    }

    return { observeAll, disconnect }
}

export function byId<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null
}

export function qs<T extends Element>(selector: string, root: ParentNode = document): T | null {
    return root.querySelector(selector) as T | null
}

export function qsa<T extends Element>(selector: string, root: ParentNode = document): T[] {
    return Array.from(root.querySelectorAll(selector)) as T[]
}

export function prefersReducedMotion(): boolean {
    return (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

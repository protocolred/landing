declare module 'd3' {
    export interface SimulationNodeDatum {
        x?: number
        y?: number
        vx?: number
        vy?: number
        index?: number
    }

    export interface Force<NodeDatum extends SimulationNodeDatum, _LinkDatum> {
        (alpha: number): void
        initialize?(nodes: NodeDatum[]): void
    }

    export interface Simulation<_NodeDatum extends SimulationNodeDatum, _LinkDatum> {
        force(name: string, force: unknown): this
        velocityDecay(decay: number): this
        alpha(alpha: number): this
        alphaDecay(decay: number): this
        on(event: 'tick', listener: () => void): this
        stop(): this
    }

    export function forceSimulation<NodeDatum extends SimulationNodeDatum>(
        nodes: NodeDatum[]
    ): Simulation<NodeDatum, undefined>

    export function forceX(x: number): { strength(value: number): unknown }
    export function forceY(y: number): { strength(value: number): unknown }
    export function range(count: number): number[]
    export function interpolateRgb(a: string, b: string): (t: number) => string
}

declare module 'd3-timer' {
    export interface Timer {
        stop(): void
    }

    export function timer(callback: (elapsed: number) => void): Timer
}

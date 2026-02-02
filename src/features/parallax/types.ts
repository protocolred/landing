import * as d3 from 'd3'

export interface DotNode extends d3.SimulationNodeDatum {
    x: number
    y: number
    vx?: number
    vy?: number
    r: number
    color: string
    opacity: number
    orbitRadiusPx: number
    orbitSpeedRad: number
    orbitPhase: number
    orbitWobbleSpeedRad: number
    orbitWobblePhase: number
}

export interface LayerState {
    layer: HTMLElement
    simulation: d3.Simulation<DotNode, undefined>
    isVisible: boolean
    running: boolean
    destroy: () => void
}

export type SizeUnit = 'px' | 'dvh' | 'dwh' | 'dvw' | 'vh' | 'vw' | '%'

export interface SizeValue {
    value: number
    unit: SizeUnit
}

export interface LayerConfig {
    count: number
    sizeMin: number
    sizeMax: number
    jitter: number
    speed: number
    shrink: number
}

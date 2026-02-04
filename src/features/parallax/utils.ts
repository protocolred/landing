import * as d3 from 'd3'

import { PARALLAX_CONFIG } from '@/data/parallax'

import type { DotNode, LayerConfig, SizeUnit, SizeValue } from './types'

const TAU = Math.PI * 2

export const createJitterForce = (strength: number) => {
    let nodes: DotNode[] = []
    const force = (alpha: number) => {
        const scaled = strength * alpha
        for (const node of nodes) {
            node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * scaled
            node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * scaled
        }
    }
    force.initialize = (newNodes: DotNode[]) => {
        nodes = newNodes
    }
    return force as d3.Force<DotNode, undefined>
}

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const parseSizeValue = (value: string): SizeValue | null => {
    const trimmed = value.trim()
    const match = trimmed.match(/^(-?\d*\.?\d+)(px|dvh|dwh|dvw|vh|vw|%)?$/)
    if (!match) return null
    const numeric = Number(match[1])
    if (!Number.isFinite(numeric)) return null
    return {
        value: numeric,
        unit: (match[2] ?? 'px') as SizeUnit,
    }
}

export const resolveSizePx = (value: string): number | null => {
    const parsed = parseSizeValue(value)
    if (!parsed) return null
    switch (parsed.unit) {
        case 'px':
            return parsed.value
        case 'dvh':
        case 'dwh':
        case 'vh':
            return (window.innerHeight * parsed.value) / 100
        case 'dvw':
        case 'vw':
            return (window.innerWidth * parsed.value) / 100
        case '%': {
            const basis = Math.min(window.innerWidth, window.innerHeight)
            return (basis * parsed.value) / 100
        }
        default:
            return null
    }
}

export const createColorSampler = () => {
    const gray = d3.interpolateRgb(
        PARALLAX_CONFIG.colorSampler.grayStart,
        PARALLAX_CONFIG.colorSampler.grayEnd
    )
    const red = d3.interpolateRgb(
        PARALLAX_CONFIG.colorSampler.redStart,
        PARALLAX_CONFIG.colorSampler.redEnd
    )
    return () => {
        const roll = Math.random()
        if (roll < PARALLAX_CONFIG.colorSampler.grayChance) {
            return { color: gray(Math.random()) }
        }
        if (roll < PARALLAX_CONFIG.colorSampler.redChance) {
            return { color: red(Math.random()) }
        }
        const mix = d3.interpolateRgb(gray(Math.random()), red(Math.random()))
        return { color: mix(Math.random()) }
    }
}

export const getLayerConfig = (layerIndex: number): LayerConfig => {
    const layerParams = PARALLAX_CONFIG.layerParams[layerIndex]
    return {
        count: layerParams?.count ?? PARALLAX_CONFIG.defaultLayer.count,
        sizeMin: layerParams?.sizeMin ?? PARALLAX_CONFIG.defaultLayer.sizeMin,
        sizeMax: layerParams?.sizeMax ?? PARALLAX_CONFIG.defaultLayer.sizeMax,
        jitter: layerParams?.jitter ?? PARALLAX_CONFIG.defaultLayer.jitter,
        speed: layerParams?.speed ?? PARALLAX_CONFIG.motion.defaultSpeed,
        shrink: layerParams?.shrink ?? PARALLAX_CONFIG.motion.defaultShrink,
    }
}

export const getOrbitOffset = (node: DotNode, t: number) => {
    const angle = node.orbitPhase + node.orbitSpeedRad * t
    const wobble = 0.75 + 0.25 * Math.sin(node.orbitWobblePhase + node.orbitWobbleSpeedRad * t)
    const r = node.orbitRadiusPx * wobble
    return {
        dx: Math.cos(angle) * r,
        dy: Math.sin(angle) * r,
    }
}

export const getOrbitPhase = () => Math.random() * TAU

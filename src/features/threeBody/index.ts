import { timer, type Timer } from 'd3-timer'

import { createDisposer } from '@/core/dispose'
import { prefersReducedMotion, qs } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { THREE_BODY_CONFIG } from '@/data/threeBody'

type Point = {
    x: number
    y: number
}

const TWO_PI = Math.PI * 2

const createCanvas = (container: HTMLElement) => {
    const canvas = document.createElement('canvas')
    canvas.className = THREE_BODY_CONFIG.canvasClassName
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)
    return canvas
}

const computePositions = (
    timeSeconds: number,
    centerX: number,
    centerY: number,
    minDimension: number
): Point[] => {
    const baseRadius = minDimension * THREE_BODY_CONFIG.orbit.baseRadiusRatio
    const linkRadius = minDimension * THREE_BODY_CONFIG.orbit.linkRadiusRatio
    const wobbleRadius = minDimension * THREE_BODY_CONFIG.orbit.wobbleRadiusRatio

    return Array.from({ length: THREE_BODY_CONFIG.bodyCount }, (_, index) => {
        const phase = (TWO_PI * index) / THREE_BODY_CONFIG.bodyCount
        const spinAngle = TWO_PI * THREE_BODY_CONFIG.motion.speed * timeSeconds + phase
        const wobbleAngle = TWO_PI * THREE_BODY_CONFIG.motion.wobbleSpeed * timeSeconds + phase
        const linkAngle =
            TWO_PI * THREE_BODY_CONFIG.motion.linkSpeed * timeSeconds +
            phase * THREE_BODY_CONFIG.orbit.linkPhaseMultiplier

        const wobble = Math.sin(wobbleAngle) * wobbleRadius
        const radius = baseRadius + wobble

        return {
            x: centerX + Math.cos(spinAngle) * radius + Math.cos(linkAngle) * linkRadius,
            y: centerY + Math.sin(spinAngle) * radius + Math.sin(linkAngle) * linkRadius,
        }
    })
}

const drawPoint = (
    context: CanvasRenderingContext2D,
    point: Point,
    coreRadius: number,
    glowRadius: number,
    pulse: number
) => {
    const adjustedGlow = glowRadius * (1 + THREE_BODY_CONFIG.body.pulseAmplitude * pulse)

    const gradient = context.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        adjustedGlow
    )
    gradient.addColorStop(0, THREE_BODY_CONFIG.glow.coreColor)
    gradient.addColorStop(0.45, THREE_BODY_CONFIG.glow.haloColor)
    gradient.addColorStop(1, THREE_BODY_CONFIG.glow.outerColor)

    context.fillStyle = gradient
    context.beginPath()
    context.arc(point.x, point.y, adjustedGlow, 0, TWO_PI)
    context.fill()

    context.fillStyle = THREE_BODY_CONFIG.glow.coreColor
    context.beginPath()
    context.arc(point.x, point.y, coreRadius, 0, TWO_PI)
    context.fill()
}

export const initThreeBody: FeatureInit = () => {
    const container = qs<HTMLElement>(THREE_BODY_CONFIG.containerSelector)
    if (!container) return

    const canvas = createCanvas(container)
    const context = canvas.getContext('2d')
    if (!context) return

    const disposer = createDisposer()
    const motionQuery =
        typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : null

    let width = 0
    let height = 0
    let minDimension = 0
    let devicePixelRatio = 1
    let frameIntervalMs = 1000 / THREE_BODY_CONFIG.quality.maxFps
    let lastFrameMs = 0
    let ticker: Timer | null = null
    let isVisible = true

    const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect()
        width = rect.width
        height = rect.height
        minDimension = Math.min(width, height)
        devicePixelRatio = Math.min(window.devicePixelRatio || 1, THREE_BODY_CONFIG.quality.maxDpr)

        canvas.width = Math.max(1, Math.round(width * devicePixelRatio))
        canvas.height = Math.max(1, Math.round(height * devicePixelRatio))
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
        context.clearRect(0, 0, width, height)
    }

    const drawFrame = (elapsedMs: number, useTrail: boolean) => {
        if (width === 0 || height === 0) return

        const timeSeconds = elapsedMs / 1000
        const centerX = width / 2
        const centerY = height / 2
        const coreRadius = minDimension * THREE_BODY_CONFIG.body.coreRadiusRatio
        const glowRadius = minDimension * THREE_BODY_CONFIG.body.glowRadiusRatio
        const pulse = Math.sin(TWO_PI * THREE_BODY_CONFIG.body.pulseSpeed * timeSeconds)

        if (useTrail) {
            context.globalCompositeOperation = 'destination-out'
            context.fillStyle = `rgba(0, 0, 0, ${THREE_BODY_CONFIG.trail.fadeAlpha})`
            context.fillRect(0, 0, width, height)
        } else {
            context.globalCompositeOperation = 'source-over'
            context.clearRect(0, 0, width, height)
        }

        context.globalCompositeOperation = 'lighter'
        const points = computePositions(timeSeconds, centerX, centerY, minDimension)
        points.forEach((point) => drawPoint(context, point, coreRadius, glowRadius, pulse))
        context.globalCompositeOperation = 'source-over'
    }

    const start = () => {
        if (ticker) return
        lastFrameMs = 0
        ticker = timer((elapsedMs: number) => {
            if (frameIntervalMs > 0 && elapsedMs - lastFrameMs < frameIntervalMs) return
            lastFrameMs = elapsedMs
            drawFrame(elapsedMs, true)
        })
    }

    const stop = () => {
        if (!ticker) return
        ticker.stop()
        ticker = null
    }

    const renderStatic = () => {
        drawFrame(0, false)
    }

    const updatePlayback = () => {
        frameIntervalMs = 1000 / THREE_BODY_CONFIG.quality.maxFps
        if (prefersReducedMotion()) {
            stop()
            renderStatic()
            return
        }
        if (isVisible) {
            start()
        } else {
            stop()
        }
    }

    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => {
            updateCanvasSize()
            renderStatic()
        })
        resizeObserver.observe(container)
        disposer.add(() => resizeObserver.disconnect())
    } else {
        disposer.addListener(window, 'resize', () => {
            updateCanvasSize()
            renderStatic()
        })
    }

    if ('IntersectionObserver' in window) {
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                isVisible = entry ? entry.isIntersecting : true
                updatePlayback()
            },
            { threshold: 0.1 }
        )
        intersectionObserver.observe(container)
        disposer.add(() => intersectionObserver.disconnect())
    }

    if (motionQuery) {
        disposer.addListener(motionQuery, 'change', updatePlayback)
    }

    updateCanvasSize()
    renderStatic()
    updatePlayback()

    return () => {
        stop()
        disposer.disposeAll()
        canvas.remove()
    }
}

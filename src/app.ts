import * as d3 from 'd3'

const initPageBgParallax = () => {
    const background = document.querySelector<HTMLElement>('.page-bg')
    if (!background) return

    const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    let raf = 0

    const update = () => {
        raf = 0
        const y = window.scrollY || window.pageYOffset || 0
        background.style.setProperty('--page-scroll', `${y}px`)
    }

    const schedule = () => {
        if (raf) return
        raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()
}

const initHorizonBg = () => {
    const container = document.getElementById('horizon-bg')
    if (!container) return

    const vbWidth = 1024
    const vbHeight = 608
    const section = container.closest('section')
    const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

    let parallaxLayer: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
    let parallaxRaf = 0

    const getParallaxProgress = () => {
        if (section) {
            const rect = section.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
            if (!viewportHeight) return 0
            return clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height))
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
        const docHeight = document.documentElement.scrollHeight || 0
        const maxScroll = Math.max(1, docHeight - viewportHeight)
        return clamp01((window.scrollY || 0) / maxScroll)
    }

    const updateParallax = () => {
        if (!parallaxLayer || prefersReducedMotion) return

        const progress = getParallaxProgress()
        const centered = progress - 0.5

        const translateY = centered * vbHeight * 0.06
        const scale = 1 + centered * 0.02

        const cx = vbWidth / 2
        const cy = vbHeight / 2

        parallaxLayer.attr(
            'transform',
            `translate(0 ${translateY}) translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`
        )
    }

    const scheduleParallax = () => {
        if (parallaxRaf) return
        parallaxRaf = requestAnimationFrame(() => {
            parallaxRaf = 0
            updateParallax()
        })
    }

    const render = () => {
        container.innerHTML = ''

        const horizonY = vbHeight * 0.56

        const svg = d3
            .select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${vbWidth} ${vbHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('aria-hidden', 'true')
            .style('display', 'block')

        const defs = svg.append('defs')
        parallaxLayer = svg.append('g').attr('data-layer', 'horizon')

        const hazeGradient = defs
            .append('radialGradient')
            .attr('id', 'horizonHaze')
            .attr('cx', '50%')
            .attr('cy', `${(horizonY / vbHeight) * 100}%`)
            .attr('r', '70%')

        hazeGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0.12)

        hazeGradient
            .append('stop')
            .attr('offset', '70%')
            .attr('stop-color', '#000213')
            .attr('stop-opacity', 0)

        const horizonGradient = defs
            .append('linearGradient')
            .attr('id', 'horizonLine')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')

        horizonGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0)

        horizonGradient
            .append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0.9)

        horizonGradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#00dcff')
            .attr('stop-opacity', 0)

        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vbWidth)
            .attr('height', vbHeight)
            .attr('fill', '#00000b')

        parallaxLayer
            .append('ellipse')
            .attr('cx', vbWidth / 2)
            .attr('cy', horizonY)
            .attr('rx', vbWidth * 0.6)
            .attr('ry', vbHeight * 0.28)
            .attr('fill', 'url(#horizonHaze)')

        parallaxLayer
            .append('line')
            .attr('x1', vbWidth * 0.08)
            .attr('x2', vbWidth * 0.92)
            .attr('y1', horizonY)
            .attr('y2', horizonY)
            .attr('stroke', 'url(#horizonLine)')
            .attr('stroke-width', 2)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('opacity', 0.45)

        updateParallax()
    }

    let scheduled = 0
    const scheduleRender = () => {
        if (scheduled) return
        scheduled = requestAnimationFrame(() => {
            scheduled = 0
            render()
        })
    }

    render()

    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => scheduleRender())
        observer.observe(container)
    } else {
        window.addEventListener('resize', scheduleRender, { passive: true })
    }

    if (!prefersReducedMotion) {
        window.addEventListener('scroll', scheduleParallax, { passive: true })
        window.addEventListener('resize', scheduleParallax, { passive: true })
        scheduleParallax()
    }
}

const initTextGlitch = () => {
    const letters = document.querySelectorAll<HTMLElement>('.glitch-letter')
    const protocolText = document.getElementById('protocol-text')
    const characters = '2470ABCDEFGHIJKLNOPQRSTUVXYZ'

    const runTextEffect = () => {
        let tick = 0
        const maxTicks = 18
        const settleOffsets = Array.from({ length: letters.length }, (_, i) => i + 4)

        const timer = window.setInterval(() => {
            tick++
            letters.forEach((letter, index) => {
                const finalChar = letter.dataset.final || letter.textContent || ''
                if (tick < settleOffsets[index]) {
                    const randomIndex = Math.floor(Math.random() * characters.length)
                    letter.textContent = characters[randomIndex]
                } else {
                    letter.textContent = finalChar
                }
            })

            if (tick > maxTicks + letters.length) {
                window.clearInterval(timer)
            }
        }, 80)
    }

    letters.forEach((letter) => {
        letter.dataset.final = letter.textContent || ''
    })

    runTextEffect()
    if (protocolText) {
        protocolText.addEventListener('click', runTextEffect)
    }
}

const initHeaderNav = () => {
    const headerLinks = Array.from(document.querySelectorAll<HTMLElement>('.header [data-target]'))
    const sections = headerLinks
        .map((link) => document.getElementById(link.getAttribute('data-target') || ''))
        .filter((section): section is HTMLElement => Boolean(section))

    const setActive = (id: string) => {
        headerLinks.forEach((link) => {
            const isActive = link.getAttribute('data-target') === id
            link.classList.toggle('active', isActive)
        })
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActive(entry.target.id)
                }
            })
        },
        { root: null, threshold: 0.6 }
    )

    sections.forEach((section) => observer.observe(section))

    const initActive = () => {
        if (sections[0]) setActive(sections[0].id)
    }

    requestAnimationFrame(initActive)
    window.addEventListener('load', initActive)

    headerLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const mouseEvent = event instanceof MouseEvent ? event : null
            if (mouseEvent) {
                if (mouseEvent.defaultPrevented) return
                if (mouseEvent.button !== 0) return
                if (
                    mouseEvent.metaKey ||
                    mouseEvent.ctrlKey ||
                    mouseEvent.shiftKey ||
                    mouseEvent.altKey
                )
                    return
            }

            const targetId = link.getAttribute('data-target')
            if (!targetId) return
            const element = document.getElementById(targetId)
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActive(targetId)
        })
    })
}

const initStoreVisibility = () => {
    const storeMain = document.getElementById('store-main')
    const toggleStoreOnScroll = () => {
        if (!storeMain) return
        const isAtTop = window.scrollY <= 1
        storeMain.classList.toggle('is-hidden', !isAtTop)
    }

    window.addEventListener('scroll', toggleStoreOnScroll, { passive: true })
    toggleStoreOnScroll()
}

const initJokes = () => {
    const jokeEl = document.getElementById('protocol-joke')
    const setRandomJoke = (jokes: string[]) => {
        if (!jokeEl || !Array.isArray(jokes) || jokes.length === 0) return
        const randomIndex = Math.floor(Math.random() * jokes.length)
        jokeEl.textContent = jokes[randomIndex]
    }

    const loadJokes = async () => {
        try {
            const url = new URL('src/texts/jokes.json', document.baseURI)
            const response = await fetch(url, { cache: 'no-store' })
            if (!response.ok) throw new Error(`Failed to load jokes: ${response.status}`)
            const jokes = (await response.json()) as string[]
            setRandomJoke(jokes)
            if (jokeEl) jokeEl.addEventListener('click', () => setRandomJoke(jokes))
        } catch {
            setRandomJoke([
                'No plot armor.',
                'No badges. Just logs.',
                'Deviation noted.',
                'We saw that.',
            ])
        }
    }

    loadJokes()
}

type BottomBlockCopy = {
    hero?: string
    paragraphs?: string[]
}

const initBottomBlock = () => {
    const bottomHeroEl = document.getElementById('bottom-hero')
    const bottomSubEl = document.getElementById('bottom-sub')

    const SCRAMBLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const scrambleTokens = new WeakMap<Element, number>()

    const getRandomChar = () => {
        const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)
        return SCRAMBLE_CHARACTERS[randomIndex]
    }

    const animateScrambleText = (
        element: HTMLElement,
        fromText: string,
        toText: string,
        durationMs = 500
    ) => {
        if (!element) return Promise.resolve()

        const from = typeof fromText === 'string' ? fromText : String(fromText ?? '')
        const nextText = typeof toText === 'string' ? toText : String(toText ?? '')
        if (from === nextText) {
            element.textContent = nextText
            return Promise.resolve()
        }

        const token = (scrambleTokens.get(element) || 0) + 1
        scrambleTokens.set(element, token)

        const maxLen = Math.max(from.length, nextText.length)
        const toPadded = nextText.padEnd(maxLen, ' ')

        const order = Array.from({ length: maxLen }, (_, i) => i)
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[order[i], order[j]] = [order[j], order[i]]
        }

        const settledMask = Array.from({ length: maxLen }, () => false)
        let nextToSettle = 0
        const start = performance.now()

        return new Promise<void>((resolve) => {
            const frame = (now: number) => {
                if (scrambleTokens.get(element) !== token) return resolve()

                const progress = Math.min(1, (now - start) / durationMs)
                const desiredSettled = Math.floor(progress * maxLen)
                while (nextToSettle < desiredSettled) {
                    const idx = order[nextToSettle]
                    settledMask[idx] = true
                    nextToSettle++
                }

                let out = ''
                for (let i = 0; i < maxLen; i++) {
                    const targetChar = toPadded[i]
                    if (settledMask[i]) {
                        out += targetChar
                        continue
                    }
                    if (targetChar === ' ' || targetChar === '\n' || targetChar === '\t') {
                        out += targetChar
                        continue
                    }
                    out += getRandomChar()
                }

                element.textContent = out.replace(/\s+$/, '')

                if (progress < 1) {
                    requestAnimationFrame(frame)
                    return
                }

                element.textContent = nextText
                resolve()
            }

            requestAnimationFrame(frame)
        })
    }

    const renderParagraphs = (element: HTMLElement, paragraphs: string[]) => {
        if (!element) return
        element.innerHTML = ''
        paragraphs.forEach((text) => {
            const p = document.createElement('p')
            p.textContent = text
            element.appendChild(p)
        })
    }

    const applyBottomBlockCopy = (copy: BottomBlockCopy) => {
        if (!copy || typeof copy !== 'object') return
        if (bottomHeroEl && typeof copy.hero === 'string' && copy.hero.trim()) {
            bottomHeroEl.textContent = copy.hero
        }
        if (bottomSubEl && Array.isArray(copy.paragraphs) && copy.paragraphs.length > 0) {
            renderParagraphs(bottomSubEl, copy.paragraphs)
        }
    }

    const getRandomItem = <T>(items: T[]) => {
        if (!Array.isArray(items) || items.length === 0) return null
        return items[Math.floor(Math.random() * items.length)]
    }

    let bottomCopies: BottomBlockCopy[] = []
    let currentBottomCopy: BottomBlockCopy | null = null
    let bottomCopiesLoading: Promise<BottomBlockCopy[]> | null = null

    const fetchBottomCopies = async () => {
        const url = new URL('src/texts/bottom-block.variants.json', document.baseURI)
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Failed to load bottom variants: ${response.status}`)
        const variants = (await response.json()) as Record<string, BottomBlockCopy>
        return Object.values(variants).filter((v) => v && typeof v === 'object')
    }

    const ensureBottomCopiesLoaded = async () => {
        if (Array.isArray(bottomCopies) && bottomCopies.length > 0) return bottomCopies
        if (bottomCopiesLoading) return bottomCopiesLoading

        bottomCopiesLoading = fetchBottomCopies()
            .then((copies) => {
                bottomCopies = copies
                return copies
            })
            .catch(() => {
                bottomCopies = []
                return bottomCopies
            })
            .finally(() => {
                bottomCopiesLoading = null
            })

        return bottomCopiesLoading
    }

    const pickNextBottomCopy = () => {
        if (!Array.isArray(bottomCopies) || bottomCopies.length === 0) return null
        if (bottomCopies.length === 1) return bottomCopies[0]

        let next = getRandomItem(bottomCopies)
        let guard = 0
        while (next === currentBottomCopy && guard < 10) {
            next = getRandomItem(bottomCopies)
            guard++
        }
        return next
    }

    const transitionBottomBlockCopy = async (copy: BottomBlockCopy) => {
        if (!copy || typeof copy !== 'object') return

        const heroTo = typeof copy.hero === 'string' ? copy.hero : ''
        const paragraphsTo = Array.isArray(copy.paragraphs) ? copy.paragraphs : []

        const heroFrom = bottomHeroEl?.textContent ?? ''
        const jobs: Array<Promise<void>> = []
        if (bottomHeroEl) {
            jobs.push(animateScrambleText(bottomHeroEl, heroFrom, heroTo, 500))
        }

        if (bottomSubEl) {
            const existing = Array.from(bottomSubEl.querySelectorAll('p'))

            while (existing.length < paragraphsTo.length) {
                const p = document.createElement('p')
                bottomSubEl.appendChild(p)
                existing.push(p)
            }

            for (let i = 0; i < existing.length; i++) {
                const element = existing[i]
                const from = element.textContent ?? ''
                const nextText = paragraphsTo[i] ?? ''
                jobs.push(
                    animateScrambleText(element, from, nextText, 500).then(() => {
                        if (i >= paragraphsTo.length) element.remove()
                    })
                )
            }
        }

        await Promise.all(jobs)
        currentBottomCopy = copy
    }

    const loadBottomBlockCopy = async () => {
        try {
            await ensureBottomCopiesLoaded()
            const randomCopy = pickNextBottomCopy()
            if (randomCopy) {
                currentBottomCopy = randomCopy
                applyBottomBlockCopy(randomCopy)
            }
        } catch {
            // Keep the HTML fallback.
        }
    }

    loadBottomBlockCopy()

    const bottomBlockEl = document.getElementById('app')
    const onBottomBlockActivate = (event?: Event) => {
        if (!bottomBlockEl) return
        if ((event?.target as HTMLElement | null)?.closest?.('a')) return
        ensureBottomCopiesLoaded().then(() => {
            const next = pickNextBottomCopy()
            if (!next) return
            transitionBottomBlockCopy(next)
        })
    }

    if (bottomBlockEl) {
        bottomBlockEl.addEventListener('click', onBottomBlockActivate)
        bottomBlockEl.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            if ((event.target as HTMLElement | null)?.closest?.('a')) return
            event.preventDefault()
            onBottomBlockActivate(event)
        })
        if (!bottomBlockEl.hasAttribute('tabindex')) bottomBlockEl.tabIndex = 0
    }
}

const initRedButton = () => {
    const redButton = document.querySelector<HTMLButtonElement>('.header .logo-button')
    if (!redButton) return

    redButton.setAttribute('aria-pressed', 'false')

    const setExpanded = (isExpanded: boolean) => {
        redButton.classList.toggle('is-expanded', isExpanded)
        redButton.setAttribute('aria-pressed', String(isExpanded))
    }

    const collapseViaZero = () => {
        redButton.classList.add('is-collapsing')
        setExpanded(false)

        let cleaned = false
        const cleanup = () => {
            if (cleaned) return
            cleaned = true
            redButton.classList.remove('is-collapsing')
        }

        const onTransitionEnd = (event: TransitionEvent) => {
            if (event.propertyName !== 'transform') return
            cleanup()
        }

        redButton.addEventListener('transitionend', onTransitionEnd, { once: true })
        window.setTimeout(cleanup, 260)
    }

    redButton.addEventListener('click', () => {
        const isExpanded = redButton.classList.contains('is-expanded')
        if (isExpanded) {
            collapseViaZero()
        } else {
            redButton.classList.remove('is-collapsing')
            setExpanded(true)
        }
    })
}

const init = () => {
    initPageBgParallax()
    initHorizonBg()
    initTextGlitch()
    initHeaderNav()
    initStoreVisibility()
    initJokes()
    initBottomBlock()
    initRedButton()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
    init()
}

export function pickRandom<T>(items: T[]): T | undefined {
    if (items.length === 0) return undefined
    const index = Math.floor(Math.random() * items.length)
    return items[index]
}

export function pickRandomAvoid<T>(
    items: T[],
    avoid: T | null | undefined,
    maxAttempts = 10
): T | undefined {
    if (items.length === 0) return undefined
    if (items.length === 1) return items[0]
    let next = pickRandom(items)
    let guard = 0
    while (next === avoid && guard < maxAttempts) {
        next = pickRandom(items)
        guard += 1
    }
    return next
}

export function pickRandomChar(chars: string, avoidChar = ''): string {
    if (chars.length === 0) return avoidChar
    let nextChar = avoidChar
    let guard = 0
    while (nextChar === avoidChar && guard < 10) {
        const index = Math.floor(Math.random() * chars.length)
        nextChar = chars[index] ?? avoidChar
        guard += 1
    }
    return nextChar
}

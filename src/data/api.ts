import bottomVariantsJson from '@/assets/texts/bottom-block.variants.json'
import jokesJson from '@/assets/texts/jokes.json'

export type BottomBlockCopy = {
    hero?: string
    paragraphs?: string[]
}

export function getJokes(): string[] {
    return Array.isArray(jokesJson) ? (jokesJson as string[]) : []
}

export function getBottomBlockCopies(): BottomBlockCopy[] {
    if (!bottomVariantsJson || typeof bottomVariantsJson !== 'object') return []
    const values = Object.values(bottomVariantsJson as Record<string, BottomBlockCopy>)
    return values.filter((v) => v && typeof v === 'object')
}

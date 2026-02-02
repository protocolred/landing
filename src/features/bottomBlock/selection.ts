import { pickRandomAvoid } from '@/core/random'
import type { BottomBlockCopy } from '@/data/api'

export const createBottomBlockPicker = (copies: BottomBlockCopy[]) => {
    return (current: BottomBlockCopy | null) => {
        if (copies.length === 0) return null
        if (copies.length === 1) return copies[0] ?? null
        return pickRandomAvoid(copies, current, 10) ?? null
    }
}

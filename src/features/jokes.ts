import { SELECTORS } from '@/core/constants'
import { qs } from '@/core/dom'
import type { FeatureInit } from '@/core/feature'
import { pickRandom } from '@/core/random'
import { getJokes } from '@/data/api'

export const initJokes: FeatureInit = () => {
    const jokeElement = qs<HTMLElement>(SELECTORS.protocolJoke)
    if (!jokeElement) return

    const jokes = getJokes()
    if (!Array.isArray(jokes) || jokes.length === 0) return

    const setRandomJoke = () => {
        jokeElement.textContent = pickRandom(jokes) ?? ''
    }

    setRandomJoke()
    jokeElement.addEventListener('click', setRandomJoke)

    return () => {
        jokeElement.removeEventListener('click', setRandomJoke)
    }
}

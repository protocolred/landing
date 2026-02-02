import { SELECTORS } from '@/core/constants'
import { qs } from '@/core/dom'
import { getJokes } from '@/data/api'

export function initJokes(): void {
    const jokeElement = qs<HTMLElement>(SELECTORS.protocolJoke)
    if (!jokeElement) return

    const jokes = getJokes()
    if (!Array.isArray(jokes) || jokes.length === 0) return

    const setRandomJoke = () => {
        const randomIndex = Math.floor(Math.random() * jokes.length)
        jokeElement.textContent = jokes[randomIndex] ?? ''
    }

    setRandomJoke()
    jokeElement.addEventListener('click', setRandomJoke)
}

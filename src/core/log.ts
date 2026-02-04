type LogMethod = (...args: unknown[]) => void

const buildPrefix = (scope: string) => `[${scope}]`

export const createLogger = (scope: string, enabled = false) => {
    const prefix = buildPrefix(scope)
    const logIfEnabled =
        (method: LogMethod): LogMethod =>
        (...args) => {
            if (!enabled) return
            method(prefix, ...args)
        }

    return {
        info: logIfEnabled(console.info),
        warn: logIfEnabled(console.warn),
        error: logIfEnabled(console.error),
    }
}

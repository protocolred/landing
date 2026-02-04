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
        // Console access is centralized here and gated by the `enabled` flag.
        // eslint-disable-next-line no-console
        info: logIfEnabled(console.info),
        // eslint-disable-next-line no-console
        warn: logIfEnabled(console.warn),
        // eslint-disable-next-line no-console
        error: logIfEnabled(console.error),
    }
}

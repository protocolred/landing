const fs = require('fs')
const path = require('path')

const timestamp = Date.now()
const root = path.resolve(__dirname, '..')
const targets = ['index.html', 'docs/privacy.html']

function shouldTouchUrl(url) {
    if (!url) return false
    if (url.startsWith('#')) return false
    if (url.startsWith('mailto:')) return false
    if (url.startsWith('tel:')) return false
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
        return false
    return (
        url.startsWith('dist/') ||
        url.startsWith('src/') ||
        url.startsWith('../dist/') ||
        url.startsWith('../src/')
    )
}

function withCacheBust(url) {
    const [withoutHash, hash = ''] = url.split('#')
    const [pathname, query = ''] = withoutHash.split('?')
    const params = new URLSearchParams(query)
    params.set('v', String(timestamp))
    const nextQuery = params.toString()
    return `${pathname}?${nextQuery}${hash ? `#${hash}` : ''}`
}

const updateFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const next = content.replace(/\b(href|src)=(["'])([^"']+)\2/g, (match, attr, quote, url) => {
        if (!shouldTouchUrl(url)) return match
        return `${attr}=${quote}${withCacheBust(url)}${quote}`
    })

    if (next !== content) {
        fs.writeFileSync(filePath, next)
    }
}

targets.forEach((file) => {
    const filePath = path.join(root, file)
    if (!fs.existsSync(filePath)) return
    updateFile(filePath)
})

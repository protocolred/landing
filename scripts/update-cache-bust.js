const fs = require('fs')
const path = require('path')

const timestamp = Date.now()
const root = path.resolve(__dirname, '..')
const targets = ['index.html', 'docs/privacy.html', 'dist/index.html', 'dist/docs/privacy.html']

const updateFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const next = content
        .replace(/dist\/styles\.css\?v=[^"']+/g, `dist/styles.css?v=${timestamp}`)
        .replace(/dist\/app\.js\?v=[^"']+/g, `dist/app.js?v=${timestamp}`)
        .replace(/styles\.css\?v=[^"']+/g, `styles.css?v=${timestamp}`)
        .replace(/app\.js\?v=[^"']+/g, `app.js?v=${timestamp}`)

    if (next !== content) {
        fs.writeFileSync(filePath, next)
    }
}

targets.forEach((file) => {
    const filePath = path.join(root, file)
    if (!fs.existsSync(filePath)) return
    updateFile(filePath)
})

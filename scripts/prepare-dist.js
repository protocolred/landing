const fs = require('fs')
const path = require('path')

const distPath = path.resolve(__dirname, '..', 'dist')

try {
    fs.rmSync(distPath, { recursive: true, force: true })
    fs.mkdirSync(distPath, { recursive: true })
} catch (err) {
    console.error('Failed to prepare dist folder.')
    console.error(err)
    process.exitCode = 1
}

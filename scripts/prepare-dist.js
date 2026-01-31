const fs = require('fs')
const path = require('path')

const distPath = path.resolve(__dirname, '..', 'dist')
const rootPath = path.resolve(__dirname, '..')

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true })
}

function copyFile(from, to) {
    ensureDir(path.dirname(to))
    fs.copyFileSync(from, to)
}

function copyDir(fromDir, toDir) {
    if (!fs.existsSync(fromDir)) return
    ensureDir(toDir)
    for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
        const from = path.join(fromDir, entry.name)
        const to = path.join(toDir, entry.name)
        if (entry.isDirectory()) {
            copyDir(from, to)
            continue
        }
        if (entry.isFile()) {
            copyFile(from, to)
        }
    }
}

function rewriteHtml(content, replacements) {
    let next = content
    for (const [from, to] of replacements) {
        next = next.replaceAll(from, to)
    }
    return next
}

try {
    fs.rmSync(distPath, { recursive: true, force: true })
    ensureDir(distPath)

    // Static assets (runtime fetches + <img> / icons)
    copyDir(path.join(rootPath, 'src', 'images'), path.join(distPath, 'images'))
    copyDir(path.join(rootPath, 'src', 'texts'), path.join(distPath, 'texts'))

    // HTML entrypoints (make dist self-contained)
    const indexSrc = path.join(rootPath, 'index.html')
    if (fs.existsSync(indexSrc)) {
        const content = fs.readFileSync(indexSrc, 'utf8')
        const rewritten = rewriteHtml(content, [
            ['href="dist/styles.css', 'href="styles.css'],
            ['src="dist/app.js', 'src="app.js'],
            ['href="src/images/', 'href="images/'],
            ['src="src/images/', 'src="images/'],
        ])
        fs.writeFileSync(path.join(distPath, 'index.html'), rewritten)
    }

    const privacySrc = path.join(rootPath, 'docs', 'privacy.html')
    if (fs.existsSync(privacySrc)) {
        const content = fs.readFileSync(privacySrc, 'utf8')
        const rewritten = rewriteHtml(content, [
            ['href="../dist/styles.css', 'href="../styles.css'],
            ['href="../src/images/', 'href="../images/'],
            ['src="../src/images/', 'src="../images/'],
        ])
        const outPath = path.join(distPath, 'docs', 'privacy.html')
        ensureDir(path.dirname(outPath))
        fs.writeFileSync(outPath, rewritten)
    }
} catch (err) {
    console.error('Failed to prepare dist folder.')
    console.error(err)
    process.exitCode = 1
}

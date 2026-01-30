const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname);
const PORT = Number.parseInt(process.env.PORT || "", 10) || 3000;
const HOST = process.env.HOST || "localhost";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  if (body == null) {
    res.end();
    return;
  }
  res.end(body);
}

function safeJoin(rootDir, urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const relative = decoded.replace(/^\/+/, "");
  const resolved = path.resolve(rootDir, relative);
  if (!resolved.startsWith(rootDir + path.sep) && resolved !== rootDir) return null;
  return resolved;
}

function isProbablyHtmlRequest(req) {
  const accept = req.headers.accept || "";
  return accept.includes("text/html") || accept.includes("*/*");
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      send(
        res,
        405,
        { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" },
        "Method Not Allowed",
      );
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";

    let filePath;
    try {
      filePath = safeJoin(ROOT_DIR, pathname);
    } catch {
      send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
      return;
    }

    if (!filePath) {
      send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
      return;
    }

    let stat;
    try {
      stat = await fs.promises.stat(filePath);
      if (stat.isDirectory()) {
        const indexFile = path.join(filePath, "index.html");
        stat = await fs.promises.stat(indexFile);
        filePath = indexFile;
      }
    } catch {
      if (isProbablyHtmlRequest(req)) {
        send(
          res,
          404,
          { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
          "<!doctype html><meta charset=utf-8><title>404</title><h1>404</h1><p>Not found</p>",
        );
        return;
      }
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(stat.size));
    res.setHeader("Cache-Control", "no-cache");

    if (req.method === "HEAD") {
      res.statusCode = 200;
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal Server Error");
    });
    stream.pipe(res);
  } catch (err) {
    send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal Server Error");
  }
});

if (require.main === module) {
  server.on("error", (err) => {
    const code = err && typeof err === "object" ? err.code : undefined;
    const message =
      code === "EADDRINUSE"
        ? `Port ${PORT} is already in use. Try PORT=${PORT + 1}.`
        : code === "EACCES" || code === "EPERM"
          ? `Permission denied binding to ${HOST}:${PORT}. Try another PORT.`
          : "Failed to start server.";
    console.error(message);
    process.exitCode = 1;
  });

  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

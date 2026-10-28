// A real directory-based static server. No SPA catch-all or backend/API simulation.
const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve("out"),
  prefix = "/love-universe";
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  const inline = args.find((a) => a.startsWith(name + "="));
  return inline
    ? inline.slice(name.length + 1)
    : index >= 0
      ? args[index + 1]
      : fallback;
}
const port = Number(option("--port", process.env.PORT || "3000")),
  host = option("--hostname", "127.0.0.1");
if (!fs.existsSync(path.join(root, "index.html")))
  throw Error("请先执行 npm run build 生成 out/");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad URL");
    return;
  }
  if (pathname === "/" || pathname === prefix) {
    res.writeHead(302, { Location: prefix + "/" + url.search });
    res.end();
    return;
  }
  function missing() {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(path.join(root, "404.html")).pipe(res);
  }
  if (!pathname.startsWith(prefix + "/")) {
    missing();
    return;
  }
  let file = path.resolve(root, "." + pathname.slice(prefix.length));
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    if (fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: url.pathname + "/" + url.search });
        res.end();
        return;
      }
      file = path.join(file, "index.html");
    }
    if (!fs.statSync(file).isFile()) {
      missing();
      return;
    }
  } catch {
    missing();
    return;
  }
  res.writeHead(200, {
    "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-cache",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(file).pipe(res);
});
server.listen(port, host, () =>
  console.log(`GitHub Pages 本地静态预览：http://${host}:${port}${prefix}/`),
);
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

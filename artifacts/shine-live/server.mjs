import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT);
const BASE = (process.env.BASE_PATH || "/").replace(/\/$/, "");
const API_PORT = 8080;

const ROOT = __dirname;
const PUB = path.join(ROOT, "public");
const INDEX = path.join(ROOT, "index.html");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".woff2":"font/woff2",
  ".woff": "font/woff",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}

function proxyToApi(req, res, apiPath) {
  const opts = {
    hostname: "localhost",
    port: API_PORT,
    path: apiPath + (req.url.includes("?") ? "?" + req.url.split("?")[1] : ""),
    method: req.method,
    headers: { ...req.headers, host: `localhost:${API_PORT}` },
  };
  const proxyReq = http.request(opts, (proxyRes) => {
    const hdrs = { ...proxyRes.headers };
    delete hdrs["transfer-encoding"];
    res.writeHead(proxyRes.statusCode, hdrs);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on("error", () =>
    send(res, 502, JSON.stringify({ error: "API unavailable" }), { "Content-Type": "application/json" })
  );
  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (BASE && url.startsWith(BASE)) url = url.slice(BASE.length);
  if (url === "" || url === "/") {
    return send(res, 200, fs.readFileSync(INDEX), { "Content-Type": MIME[".html"] });
  }

  // Proxy all /api/ requests to the API server
  if (url.startsWith("/api/")) {
    return proxyToApi(req, res, url);
  }

  const filePath = path.join(PUB, url);
  if (!filePath.startsWith(PUB)) return send(res, 403, "forbidden");
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return send(res, 200, fs.readFileSync(INDEX), { "Content-Type": MIME[".html"] });
  }
  const ext = path.extname(filePath).toLowerCase();
  send(res, 200, fs.readFileSync(filePath), { "Content-Type": MIME[ext] || "application/octet-stream" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`shine-live serving ${BASE || "/"} on :${PORT}`);
});

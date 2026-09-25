import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import http from "node:http";
import type { IncomingMessage } from "node:http";

const API_PROXY_TARGET = "http://localhost:4000";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

const getIncomingHeader = (
  req: IncomingMessage,
  name: string,
): string | undefined => {
  const lower = name.toLowerCase();
  const value = req.headers[lower];
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const first = value.find((item) => item?.trim());
    if (first) return first;
  }
  const raw = req.rawHeaders;
  for (let i = 0; i < raw.length; i += 2) {
    if (raw[i].toLowerCase() === lower && raw[i + 1]?.trim()) {
      return raw[i + 1];
    }
  }
  return undefined;
};

/** Vite's default http-proxy can drop Authorization; copy headers via Node http. */
const preserveAuthApiProxy = (targetOrigin: string): Plugin => ({
  name: "preserve-auth-api-proxy",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith("/api")) {
        next();
        return;
      }

      const target = new URL(req.url, targetOrigin);
      const headers: http.OutgoingHttpHeaders = {};

      for (const [headerName, headerValue] of Object.entries(req.headers)) {
        const lower = headerName.toLowerCase();
        if (HOP_BY_HOP_HEADERS.has(lower)) continue;
        if (lower === "host" || lower === "accept-encoding") continue;
        if (headerValue == null) continue;
        headers[lower] = headerValue;
      }

      const authorization = getIncomingHeader(req, "authorization");
      if (authorization) {
        headers.authorization = authorization;
      }
      headers.host = target.host;

      const proxyReq = http.request(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port,
          path: `${target.pathname}${target.search}`,
          method: req.method,
          headers,
        },
        (proxyRes) => {
          const responseHeaders = { ...proxyRes.headers };
          delete responseHeaders["transfer-encoding"];
          res.writeHead(proxyRes.statusCode ?? 502, responseHeaders);
          proxyRes.pipe(res);
        },
      );

      proxyReq.on("error", (error) => {
        if (!res.headersSent) {
          res.statusCode = 502;
        }
        res.end(`API proxy error: ${error.message}`);
      });

      req.pipe(proxyReq);
    });
  },
});

export default defineConfig({
  plugins: [react(), preserveAuthApiProxy(API_PROXY_TARGET)],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    alias: {
      "vaul@1.1.2": "vaul",
      "sonner@2.0.3": "sonner",
      "recharts@2.15.2": "recharts",
      "react-resizable-panels@2.1.7": "react-resizable-panels",
      "react-hook-form@7.55.0": "react-hook-form",
      "react-day-picker@8.10.1": "react-day-picker",
      "lucide-react@0.487.0": "lucide-react",
      "input-otp@1.4.2": "input-otp",
      "figma:asset/da3a8019dc769c6ee77d3527d69202b460a32a75.png": path.resolve(
        __dirname,
        "./src/assets/da3a8019dc769c6ee77d3527d69202b460a32a75.png",
      ),
      "figma:asset/509bd1171d6cdbf113bf0bb7c8be00f47c2fdad0.png": path.resolve(
        __dirname,
        "./src/assets/509bd1171d6cdbf113bf0bb7c8be00f47c2fdad0.png",
      ),
      "embla-carousel-react@8.6.0": "embla-carousel-react",
      "cmdk@1.1.1": "cmdk",
      "class-variance-authority@0.7.1": "class-variance-authority",
      "@radix-ui/react-tooltip@1.1.8": "@radix-ui/react-tooltip",
      "@radix-ui/react-toggle@1.1.2": "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group@1.1.2": "@radix-ui/react-toggle-group",
      "@radix-ui/react-tabs@1.1.3": "@radix-ui/react-tabs",
      "@radix-ui/react-switch@1.1.3": "@radix-ui/react-switch",
      "@radix-ui/react-slot@1.1.2": "@radix-ui/react-slot",
      "@radix-ui/react-slider@1.2.3": "@radix-ui/react-slider",
      "@radix-ui/react-separator@1.1.2": "@radix-ui/react-separator",
      "@radix-ui/react-select@2.1.6": "@radix-ui/react-select",
      "@radix-ui/react-scroll-area@1.2.3": "@radix-ui/react-scroll-area",
      "@radix-ui/react-radio-group@1.2.3": "@radix-ui/react-radio-group",
      "@radix-ui/react-progress@1.1.2": "@radix-ui/react-progress",
      "@radix-ui/react-popover@1.1.6": "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu@1.2.5":
        "@radix-ui/react-navigation-menu",
      "@radix-ui/react-menubar@1.1.6": "@radix-ui/react-menubar",
      "@radix-ui/react-label@2.1.2": "@radix-ui/react-label",
      "@radix-ui/react-hover-card@1.1.6": "@radix-ui/react-hover-card",
      "@radix-ui/react-dropdown-menu@2.1.6": "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog@1.1.6": "@radix-ui/react-dialog",
      "@radix-ui/react-context-menu@2.2.6": "@radix-ui/react-context-menu",
      "@radix-ui/react-collapsible@1.1.3": "@radix-ui/react-collapsible",
      "@radix-ui/react-checkbox@1.1.4": "@radix-ui/react-checkbox",
      "@radix-ui/react-avatar@1.1.3": "@radix-ui/react-avatar",
      "@radix-ui/react-aspect-ratio@1.1.2": "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-alert-dialog@1.1.6": "@radix-ui/react-alert-dialog",
      "@radix-ui/react-accordion@1.2.3": "@radix-ui/react-accordion",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "build",
  },
  // Custom /api proxy (preserveAuthApiProxy) applies only to `npm run dev`.
  // Production uses VITE_API_BASE_URL from .env.production (see src/config/api.ts).
  server: {
    port: 3000,
    open: true,
  },
});

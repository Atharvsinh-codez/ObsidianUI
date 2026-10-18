import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import routeMap from "../src/lib/generated/agent-route-map.json";

type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]>;
const request = (pathname: string, accept = "*/*", init: NextRequestInit = {}) => {
  const headers = new Headers({ Accept: accept });
  new Headers(init.headers).forEach((value, name) => headers.set(name, value));
  return new NextRequest(`https://www.obsidianui.dev${pathname}`, { ...init, headers });
};
const documentVary = "Accept, Accept-Encoding, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch";

test("every known page negotiates a bounded generated Markdown URL and advertises alternatives", () => {
  for (const [pathname, markdown] of Object.entries(routeMap)) {
    const response = proxy(request(`${pathname}?campaign=test`, "text/markdown"));
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers.get("x-middleware-rewrite"), `https://www.obsidianui.dev${markdown}`, pathname);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("vary"), documentVary);
    assert.match(response.headers.get("link")!, /llms\.txt/);
    assert.match(response.headers.get("link")!, /rel="alternate"; type="text\/markdown"/);
  }
});

test("HTML and default clients retain pages, including the existing docs redirect", () => {
  for (const accept of ["*/*", "text/html", "text/markdown;q=0.4,text/html;q=0.8"]) {
    for (const pathname of ["/", "/components", "/api", "/docs"]) {
      const response = proxy(request(pathname, accept));
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.equal(response.headers.get("x-middleware-rewrite"), null);
      assert.equal(response.headers.get("vary"), documentVary);
      assert.equal(response.headers.get("content-type"), null);
    }
  }
});

test("all predictable Markdown aliases are mapped without filesystem reads", () => {
  for (const [pathname, markdown] of Object.entries(routeMap)) {
    const alias = pathname === "/" ? "/index.md" : `${pathname}.md`;
    assert.equal(proxy(request(alias)).headers.get("x-middleware-rewrite"), `https://www.obsidianui.dev${markdown}`);
  }
  assert.equal(proxy(request("/components.md", "text/html")).status, 406);
});

test("unsupported representation receives 406 rather than incorrect content", async () => {
  const response = proxy(request("/components", "application/json"));
  assert.equal(response.status, 406);
  assert.match(await response.text(), /Accept: text\/html or Accept: text\/markdown/);
  assert.equal(response.headers.get("vary"), documentVary);
});

test("missing document URLs reach the HTML not-found page for HTML clients", () => {
  for (const pathname of ["/missing", "/docs/removed-component", "/constructor", "/__proto__"]) {
    for (const accept of ["*/*", "text/html"]) {
      const response = proxy(request(pathname, accept));
      assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
      assert.equal(response.headers.get("content-type"), null);
    }
  }
});

test("missing document URLs return concise Markdown 404 recovery to Markdown clients", async () => {
  for (const pathname of ["/missing", "/docs/removed-component", "/docs/missing.md", "/constructor", "/__proto__", "/docs/%2e%2e%2fprivate.md", "/docs/a%5cb.md"]) {
    const response = proxy(request(pathname, "text/markdown"));
    assert.equal(response.status, 404, pathname);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.text();
    assert.match(body, /^# Page not found/);
    assert.match(body, /llms\.txt/);
    assert.match(body, /sitemap\.xml/);
    assert.match(body, /\/docs\/installation/);
  }
});

test("HEAD negotiates the same route and error headers without an error body", async () => {
  const head = proxy(request("/components", "text/markdown", { method: "HEAD" }));
  assert.equal(head.headers.get("x-middleware-rewrite"), "https://www.obsidianui.dev/markdown/components.md");
  for (const [pathname, accept, status] of [["/missing", "text/markdown", 404], ["/components", "application/json", 406]] as const) {
    const response = proxy(request(pathname, accept, { method: "HEAD" }));
    assert.equal(response.status, status);
    assert.equal(await response.text(), "");
  }
});

test("RSC navigation stays in Next and cannot become a Markdown rewrite", () => {
  const variants: NextRequestInit[] = [{ headers: { rsc: "1" } }, { headers: { Accept: "text/x-component" } }];
  for (const pathname of ["/components", "/docs/missing"]) {
    for (const init of variants) {
      const response = proxy(request(pathname, "text/markdown", init));
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.equal(response.headers.get("x-middleware-rewrite"), null);
    }
  }
});

test("write methods, API routes, registries and static assets keep existing handling", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    assert.equal(proxy(request("/components", "text/markdown", { method })).headers.get("x-middleware-next"), "1");
  }
  for (const pathname of ["/api/docs/installation/markdown", "/r/art-gallery.json", "/_next/static/chunk.js", "/_next/image", "/_pagefind/pagefind.js", "/markdown/index.md", "/logo.svg", "/effects/demo.png", "/openapi.json", "/robots.txt", "/llms.txt", "/agent-instructions.md", "/.well-known/example"]) {
    const response = proxy(request(pathname, "text/markdown"));
    assert.equal(response.headers.get("x-middleware-next"), "1", pathname);
    assert.equal(response.headers.get("vary"), null);
  }
});

test("agent User-Agents receive the same public negotiation behavior as every reader", () => {
  for (const userAgent of ["GPTBot", "ClaudeBot", "ChatGPT-User", "PerplexityBot", "Google-Extended", "Applebot-Extended", "DeepSeekBot", "Mozilla/5.0"]) {
    const response = proxy(request("/", "text/html", { headers: { "User-Agent": userAgent } }));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.status, 200);
  }
});

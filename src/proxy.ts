import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import routeMap from "./lib/generated/agent-route-map.json";
import { acceptsMarkdown, acceptsReactStream, appendVary, negotiateDocument } from "./lib/agent/content-negotiation";

const documents = new Map<string, string>(Object.entries(routeMap));
const aliases = new Map<string, string>(Object.entries(routeMap).map(([pathname, markdown]) =>
  [pathname === "/" ? "/index.md" : `${pathname}.md`, markdown],
));
const reservedPrefixes = ["/api/", "/r/", "/_next/", "/_pagefind/", "/markdown/", "/.well-known/"];
const documentVary = ["Accept", "Accept-Encoding", "RSC", "Next-Router-State-Tree", "Next-Router-Prefetch", "Next-Router-Segment-Prefetch"];
const recovery = "# Page not found\n\nThis ObsidianUI page does not exist. Try these resources:\n\n- [Documentation](/docs/installation)\n- [Component catalog](/components)\n- [Agent instructions](/llms.txt)\n- [Sitemap](/sitemap.xml)\n";

function documentHeaders(response: NextResponse, markdown?: string) {
  response.headers.set("Vary", appendVary(response.headers.get("Vary"), ...documentVary));
  response.headers.set("Link", [
    '</llms.txt>; rel="describedby"',
    ...(markdown ? [`<${markdown}>; rel="alternate"; type="text/markdown"`] : []),
  ].join(", "));
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

function markdownResponse(request: NextRequest, body: string, status: number) {
  const response = new NextResponse(request.method === "HEAD" ? null : body, {
    status,
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" },
  });
  return documentHeaders(response);
}

function assetsBinding(): { fetch(input: string | URL): Promise<Response> } | undefined {
  try {
    return getCloudflareContext().env.ASSETS;
  } catch {
    // Outside a Worker (next dev, next start, tests) there is no Cloudflare context.
    return undefined;
  }
}

async function rewriteMarkdown(request: NextRequest, pathname: string) {
  // On Workers, public files live in the assets binding, which proxy rewrites never reach.
  const assets = assetsBinding();
  if (assets) {
    const asset = await assets.fetch(new URL(pathname, request.url));
    if (!asset.ok) {
      await asset.body?.cancel();
      return markdownResponse(request, recovery, 404);
    }
    if (request.method === "HEAD") await asset.body?.cancel();
    const response = new NextResponse(request.method === "HEAD" ? null : asset.body, {
      status: 200,
      headers: { "Content-Type": "text/markdown; charset=utf-8", "Access-Control-Allow-Origin": "*" },
    });
    return documentHeaders(response, pathname);
  }
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";
  const response = NextResponse.rewrite(target);
  // Config headers execute before rewrites, so set the destination media type here.
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  response.headers.set("Access-Control-Allow-Origin", "*");
  return documentHeaders(response, pathname);
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept");
  const markdown = documents.get(pathname);

  // Leave Next.js's navigation protocol intact, including its not-found rendering.
  if (request.headers.get("rsc") === "1" || acceptsReactStream(accept)) {
    return markdown ? documentHeaders(NextResponse.next(), markdown) : NextResponse.next();
  }

  const alias = aliases.get(pathname);
  if (alias) {
    return acceptsMarkdown(accept) ? rewriteMarkdown(request, alias)
      : markdownResponse(request, "# Not acceptable\n\nThis resource is available as text/markdown.\n", 406);
  }

  if (markdown) {
    const representation = negotiateDocument(accept);
    if (representation === "markdown") return rewriteMarkdown(request, markdown);
    if (representation === "html") return documentHeaders(NextResponse.next(), markdown);
    return markdownResponse(request, "# Not acceptable\n\nRequest this page with Accept: text/html or Accept: text/markdown.\n", 406);
  }

  // APIs and static files keep their own routing and status codes. Only unknown
  // document paths receive the short recovery response; no filesystem lookup occurs.
  const filename = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (reservedPrefixes.some(prefix => pathname.startsWith(prefix)) ||
      (filename.includes(".") && !filename.endsWith(".md")) ||
      pathname === "/agent-instructions.md") return NextResponse.next();

  const representation = negotiateDocument(accept);
  if (representation === "html" && !pathname.endsWith(".md")) return NextResponse.next();
  if (representation === null) return markdownResponse(request, "# Not acceptable\n\nRequest this page with Accept: text/html or Accept: text/markdown.\n", 406);
  return markdownResponse(request, recovery, 404);
}

export const config = {
  matcher: [
    "/((?!_next/|_pagefind/|api/|r/|markdown/|effects/|folder-preview/|logo/|templates/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|ogg|mp3|wav|glb|gltf|hdr|woff|woff2|ttf|ico|css|js)).*)",
  ],
};

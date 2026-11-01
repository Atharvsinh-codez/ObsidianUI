import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDocumentationMarkdownHandler } from "@/lib/server/docs-markdown";

export const runtime = "nodejs";

// On Cloudflare Workers, public files live in the assets binding instead of the file system.
async function loadMarkdown(slug: string) {
  const file = `/markdown/docs/${slug}.md`;
  let assets: { fetch(input: string): Promise<Response> } | undefined;
  try {
    assets = getCloudflareContext().env.ASSETS;
  } catch {
    // Outside a Worker (next start, tests) there is no Cloudflare context.
  }
  if (!assets) return readFile(path.join(process.cwd(), "public", file), "utf8");
  const response = await assets.fetch(`https://assets.local${file}`);
  if (!response.ok) throw new Error(`Markdown asset returned ${response.status}`);
  return response.text();
}

// The handler validates the slug against published docs before calling this loader.
export const GET = createDocumentationMarkdownHandler(loadMarkdown);

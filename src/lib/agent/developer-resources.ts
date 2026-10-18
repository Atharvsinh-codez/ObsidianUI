import { siteAnnouncement } from "@/lib/site-announcement";

export const ORIGIN = "https://www.obsidianui.dev";
const repository = "https://github.com/Atharvsinh-codez/ObsidianUI";

export interface DeveloperResource {
  title: string;
  description: string;
  sections: {
    id: string;
    title: string;
    paragraphs?: string[];
    links?: { title: string; href: string; description?: string }[];
    code?: string;
  }[];
}

export const developerResources: Record<string, DeveloperResource> = {
  "/developers": {
    title: "ObsidianUI Developer Portal",
    description: "Find component source files, installation guides, the public API, and resources for coding agents.",
    sections: [
      {
        id: "start", title: "Build with ObsidianUI",
        paragraphs: ["ObsidianUI is an open-source React component library for motion, scroll interactions, and interface details. Use the previews to choose a component, then install its source into your own project.", "Each registry item includes its source files, local dependencies, installation targets, and npm dependencies. Review the complete item before writing files so your customizations stay intact."],
        links: [
          { title: "Browse components", href: "/components" },
          { title: "Installation guide", href: "/docs/installation" },
          { title: "Component registry", href: "/r/registry.json", description: "Complete machine-readable catalog and component files." },
        ],
      },
      {
        id: "agents", title: "Resources for AI agents",
        links: [
          { title: "ObsidianUI llms.txt", href: "/llms.txt", description: "When to use the library and how to find and download components." },
          { title: "Agent instructions", href: "/agent-instructions.md" },
          { title: "ObsidianUI API documentation", href: "/api" },
          { title: "OpenAPI specification", href: "/openapi.json" },
          { title: "Authentication documentation", href: "/authentication" },
          { title: "MCP server documentation", href: "/mcp" },
        ],
      },
      {
        id: "source", title: "Source and support",
        paragraphs: ["The repository is MIT licensed. Third-party assets and dependencies retain their own licenses; use your own media when adapting examples."],
        links: [{ title: "Source code", href: repository }, { title: "MIT license", href: `${repository}/blob/main/LICENSE` }, { title: "Report an issue", href: `${repository}/issues` }],
      },
    ],
  },
  "/api": {
    title: "ObsidianUI API Documentation",
    description: "A public, read-only HTTP interface for discovering components, downloading complete source files, and reading documentation as Markdown.",
    sections: [
      {
        id: "discover", title: "Discover and download components",
        paragraphs: ["GET /r/registry.json returns the component catalog. Select an item by name, then GET /r/{name}.json to download that component with its supporting files. /r/index.json is an equivalent catalog URL.", "Each files entry contains path, target, type, and content. Resolve @ui, @components, @lib, and @hooks targets against your project's components.json aliases. Install the declared npm dependencies and copy every required file; compare existing files before replacing them.", "The docs and meta fields describe any required application endpoints or remote demo assets. Downloading a component does not provide a backend for these requirements."],
        code: `curl -fsS ${ORIGIN}/r/registry.json\ncurl -fsS ${ORIGIN}/r/hover-img.json -o hover-img.json`,
        links: [{ title: "OpenAPI specification", href: "/openapi.json" }, { title: "Registry catalog", href: "/r/registry.json" }],
      },
      {
        id: "markdown", title: "Read any public page as Markdown",
        paragraphs: ["Send Accept: text/markdown to a public page URL. The response uses Content-Type: text/markdown and Vary: Accept to keep the Markdown and HTML cache variants separate. Accept quality values are respected; unsupported media types return 406.", "Markdown is also available at predictable .md URLs, including /index.md and /docs/hover-img.md. GET /api/docs/{slug}/markdown remains available for documentation integrations. Missing pages return HTTP 404 with recovery links."],
        code: `curl -fsS -H 'Accept: text/markdown' ${ORIGIN}/docs/hover-img\ncurl -fsS ${ORIGIN}/docs/hover-img.md`,
        links: [{ title: "Agent index", href: "/llms.txt" }, { title: "Sitemap", href: "/sitemap.xml" }],
      },
      {
        id: "access", title: "Access and scope",
        paragraphs: ["No API key, account, or cookie is required for public documentation and registry downloads. This API supplies source code and documentation; it does not host your application, run agents, or provide a remote MCP transport."],
        links: [{ title: "Authentication documentation", href: "/authentication" }, { title: "Local MCP setup", href: "/mcp" }],
      },
    ],
  },
  "/authentication": {
    title: "ObsidianUI Authentication Documentation",
    description: "Public component downloads and documentation require no authentication.",
    sections: [
      {
        id: "public-access", title: "Public access",
        paragraphs: ["Read the registry, Markdown documentation, llms.txt, and OpenAPI specification with ordinary HTTPS GET requests. No API key, account, bearer token, session cookie, or login flow is required.", "Use a descriptive User-Agent and fetch only the files needed for the current task. Cache unchanged downloads locally. If a deployed edge service returns 403, report the URL and response headers to the maintainer rather than attempting to bypass the restriction."],
        links: [{ title: "API documentation", href: "/api" }, { title: "Crawler policy", href: "/robots.txt" }],
      },
      {
        id: "your-project", title: "Authentication in your application",
        paragraphs: ["Copying a UI component does not add authentication or a backend to your application. If an example needs an application API, provide and secure that endpoint yourself. Never put secret keys into client component files or registry content."],
        links: [{ title: "Installation guide", href: "/docs/installation" }],
      },
    ],
  },
  "/mcp": {
    title: "ObsidianUI MCP Server Documentation",
    description: "Connect a local coding agent to ObsidianUI component resources through the repository's stdio MCP server.",
    sections: [
      {
        id: "announcement", title: "A new direction for ObsidianUI",
        paragraphs: [siteAnnouncement],
      },
      {
        id: "setup", title: "Run the local MCP server",
        paragraphs: ["The repository includes an MCP server in scripts/mcp-server.ts. It uses stdio transport and exposes read-only resources. This documentation URL is not a hosted HTTP MCP endpoint.", "Clone the repository, install its dependencies, and generate the component registry. Configure your MCP client to launch npm run mcp with this checkout as its working directory."],
        code: `git clone ${repository}.git\ncd ObsidianUI\nnpm ci\nnpm run registry:build\nnpm run mcp`,
        links: [{ title: "MCP server source", href: `${repository}/blob/main/scripts/mcp-server.ts` }],
      },
      {
        id: "resources", title: "Read component resources",
        paragraphs: ["Use MCP resources/list to discover available components. Then use resources/read with a returned URI, such as obsidian://hover-img. The resource returns the same application/json registry item used by HTTP installation, including all source and supporting files.", "The server exposes resources, not code-execution or file-writing tools. Your coding agent applies the downloaded files in your project with your normal approval and review settings."],
        links: [{ title: "HTTP registry alternative", href: "/r/registry.json" }, { title: "Agent installation instructions", href: "/agent-instructions.md" }],
      },
    ],
  },
};

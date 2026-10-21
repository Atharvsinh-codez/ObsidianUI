import { ORIGIN } from "./developer-resources";

const markdown = { "text/markdown": { schema: { type: "string" } } };
const recovery = { description: "Resource not found. Follow the Markdown recovery links.", content: markdown };
const registryResponse = { description: "Complete ObsidianUI component registry.", content: { "application/json": { schema: { $ref: "#/components/schemas/Registry" } } } };
const slugParameter = { name: "slug", in: "path", required: true, description: "Published documentation slug, such as hover-img.", schema: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } };

export const openapi = {
  openapi: "3.1.1",
  info: {
    title: "ObsidianUI Component and Documentation API",
    version: "1.0.0",
    description: "Public read-only access to component source and documentation. No authentication is required. Download every files entry and resolve installation aliases using your project's components.json. The local stdio MCP server is documented at /mcp; there is no hosted HTTP MCP transport.",
    license: { name: "MIT", identifier: "MIT" },
    contact: { name: "ObsidianUI", url: `${ORIGIN}/developers` },
  },
  servers: [{ url: ORIGIN }],
  security: [],
  externalDocs: { description: "ObsidianUI API documentation", url: `${ORIGIN}/api` },
  tags: [{ name: "Components" }, { name: "Documentation" }, { name: "Discovery" }],
  paths: {
    "/r/registry.json": { get: { operationId: "listComponents", tags: ["Components"], summary: "List all components with complete source files", responses: { "200": registryResponse } } },
    "/r/index.json": { get: { operationId: "listComponentsAlias", tags: ["Components"], summary: "Read the equivalent registry index", responses: { "200": registryResponse } } },
    "/r/{name}.json": {
      get: {
        operationId: "downloadComponent", tags: ["Components"], summary: "Download a component and all supporting source files",
        parameters: [{ name: "name", in: "path", required: true, description: "A component name returned by the registry catalog.", schema: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }, example: "hover-img" }],
        responses: { "200": { description: "Complete installation payload including local dependencies.", content: { "application/json": { schema: { $ref: "#/components/schemas/RegistryItem" } } } }, "404": { description: "No component has this registry name." } },
      },
    },
    "/api/docs/{slug}/markdown": {
      get: {
        operationId: "getDocumentationMarkdown", tags: ["Documentation"], summary: "Read clean documentation including installation and usage",
        parameters: [slugParameter],
        responses: { "200": { description: "Markdown documentation with complete file and registry references.", content: markdown }, "404": recovery, "500": { description: "The documentation source is temporarily unavailable.", content: markdown } },
      },
    },
    "/docs/{slug}": {
      get: {
        operationId: "getDocumentationPage", tags: ["Documentation"], summary: "Read documentation as HTML or negotiated Markdown",
        description: "Send Accept: text/markdown to select Markdown. Media type quality values are honored. Both representations include Vary: Accept. The default representation is HTML.",
        parameters: [slugParameter],
        responses: {
          "200": { description: "The requested representation.", headers: { Vary: { description: "Includes Accept and Accept-Encoding; may also include Next.js routing headers.", schema: { type: "string" } }, Link: { description: "Markdown alternate and llms.txt discovery links.", schema: { type: "string" } } }, content: { ...markdown, "text/html": { schema: { type: "string" } } } },
          "404": recovery, "406": { description: "Neither HTML nor Markdown is acceptable to the client." },
        },
      },
    },
    "/docs/{slug}.md": { get: { operationId: "getDocumentationMarkdownAlias", tags: ["Documentation"], summary: "Read a predictable Markdown URL", parameters: [slugParameter], responses: { "200": { description: "Markdown documentation.", content: markdown }, "404": recovery } } },
    "/llms.txt": { get: { operationId: "getAgentIndex", tags: ["Discovery"], summary: "Read agent guidance and all component download links", responses: { "200": { description: "llms.txt Markdown index.", content: { "text/plain": { schema: { type: "string" } } } } } } },
    "/llm.txt": { get: { operationId: "getAgentIndexAlias", tags: ["Discovery"], summary: "Read the llm.txt alias of llms.txt", responses: { "200": { description: "The same content as llms.txt.", content: { "text/plain": { schema: { type: "string" } } } } } } },
    "/agent-instructions.md": { get: { operationId: "getAgentInstructions", tags: ["Discovery"], summary: "Read when-to-use and component installation instructions", responses: { "200": { description: "Task-specific instructions for coding agents.", content: markdown } } } },
    "/robots.txt": { get: { operationId: "getCrawlerPolicy", tags: ["Discovery"], summary: "Read crawler access policy", responses: { "200": { description: "Robots Exclusion Protocol rules and sitemap location.", content: { "text/plain": { schema: { type: "string" } } } } } } },
    "/sitemap.xml": { get: { operationId: "getSitemap", tags: ["Discovery"], summary: "Discover all public HTML pages", responses: { "200": { description: "XML sitemap.", content: { "application/xml": { schema: { type: "string" } } } } } } },
  },
  components: {
    schemas: {
      RegistryFile: {
        type: "object", required: ["path", "target", "type", "content"],
        properties: {
          path: { type: "string", description: "Source-relative path." },
          target: { type: "string", description: "Installation target. Resolve @ui/, @components/, @lib/, and @hooks/ through your project's aliases; public/ paths are relative to the project root." },
          type: { type: "string", enum: ["registry:ui", "registry:block", "registry:hook", "registry:lib", "registry:file"] },
          content: { type: "string", minLength: 1, description: "Complete UTF-8 file content." },
        },
      },
      RegistryItem: {
        type: "object", required: ["$schema", "name", "type", "dependencies", "files"],
        properties: {
          $schema: { type: "string", format: "uri" },
          name: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          type: { type: "string", enum: ["registry:ui", "registry:block", "registry:hook", "registry:lib", "registry:file"] },
          title: { type: "string", description: "Display name, when the component ships a guide." },
          description: { type: "string", description: "One-sentence summary, when the component ships a guide." },
          dependencies: { type: "array", items: { type: "string" }, description: "npm package dependencies. React, ReactDOM, and Next.js are framework prerequisites where used." },
          files: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/RegistryFile" } },
          docs: { type: "string", description: "Installation notes and integration requirements." },
          meta: { type: "object", properties: { remoteAssets: { type: "array", items: { type: "string" } }, requiredEndpoints: { type: "array", items: { type: "string" } } } },
        },
      },
      Registry: {
        type: "object", required: ["$schema", "name", "homepage", "items"],
        properties: { $schema: { type: "string", format: "uri" }, name: { type: "string" }, homepage: { type: "string", format: "uri" }, items: { type: "array", items: { $ref: "#/components/schemas/RegistryItem" } } },
      },
    },
  },
};

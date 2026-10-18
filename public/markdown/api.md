# ObsidianUI API Documentation

A public, read-only HTTP interface for discovering components, downloading complete source files, and reading documentation as Markdown.

## Discover and download components

GET /r/registry.json returns the component catalog. Select an item by name, then GET /r/{name}.json to download that component with its supporting files. /r/index.json is an equivalent catalog URL.

Each files entry contains path, target, type, and content. Resolve @ui, @components, @lib, and @hooks targets against your project's components.json aliases. Install the declared npm dependencies and copy every required file; compare existing files before replacing them.

The docs and meta fields describe any required application endpoints or remote demo assets. Downloading a component does not provide a backend for these requirements.

```bash
curl -fsS https://www.obsidianui.dev/r/registry.json
curl -fsS https://www.obsidianui.dev/r/hover-img.json -o hover-img.json
```

[OpenAPI specification](https://www.obsidianui.dev/openapi.json)

[Registry catalog](https://www.obsidianui.dev/r/registry.json)

## Read any public page as Markdown

Send Accept: text/markdown to a public page URL. The response uses Content-Type: text/markdown and Vary: Accept to keep the Markdown and HTML cache variants separate. Accept quality values are respected; unsupported media types return 406.

Markdown is also available at predictable .md URLs, including /index.md and /docs/hover-img.md. GET /api/docs/{slug}/markdown remains available for documentation integrations. Missing pages return HTTP 404 with recovery links.

```bash
curl -fsS -H 'Accept: text/markdown' https://www.obsidianui.dev/docs/hover-img
curl -fsS https://www.obsidianui.dev/docs/hover-img.md
```

[Agent index](https://www.obsidianui.dev/llms.txt)

[Sitemap](https://www.obsidianui.dev/sitemap.xml)

## Access and scope

No API key, account, or cookie is required for public documentation and registry downloads. This API supplies source code and documentation; it does not host your application, run agents, or provide a remote MCP transport.

[Authentication documentation](https://www.obsidianui.dev/authentication)

[Local MCP setup](https://www.obsidianui.dev/mcp)

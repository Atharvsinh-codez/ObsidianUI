# ObsidianUI MCP Integration

## A new direction for ObsidianUI

Now it’s time to be different. Everyone on the internet has already used ready-made components, from images to the smallest details. Atharv ([x.com/athrix_codes](https://x.com/athrix_codes)) is taking a big step to build a next-level UI library, because he knows Claude, Gemini, Codex, and any AI can create components in a few minutes.

Thank you for supporting us through every moment, guys! We’re going big. Stay tuned!

ObsidianUI supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io) through the [Shadcn MCP Server](https://github.com/shadcn-ui/mcp-server). This allows AI assistants (like Cursor, Claude Desktop) to browse and install ObsidianUI components directly.

## Setup

### 1. Update `components.json`

Add the ObsidianUI registry to your project's `components.json` file:

```json
{
  "registries": {
    "@obsidian": "https://www.obsidianui.dev/r/{name}.json"
  }
}
```

### 2. Initialize MCP Server

Run the initialization command for your project:

```bash
npx shadcn@latest mcp init
```

For Cursor users:

```bash
npx shadcn@latest mcp init --client cursor
```

## Usage

Once configured, you can ask your AI assistant to add components:

- "Add the animated-tab-bar component from ObsidianUI"
- "Search for ObsidianUI components"
- "Install @obsidian/card"

## Hosted registry

The MCP server reads your `components.json` configuration and connects to the ObsidianUI registry. This allows the AI to see the list of available components and their code, enabling seamless integration.

Run `npm run registry:build` after changing component source. The generator discovers primitives in `src/components/ui` and custom blocks in `src/components/block`, follows local imports (including hooks, utilities, and CSS), and records package dependencies. The standard catalogs are published at `/r/registry.json` and `/r/index.json`; individual component URLs remain `/r/{name}.json`.

Each top-level file in those folders is a component; a folder with the same name holds its private helpers. A component can ship a guide at `{name}/{name}.mdx`, written as plain Markdown under `title` and `description` front matter. The generator copies these into the item's `title`, `description`, and `docs`, so CLI and MCP clients can read them. A guide does not create a documentation page or a catalog card. `golden-gate-404` is registry-only in this way.

Targets use the consumer's shadcn aliases: primitives use `@ui/`, blocks use `@components/block/`, hooks use `@hooks/`, and helpers use `@lib/`. Use the current shadcn CLI to resolve these placeholders. Install into a project already configured with Tailwind and shadcn theme tokens.

SVG assets are included as text files. Binary demo media uses the public ObsidianUI host; replace those URLs with your own assets for offline use. Components that call application APIs list the required endpoints in their registry installation notes.

## Local resources server

The repository also includes a separate read-only stdio MCP server. Run `npm run registry:build`, then `npm run mcp` from this project directory. This server lists `obsidian://component-name` resources, described by each item's guide where it has one, and returns their generated JSON. It does not install files or expose installation tools.

Resource requests must use the exact scheme and an advertised component name. The reader rejects traversal paths, encoded paths, query strings, fragments, and files outside the registry directory.

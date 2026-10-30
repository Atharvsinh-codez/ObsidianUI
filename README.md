<div align="center">
  <a href="https://www.obsidianui.dev">
    <img
      src="https://cdn-new.obsidianui.dev/og-image.png"
      alt="ObsidianUI - React & Tailwind CSS Components Library"
      width="100%"
    />
  </a>
</div>

<div align="center">

# ObsidianUI

**Design Less. Ship Better.**  
ObsidianUI is React & Tailwind CSS Component Library featuring components, blocks, and landing page templates.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-0a0a0a?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-0a0a0a?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-0a0a0a?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-0a0a0a?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/shadcn-registry-white?labelColor=0a0a0a" alt="shadcn registry" />
  <img src="https://img.shields.io/badge/Motion-0a0a0a?logo=framer&logoColor=white" alt="Motion" />
</p>

[**obsidianui.dev**](https://www.obsidianui.dev) &nbsp;&middot;&nbsp; [Components](https://www.obsidianui.dev/components) &nbsp;&middot;&nbsp; [Templates](https://www.obsidianui.dev/templates) &nbsp;&middot;&nbsp; [Documentation](https://www.obsidianui.dev/docs) &nbsp;&middot;&nbsp; [Follow on X](https://x.com/athrix_codes)

</div>

## What you can build

- **Interactive components:** Preview each effect, read its usage guide, and install the complete source in your React project.
- **Landing page templates:** Explore [Project One](https://www.obsidianui.dev/project-one) and the [template gallery](https://www.obsidianui.dev/templates).
- **Your own source:** Registry installs add editable files to your project, including the styles and local helpers a component needs.
- **Agent access:** Use [`llms.txt`](https://www.obsidianui.dev/llms.txt), Markdown documentation, the [public registry](https://www.obsidianui.dev/r/registry.json), or the local MCP server.

## Built with Factory

ObsidianUI is built with [Factory](https://factory.com) and Droid, Factory's software development agent. The repository is set up so Droid can take a component from idea to install command: the source, a docs page, tests, and the registry entry. Clone it to build your own components with Droid the same way.

Made with Droid:

- [Active Sessions](https://www.obsidianui.dev/docs/active-sessions)
- [Status Bars](https://www.obsidianui.dev/docs/status-bars)
- [Discover Button](https://www.obsidianui.dev/docs/discover-button)
- [Parallax Slider](https://www.obsidianui.dev/docs/parallax-slider)

**Now cooking:** a **Dashboard** component, built with Factory. Coming soon.

### How the repository works with Droid

- **[`AGENTS.md`](AGENTS.md):** Droid loads this file at the start of every session. It sets where primitives, blocks, docs, and tests go, forbids hand-editing generated files, and names the checks to run before work counts as done.
- **[`ACEBUILDER.md`](ACEBUILDER.md) and [`skills/`](skills):** the design conventions `AGENTS.md` points Droid to, covering accessibility, color, layout, typography, transitions, and writing.
- **Generated output:** `npm run registry:build` and `npm run agent:build` rebuild the shadcn registry, `llms.txt`, and the Markdown docs from source, so a component Droid builds can be installed right away.
- **Checks:** `npm test` runs the unit and component tests, and `npm run check` adds lint, type checking, and a production build, so Droid can prove a change works.

### Build a component with Droid

1. Install Droid ([quickstart](https://docs.factory.com/droid-cli/quickstart)):

   ```bash
   # macOS and Linux
   curl -fsSL https://app.factory.ai/cli | sh

   # Windows (PowerShell)
   irm https://app.factory.ai/cli/windows | iex
   ```

2. Clone the repository and start Droid in it:

   ```bash
   git clone https://github.com/Atharvsinh-codez/ObsidianUI.git
   cd ObsidianUI
   npm ci
   droid
   ```

3. Describe the component you want. For example:

   ```text
   Add a pricing toggle component in src/components/block, with a docs page in
   src/content and a component test in tests/components. Then run
   npm run registry:build and npm test.
   ```

4. Review the changes, then run `npm run dev` and open the new docs page at `localhost:3000/docs/<component-name>`.

You can also open the folder in the [Factory App](https://docs.factory.com/factory-app/quickstart) instead of the terminal.

## Quick start

Choose a component from the [showcase](https://www.obsidianui.dev/components), then install it with the shadcn CLI. For example:

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/hover-img.json"
```

For the interactive prism:

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/v-prism.json"
```

Each component page includes a preview, installation steps, and source files. Install the listed dependencies when copying files manually.

## Running locally

```bash
git clone https://github.com/Atharvsinh-codez/ObsidianUI.git
cd ObsidianUI
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser.

- **Primitives:** `src/components/ui`
- **Blocks and effects:** `src/components/block`
- **Documentation:** `src/content`

After updating a component or registry source, rebuild the registry output with `npm run registry:build`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production site, registry manifests, and search index |
| `npm run registry:build` | Rebuild installation manifests from component sources |
| `npm run agent:build` | Rebuild `llms.txt`, Markdown pages, and agent route maps |
| `npm run mcp` | Launch local Model Context Protocol (MCP) server over stdio |
| `npm run lint` | Run ESLint check |
| `npm run typecheck` | Run TypeScript verification |
| `npm test` | Run unit and component test suites |
| `npm run check` | Run lint, types, tests, and production build |

## Star History

<a href="https://www.star-history.com/?repos=atharvsinh-codez%2Fobsidianui&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=atharvsinh-codez/obsidianui&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=atharvsinh-codez/obsidianui&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=atharvsinh-codez/obsidianui&type=date&legend=top-left" />
  </picture>
</a>

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full walkthrough, from creating a component to a working install command.

## License

ObsidianUI is released under the [MIT License](LICENSE).

<div align="center">
  <br />
  <img src="https://cdn-new.obsidianui.dev/logo/bg-less.png" alt="ObsidianUI" width="28" />
  <p><sub>Built by <a href="https://x.com/athrix_codes">@athrix_codes</a></sub></p>
</div>

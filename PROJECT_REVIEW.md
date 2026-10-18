# ObsidianUI cleanup and migration review

Updated 2026-09-09. The framework migration, component restructuring, and fixes below are implemented in the working tree. The complete `npm run check` command passes, and the production site was checked in the browser at desktop and mobile sizes.

## Architecture

The project now uses **Next.js 16.3.4**, **React 19**, **Tailwind CSS v4**, **Nextra 4.6.1**, and `motion/react`. Product pages and documentation share the App Router. Product routes and documentation URLs for retained components remain available.

| Location | Responsibility |
| --- | --- |
| `src/app/` | Shared layout, metadata, API handlers, and thin route entry points |
| `src/app/docs/` | Nextra documentation layout and catch-all MDX route |
| `src/content/` | 24 MDX documents and navigation metadata |
| `src/mdx-components.tsx` | Nextra element mapping |
| `src/components/ui/` | Standard shadcn/Radix primitives |
| `src/components/block/` | Custom animated and interactive components, with adjacent styles |
| `src/components/landing/`, `site/`, `catalog/`, `pages/` | Home sections, site chrome, gallery, and route features |
| `src/components/media/`, `providers/` | Shared video previews, theme, and motion behavior |
| `src/components/docs/` | Installation controls, code previews, and client demo boundaries |
| `src/hooks/`, `src/lib/` | Shared browser behavior and utilities; server-only docs helpers live in `lib/server/` |
| `scripts/`, `tests/` | Registry/MCP tools and regression suites |
| `public/r/` | Generated installation manifests and standard catalogs |

Following the requested removal of 33 components, the generated catalog contains **80 entries**: 50 primitives and 30 custom blocks. Their removed documentation pages, demos, search entries, and registry exports are no longer published. The component gallery has 17 cards, and the home page has three component cards and four video previews. The main site navigation is maintained privately under `components/site`.

Removal verification: `npm run check` passes with 34 tests, TypeScript, production build, and search indexing for 23 documentation pages. Lint has zero errors and four existing native-image advisories. All 33 removed docs URLs and 33 manifest URLs return HTTP 404 locally; retained routes return 200. The gallery renders without browser console errors. The detailed migration checks below describe the earlier, larger catalog.

Theme tokens remain in `src/app/globals.css`, and `cn()` remains in `src/lib/utils.ts`. The supplied workflow is saved in `ACEBUILDER.md`, with `AGENTS.md` directing future work to it. npm and its lockfile provide the reproducible dependency workflow.

Removed the unwanted third-party brand name and logo, unused hero variants, obsolete docs wrappers, legacy Pages Router files, duplicate lockfile, and stale tooling artifacts. Unrelated vendored demos, partial dependency artifacts, and historical notes were moved outside the project into a temporary cleanup archive. Searches found no remaining former-brand references in working files and no `framer-motion` imports in authored source.

## Initial findings and implemented fixes

| Original problem | Implemented change |
| --- | --- |
| Registry payloads omitted local styles, hooks, utilities, primitives, and package dependencies | Generation follows the transitive import graph, detects npm package roots, includes local files, and assigns installation targets by folder. Both `ui` and `block` entry points are discovered. |
| Generated indexes drifted from sources and left obsolete manifests | Both catalogs use the standard registry object format. Generation validates before writing, synchronizes manifests, removes obsolete JSON entries, and fails visibly on errors. |
| MCP resource names could escape the registry directory | Reads require the exact URI scheme, catalog membership, and realpath containment. Generation also rejects unsafe, duplicate, and reserved output names. |
| Installation Copy controls could clear the clipboard | Controls extract nested code, omit empty actions, await clipboard success, and announce failures. Shared context prevents duplicate controls through MDX wrappers. Source steps load this build's registry on demand and provide file selection, per-file copying, and retry. |
| Usage examples disagreed with component APIs | Corrected Flow Scroll, Scroll Effect, Masonry Grid, Horizontal Scroll, Flip Scroll, Folder Preview, Flip Fade Text, Glow Border Card, and Animated Tab Bar examples or prop descriptions. Added missing specialist dependency instructions. |
| Documentation remained on the Pages Router | Migrated to Nextra 4 App Router layouts and content files. Client demo boundaries keep callback and icon-function props out of server-to-client serialization. Removed obsolete routing/theme files and confirmed unused docs wrappers. |
| Autoplay previews lacked pause and reduced-motion handling | Shared previews provide play/pause controls, start paused for reduced motion, pause offscreen, and reset when their source changes. All 19 raw documentation video blocks now use this component. A browser-discovered hover/media-event race was fixed so explicit pause cannot be undone by delayed events. |
| Important actions only worked through pointer-specific handlers | Dialog submission, file selection, and expanded bento details use keyboard-operable controls. Modal interaction restores focus; dock actions have one interactive owner and execute once. |
| OTP instances interfered; failed interest submission remained loading; file drops bypassed restrictions | OTP inputs use instance-local addressing. Failed submissions permit retry. Picker and drop paths enforce consistent selection and file-type rules. |
| Smooth scrolling and effects retained work or disrupted other instances | Owned cleanup replaces global teardown where fixed. Smooth scrolling cancels frames, destroys Lenis, handles preference changes, and guards delayed imports after unmount. |
| Shared navigation, search, and global CSS had accessibility or scope gaps | Added action labels, focus treatments, search relationships, a skip link, and one shared command-menu instance. Mobile docs navigation has compact site links and an opaque themed overlay. Stale app navigation links were corrected. Broad CSS overrides were removed or scoped; component scroll styles travel with their source. |
| Visitor database setup ran too early and failures looked like zero visitors | Database construction is lazy. The API validates schema and body size, returns uncached 503 responses on storage failure, and hides private errors. Browser identity persists; aborted requests cannot update the hook. A documented command initializes the optional table. |
| Tooling lacked active validation | Restored ESLint, added route/type checks and focused regressions, and documented build, registry, MCP, database, and combined check commands. |

## Framework compatibility and search

An initial production build exposed an upstream Nextra 4.6.1 issue: its layout removes `children` before validating a schema that newer Zod versions treat as requiring the missing key.

Scoped **Zod 4.3.6** overrides are installed for Nextra and its docs theme. A minimal runtime reproduction fails with Zod 4.5.4 and succeeds with 4.3.6. This workaround does not patch `node_modules`; remove it after upgrading to a Nextra release containing [the upstream fix](https://github.com/shuding/nextra/pull/4990). The invalid `lastUpdated` override was removed in favor of Nextra's supported default.

Nextra 4 search uses Pagefind. The `postbuild` command indexes `.next/server/app` into `public/_pagefind`; generated search files are ignored by Git. The final build indexed 56 documentation pages, and browser search returned relevant component and section results.

## Final verification

| Check | Observed result |
| --- | --- |
| Tooling and visitor API regressions | **10 passed**: dependency packaging, catalog synchronization, unsafe names, MCP URI rejection, visitor identity, request validation, and storage failures |
| Component interaction regressions | **26 passed**: copying/source retrieval, link semantics, dialog/dock keyboard activation, file input, OTP isolation, submission recovery, modal focus, video controls, carousel editing/subscription cleanup, and smooth-scroll lifecycle |
| Full ESLint | **0 errors, 6 warnings**; remaining advisories concern native images in reusable image effects accepting caller-provided URLs |
| TypeScript and production build | Passed; **66 static pages generated**, followed by successful Pagefind indexing |
| Registry generation | Generated 113 entries with companion CSS and transitive source files |
| Documentation video scan | No raw `<video>` blocks remain in `src/content` |
| `npm run check` | Passed: lint, generated route types, TypeScript, all tests, registry generation, production build, and postbuild search index |
| HTTP smoke checks | Main routes, representative docs, registry, and search assets returned 200; unknown docs returned 404; unconfigured visitor API returned 503 |
| Browser checks | Desktop home, home search keyboard navigation, docs full-text search, mobile menu, catalog pagination, one command dialog, light/system theme switching, video pause, and same-origin source copying worked. Inspected home at 320px and catalog/docs at 390px; no catalog horizontal overflow. |

The **36 passing regressions** exercise selected failures and interactions. They do not constitute a complete accessibility, visual, performance, or every-component acceptance audit. Visitor tests use injected stores and make no database calls.

## Remaining limitations

- Registry files support text content. SVGs are included; binary demo media uses the canonical public host. Consumers need network access for these defaults or must supply their own media. Live CDN availability and a complete fresh-consumer installation have not been verified.
- Components that call application APIs declare those endpoint requirements in their manifests. Installing UI does not provision a backend.
- No measured contrast, Core Web Vitals, screen-reader audit, screenshot fidelity, or exhaustive GPU/audio lifecycle result is claimed.
- Handwritten examples are corrected where reviewed, but every code string has not been compiled inside an independent consumer application.
- The scoped Zod override remains a maintenance item until the upstream Nextra fix is published and verified here.

Nextra emits Git timestamp warnings for newly moved, uncommitted content files; these do not prevent the build. No deployment or live database migration was performed.

## Visitor database and Vercel Analytics removal

Updated 2026-10-18. The site no longer uses a database. The Neon visitor counter (`/api/visitors`, its hook, browser identity helper, `visitor-count` block, `db:init` script, and tests) and Vercel Analytics were removed, along with the `@neondatabase/serverless` and `@vercel/analytics` packages. Tracwell remains the only analytics, covering page views and copy events. The Terms of Service privacy section no longer describes a visitor count. Rows above that mention the visitor API or database describe earlier work.

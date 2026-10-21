import fs from 'node:fs';
import path from 'node:path';
import { isBuiltin } from 'node:module';
import ts from 'typescript';

export const REGISTRY_ORIGIN = 'https://www.obsidianui.dev';
export const COMPONENT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type FileType = 'registry:ui' | 'registry:block' | 'registry:hook' | 'registry:lib' | 'registry:file';
export interface RegistryFile { path: string; target: string; type: FileType; content: string }
export interface RegistryItem {
    $schema: string;
    name: string;
    type: FileType;
    title?: string;
    description?: string;
    dependencies: string[];
    files: RegistryFile[];
    docs?: string;
    meta?: { remoteAssets?: string[]; requiredEndpoints?: string[] };
}
export interface Registry { $schema: string; name: string; homepage: string; items: RegistryItem[] }
const slash = (value: string) => value.split(path.sep).join('/');

/**
 * Source-relative paths (from `src/`) that must never be bundled into registry
 * items. These are runtime-only server helpers; installing them via the shadcn
 * registry would pull in environment secrets or out-of-tree imports.
 *
 * If a block component accidentally imports one of these, registry.ts emits a
 * clear error rather than silently packaging a broken or leaking file.
 */
export const REGISTRY_EXCLUDE = new Set([
    'lib/r2.ts',
    'lib/r2-manifest.json',
]);

export function isWithin(directory: string, filename: string): boolean {
    const relative = path.relative(directory, filename);
    return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
}

function walk(directory: string): string[] {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const filename = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) throw new Error(`Registry sources cannot be symlinks: ${filename}`);
        return entry.isDirectory() ? walk(filename) : [filename];
    }).sort();
}

function resolveSource(sourceRoot: string, importer: string, specifier: string): string {
    const base = specifier.startsWith('@/') ? path.resolve(sourceRoot, specifier.slice(2)) : path.resolve(path.dirname(importer), specifier);
    const candidates = [base, ...['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].map(ext => base + ext),
        ...['.ts', '.tsx', '.js', '.jsx'].map(ext => path.join(base, `index${ext}`))];
    const filename = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!filename || !isWithin(sourceRoot, fs.realpathSync(filename))) throw new Error(`Cannot package local import ${specifier} in ${importer}`);
    if (!/\.(?:tsx?|jsx?|css|json|svg)$/.test(filename)) throw new Error(`Unsupported imported asset ${filename}; use a public asset URL`);
    return filename;
}

function describeFile(sourceRoot: string, filename: string): Omit<RegistryFile, 'content'> {
    const relative = slash(path.relative(sourceRoot, filename));
    const groups: [string, string, FileType][] = [
        ['components/ui/', '@ui/', 'registry:ui'], ['components/block/', '@components/block/', 'registry:block'],
        ['components/', '@components/', 'registry:block'], ['hooks/', '@hooks/', 'registry:hook'], ['lib/', '@lib/', 'registry:lib'],
    ];
    const group = groups.find(([prefix]) => relative.startsWith(prefix));
    if (!group) throw new Error(`Registry import needs an explicit installation target: ${relative}`);
    return { path: relative, target: group[1] + relative.slice(group[0].length), type: /\.(?:css|svg|json)$/.test(filename) ? 'registry:file' : group[2] };
}

/**
 * A component's optional guide: `<name>/<name>.mdx` beside its entrypoint, written as plain
 * Markdown under `title` and `description` front matter. It is not a documentation page; it
 * travels with the registry item so CLI and MCP clients can read it.
 */
function readGuide(entrypoint: string, name: string): { title?: string; description?: string; body: string } | undefined {
    const filename = path.join(path.dirname(entrypoint), name, `${name}.mdx`);
    if (!fs.existsSync(filename)) return undefined;
    const source = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');
    const frontMatter = /^---\n([\s\S]*?)\n---\n/.exec(source);
    const field = (key: string) => {
        const value = frontMatter && new RegExp(`^${key}:[ \\t]*(.+)$`, 'm').exec(frontMatter[1])?.[1].trim();
        return value ? value.replace(/^(["'])(.*)\1$/, '$2') : undefined;
    };
    return { title: field('title'), description: field('description'), body: source.slice(frontMatter?.[0].length ?? 0).trim() };
}

/** Build in memory first: broken imports must not leave partially generated manifests. */
export function buildRegistry(projectRoot: string, origin = REGISTRY_ORIGIN): Registry {
    const sourceRoot = path.resolve(projectRoot, 'src');
    const publicRoot = path.resolve(projectRoot, 'public');
    // Components are the top-level files; a folder named after one holds its private helpers.
    const entrypoints = ['ui', 'block'].flatMap(folder => {
        const directory = path.join(sourceRoot, 'components', folder);
        return walk(directory).filter(filename => path.dirname(filename) === directory);
    }).filter(filename => /\.[jt]sx$/.test(filename));
    const names = new Set<string>();
    const items = entrypoints.map(entrypoint => {
        const name = path.basename(entrypoint, path.extname(entrypoint));
        if (!COMPONENT_NAME.test(name) || ['index', 'registry'].includes(name) || names.has(name)) throw new Error(`Invalid or duplicate registry name: ${name}`);
        names.add(name);
        const files = new Map<string, RegistryFile>();
        const dependencies = new Set<string>();
        const remoteAssets = new Set<string>();
        const requiredEndpoints = new Set<string>();
        const assetUrl = (url: string): string => {
            if (!url.startsWith('/') || url.startsWith('//')) return url;
            const asset = path.resolve(publicRoot, '.' + url.split(/[?#]/)[0]);
            if (!isWithin(publicRoot, asset) || !fs.existsSync(asset) || !fs.statSync(asset).isFile()) return url;
            if (!isWithin(publicRoot, fs.realpathSync(asset))) throw new Error(`Public asset escapes registry root: ${url}`);
            if (path.extname(asset) === '.svg') {
                const target = 'public/' + slash(path.relative(publicRoot, asset));
                files.set(asset, { path: target, target, type: 'registry:file', content: fs.readFileSync(asset, 'utf8') });
                return url;
            }
            // Registry payloads are text-only. Binary demo media remains on the public host.
            const remote = new URL(url, origin).href;
            remoteAssets.add(remote);
            return remote;
        };
        const visit = (filename: string) => {
            if (files.has(filename)) return;
            const relPath = slash(path.relative(sourceRoot, filename));
            if (REGISTRY_EXCLUDE.has(relPath)) {
                throw new Error(
                    `Registry component imports a runtime-only module that cannot be installed: "${relPath}".\n` +
                    `Use a direct CDN URL for default prop values instead of importing @/lib/r2 in block/ui components.`
                );
            }
            let content = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');
            const file = { ...describeFile(sourceRoot, filename), content };
            files.set(filename, file); // Mark before following cyclic imports.
            const imports = new Set<string>();
            if (filename.endsWith('.css')) {
                for (const match of content.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) imports.add(match[1]);
                for (const match of content.matchAll(/url\(\s*["']?(\.[^)"']+)/g)) imports.add(match[1].trim());
                content = content.replace(/url\(\s*(["']?)(\/[^)"']+)\1\s*\)/g, (_, quote: string, url: string) => `url(${quote}${assetUrl(url)}${quote})`);
            } else if (/\.[jt]sx?$/.test(filename)) {
                const ast = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
                const edits: { start: number; end: number; value: string }[] = [];
                const inspect = (node: ts.Node) => {
                    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.add(node.moduleSpecifier.text);
                    if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteralLike(node.arguments[0])) {
                        const argument = node.arguments[0].text;
                        if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) imports.add(argument);
                        if (ts.isIdentifier(node.expression) && node.expression.text === 'fetch' && argument.startsWith('/api/')) requiredEndpoints.add(argument);
                    }
                    if (ts.isStringLiteralLike(node)) {
                        if (/^https:\/\/cdn-new\.obsidianui\.dev\/.*\.(?:png|jpe?g|webp|gif|glb)(?:[?#].*)?$/.test(node.text)) remoteAssets.add(node.text);
                        const rewritten = assetUrl(node.text);
                        if (rewritten !== node.text) edits.push({ start: node.getStart(ast) + 1, end: node.getEnd() - 1, value: rewritten });
                    }
                    if (ts.isTemplateExpression(node) && node.head.text.startsWith('/') && /\.(?:png|jpe?g|webp|gif|mp[34]|woff2?)$/.test(node.templateSpans.at(-1)?.literal.text ?? '')) {
                        const prefixDirectory = path.resolve(publicRoot, '.' + path.posix.dirname(node.head.text));
                        if (isWithin(publicRoot, prefixDirectory) && fs.existsSync(prefixDirectory)) {
                            edits.push({ start: node.head.getStart(ast) + 1, end: node.head.getEnd() - 2, value: origin + node.head.text });
                            remoteAssets.add(origin + node.head.text + '*' + node.templateSpans.at(-1)!.literal.text);
                        }
                    }
                    ts.forEachChild(node, inspect);
                };
                inspect(ast);
                for (const edit of edits.sort((a, b) => b.start - a.start)) content = content.slice(0, edit.start) + edit.value + content.slice(edit.end);
            }
            file.content = content;
            for (const specifier of imports) {
                if (specifier.startsWith('@/') || specifier.startsWith('.')) visit(resolveSource(sourceRoot, filename, specifier));
                else if (!isBuiltin(specifier) && !/^(?:https?:|data:)/.test(specifier)) {
                    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
                    if (!['react', 'react-dom', 'next'].includes(packageName)) dependencies.add(packageName);
                }
            }
        };
        visit(entrypoint);
        const guide = readGuide(entrypoint, name);
        const notes = guide?.body ? [guide.body] : [];
        if (remoteAssets.size) notes.push('Default demo media loads from ObsidianUI. Replace these URLs with your own assets for offline use.');
        if (requiredEndpoints.size) notes.push(`Provide these application API endpoints before using this component: ${[...requiredEndpoints].join(', ')}.`);
        return {
            $schema: 'https://ui.shadcn.com/schema/registry-item.json', name, type: describeFile(sourceRoot, entrypoint).type,
            ...(guide?.title ? { title: guide.title } : {}), ...(guide?.description ? { description: guide.description } : {}),
            dependencies: [...dependencies].sort(), files: [...files.values()].sort((a, b) => a.path.localeCompare(b.path)),
            ...(notes.length ? { docs: notes.join('\n\n') } : {}),
            ...(remoteAssets.size || requiredEndpoints.size ? { meta: {
                ...(remoteAssets.size ? { remoteAssets: [...remoteAssets].sort() } : {}),
                ...(requiredEndpoints.size ? { requiredEndpoints: [...requiredEndpoints].sort() } : {}),
            } } : {}),
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'obsidian-ui', homepage: origin, items };
}

export function writeRegistry(projectRoot: string, registry: Registry): void {
    const names = registry.items.map(item => item.name);
    if (new Set(names).size !== names.length || names.some(name => !COMPONENT_NAME.test(name) || ['index', 'registry'].includes(name))) {
        throw new Error('Invalid or duplicate registry output names');
    }
    const directory = path.resolve(projectRoot, 'public', 'r');
    fs.mkdirSync(directory, { recursive: true });
    if (!isWithin(fs.realpathSync(projectRoot), fs.realpathSync(directory))) throw new Error('Registry output escapes project root');
    const expected = new Set(['index.json', 'registry.json', ...registry.items.map(item => `${item.name}.json`)]);
    for (const name of expected) {
        const filename = path.join(directory, name);
        const existing = fs.lstatSync(filename, { throwIfNoEntry: false });
        if (existing && (!existing.isFile() || existing.isSymbolicLink())) {
            throw new Error(`Registry output must be a regular file: ${filename}`);
        }
    }
    for (const item of registry.items) fs.writeFileSync(path.join(directory, `${item.name}.json`), JSON.stringify(item, null, 2) + '\n');
    for (const name of ['index.json', 'registry.json']) fs.writeFileSync(path.join(directory, name), JSON.stringify(registry, null, 2) + '\n');
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.json') && !expected.has(entry.name)) fs.unlinkSync(path.join(directory, entry.name));
    }
}

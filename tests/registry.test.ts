import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, type TestContext } from 'node:test';
import { buildRegistry, writeRegistry } from '../scripts/registry';

function fixture(t: TestContext) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-registry-test-'));
    t.after(() => {
        if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('obsidian-registry-test-')) throw new Error('Unexpected test directory');
        fs.rmSync(root, { recursive: true, force: true });
    });
    const put = (filename: string, content: string) => {
        const target = path.join(root, filename);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    };
    return { root, put };
}

test('fresh block installation contains transitive primitives, hooks, utilities, styles, and package roots', t => {
    const { root, put } = fixture(t);
    put('src/components/block/demo.tsx', `import { Button } from '@/components/ui/button';
import { useDemo } from '@/hooks/use-demo';
import './demo.css';
export const load = () => import('gsap/ScrollTrigger');
export const Demo = () => <Button>{useDemo()}</Button>;`);
    put('src/components/block/demo.css', '@import "./base.css"; .demo { background: url("/icon.svg"); }');
    put('src/components/block/base.css', '.demo { color: red; }');
    put('src/components/ui/button.tsx', `import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; export const Button = () => null;`);
    put('src/hooks/use-demo.ts', `import { useState } from 'react'; import { cn } from '@/lib/utils'; export const useDemo = () => '';`);
    put('src/lib/utils.ts', `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export const cn = () => '';`);
    put('public/icon.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const registry = buildRegistry(root);
    const item = registry.items.find(item => item.name === 'demo')!;
    assert.equal(fs.existsSync(path.join(root, 'public/r')), false, 'building in memory must not write manifests');
    assert.equal(item.type, 'registry:block');
    assert.deepEqual(item.dependencies, ['class-variance-authority', 'clsx', 'gsap', 'tailwind-merge']);
    assert.deepEqual(item.files.map(file => file.target).sort(), [
        '@components/block/base.css', '@components/block/demo.css', '@components/block/demo.tsx', '@hooks/use-demo.ts', '@lib/utils.ts', '@ui/button.tsx', 'public/icon.svg',
    ].sort());
});

test('generation rejects missing local imports and duplicate public component names', t => {
    const { root, put } = fixture(t);
    put('src/components/ui/demo.tsx', `import './missing.css'; export const Demo = () => null;`);
    assert.throws(() => buildRegistry(root), /Cannot package local import/);
    put('src/components/ui/demo.tsx', 'export const Demo = () => null;');
    put('src/components/block/demo.tsx', 'export const Demo = () => null;');
    assert.throws(() => buildRegistry(root), /duplicate registry name/);
});

test('JSX effects package JavaScript helpers and reject names shared with TSX components', t => {
    const { root, put } = fixture(t);
    put('src/components/block/effect.jsx', `import { texture } from '@/lib/texture'; import { gsap } from 'gsap'; export const Effect = () => <div>{texture}</div>;`);
    put('src/lib/texture.js', 'export const texture = "data:image/png;base64,example";');
    const registry = buildRegistry(root);
    assert.deepEqual(registry.items.map(item => item.name), ['effect']);
    assert.deepEqual(registry.items[0].dependencies, ['gsap']);
    assert.deepEqual(registry.items[0].files.map(file => file.target), ['@components/block/effect.jsx', '@lib/texture.js']);
    put('src/components/block/effect.tsx', 'export const Effect = () => null;');
    assert.throws(() => buildRegistry(root), /duplicate registry name/);
});

test('a helper folder stays inside its component and its guide becomes the item title, description, and docs', t => {
    const { root, put } = fixture(t);
    put('src/components/block/scene-page.tsx', `import { Scene } from './scene-page/scene'; import './scene-page/scene-page.css'; export const ScenePage = () => <Scene />;`);
    put('src/components/block/scene-page/scene.tsx', `import model from './model.json'; export const Scene = () => <svg data-size={model.size} />;`);
    put('src/components/block/scene-page/model.json', '{ "size": 4 }');
    put('src/components/block/scene-page/scene-page.css', '.scene-page { height: 100dvh; }');
    put('src/components/block/scene-page/scene-page.mdx', '---\r\ntitle: Scene Page\r\ndescription: "A page with a scene."\r\n---\r\n\r\n# Scene Page\r\n\r\nUse it on a not-found route.\r\n');
    const registry = buildRegistry(root);
    assert.deepEqual(registry.items.map(item => item.name), ['scene-page']);
    const [item] = registry.items;
    assert.equal(item.title, 'Scene Page');
    assert.equal(item.description, 'A page with a scene.');
    assert.equal(item.docs, '# Scene Page\n\nUse it on a not-found route.');
    assert.equal(item.meta, undefined);
    assert.deepEqual(item.files.map(file => file.target).sort(), [
        '@components/block/scene-page.tsx', '@components/block/scene-page/model.json', '@components/block/scene-page/scene-page.css', '@components/block/scene-page/scene.tsx',
    ]);
});

test('binary demo media gets explicit hosted URLs and backend requirements are documented', t => {
    const { root, put } = fixture(t);
    put('src/components/block/demo.tsx', `const image = '/demo.png'; fetch('/api/demo'); export default image;`);
    put('public/demo.png', 'binary-fixture');
    const item = buildRegistry(root).items[0];
    assert.match(item.files[0].content, /https:\/\/www\.obsidianui\.dev\/demo\.png/);
    assert.deepEqual(item.meta?.requiredEndpoints, ['/api/demo']);
    assert.ok(item.docs?.includes('offline'));
});

test('writing synchronizes both standard catalogs and removes only obsolete JSON manifests', t => {
    const { root, put } = fixture(t);
    put('src/components/ui/demo.tsx', 'export const Demo = () => null;');
    put('public/r/obsolete.json', '{}');
    put('public/r/README.md', 'keep');
    writeRegistry(root, buildRegistry(root));
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'public/r/index.json'), 'utf8'));
    assert.equal(catalog.name, 'obsidian-ui');
    assert.deepEqual(catalog.items.map((item: { name: string }) => item.name), ['demo']);
    assert.equal(fs.existsSync(path.join(root, 'public/r/obsolete.json')), false);
    assert.equal(fs.readFileSync(path.join(root, 'public/r/README.md'), 'utf8'), 'keep');
    assert.equal(fs.readFileSync(path.join(root, 'public/r/registry.json'), 'utf8'), fs.readFileSync(path.join(root, 'public/r/index.json'), 'utf8'));
});

test('writing rejects unsafe output names before changing the registry', t => {
    const { root, put } = fixture(t);
    put('src/components/ui/demo.tsx', 'export const Demo = () => null;');
    const registry = buildRegistry(root);
    registry.items[0].name = '../../package';
    assert.throws(() => writeRegistry(root, registry), /Invalid or duplicate registry output names/);
    assert.equal(fs.existsSync(path.join(root, 'public/r')), false);
});

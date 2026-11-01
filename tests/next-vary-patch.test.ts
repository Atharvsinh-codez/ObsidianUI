import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { patchNextVary, patchVaryTemplate, PATCH_TARGETS } from "../scripts/patch-next-vary.mjs";

const template = [
  "const varyHeader = routeModule.getVaryHeader(resolvedPathname, interceptionRoutePatterns);",
  "            res.setHeader('Vary', varyHeader);",
].join("\n");

test("compatibility patch merges Vary tokens without adding application-specific fields", () => {
  const { source } = patchVaryTemplate(template);
  const run = new Function("res", "routeModule", "resolvedPathname", "interceptionRoutePatterns", source);
  const frameworkVary = "rsc, next-router-state-tree, next-router-prefetch";
  for (const [existing, expected] of [
    [undefined, frameworkVary],
    ["Accept, Accept-Encoding", `Accept, Accept-Encoding, ${frameworkVary}`],
    ["Accept, RSC, accept", "Accept, RSC, next-router-state-tree, next-router-prefetch"],
    [["Accept", "Accept-Encoding", "RSC"], "Accept, Accept-Encoding, RSC, next-router-state-tree, next-router-prefetch"],
    ["*", "*"],
  ]) {
    let result: unknown;
    run({ getHeader: () => existing, setHeader: (_key: string, value: unknown) => { result = value; } }, { getVaryHeader: () => frameworkVary }, "/", []);
    assert.equal(result, expected);
  }
});

test("template patch is idempotent, retains newline format, and rejects unknown changes", () => {
  for (const newline of ["\n", "\r\n"]) {
    const input = template.replaceAll("\n", newline);
    const patched = patchVaryTemplate(input);
    assert.equal(patched.changed, true);
    assert.deepEqual(patchVaryTemplate(patched.source), { source: patched.source, changed: false });
    if (newline === "\r\n") assert.equal(patched.source.replaceAll("\r\n", "").includes("\n"), false);
  }
  for (const invalid of ["unexpected template", template + template, template.replace("res.setHeader", "res.appendHeader")]) {
    assert.throws(() => patchVaryTemplate(invalid), /template changed/);
  }
});

test("installer version-checks and validates both files before any write", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "obsidian-next-vary-"));
  try {
    const packageFile = path.join(directory, "package.json");
    const writeVersion = (version: string) => writeFileSync(packageFile, JSON.stringify({ name: "next", version }));
    for (const relative of PATCH_TARGETS) {
      const filename = path.join(directory, relative);
      mkdirSync(path.dirname(filename), { recursive: true });
      writeFileSync(filename, template);
    }
    writeVersion("16.4.4");
    assert.throws(() => patchNextVary(directory), /supports Next 16\.4\.3 only/);
    writeVersion("16.4.3");
    writeFileSync(path.join(directory, PATCH_TARGETS[1]), "changed upstream");
    assert.throws(() => patchNextVary(directory), /template changed/);
    assert.equal(readFileSync(path.join(directory, PATCH_TARGETS[0]), "utf8"), template);
    writeFileSync(path.join(directory, PATCH_TARGETS[1]), template);
    assert.equal(patchNextVary(directory), 2);
    assert.equal(patchNextVary(directory), 0);
  } finally {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("obsidian-next-vary-"));
    rmSync(resolved, { recursive: true, force: true });
  }
});

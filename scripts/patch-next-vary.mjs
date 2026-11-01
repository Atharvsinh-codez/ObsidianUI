import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SUPPORTED_NEXT_VERSION = "16.4.3";
export const PATCH_TARGETS = [
  "dist/build/templates/app-page-runtime.js",
  "dist/esm/build/templates/app-page-runtime.js",
];

const originalBlock = [
  "const varyHeader = routeModule.getVaryHeader(resolvedPathname, interceptionRoutePatterns);",
  "            res.setHeader('Vary', varyHeader);",
].join("\n");
const patchedBlock = [
  "const varyHeader = routeModule.getVaryHeader(resolvedPathname, interceptionRoutePatterns);",
  "            // ObsidianUI compatibility: preserve upstream Vary in Next 16.4.3.",
  "            const existingVary = res.getHeader('Vary');",
  "            const varyTokens = [...(Array.isArray(existingVary) ? existingVary : [existingVary]), varyHeader]",
  "                .filter((value) => value != null)",
  "                .flatMap((value) => String(value).split(','))",
  "                .map((value) => value.trim())",
  "                .filter(Boolean);",
  "            const seenVary = new Set();",
  "            const mergedVary = varyTokens.filter((value) => {",
  "                const key = value.toLowerCase();",
  "                if (seenVary.has(key)) return false;",
  "                seenVary.add(key);",
  "                return true;",
  "            });",
  "            res.setHeader('Vary', mergedVary.includes('*') ? '*' : mergedVary.join(', '));",
].join("\n");

/** Fail closed if the installed template differs from the inspected release. */
export function patchVaryTemplate(source) {
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const original = originalBlock.replaceAll("\n", newline);
  const patched = patchedBlock.replaceAll("\n", newline);
  const count = (needle) => source.split(needle).length - 1;
  if (count(patched) === 1 && count(original) === 0) return { source, changed: false };
  if (count(original) !== 1 || source.includes("ObsidianUI compatibility:")) {
    throw new Error("Next App Page Vary template changed; inspect the installed Next version before updating this compatibility patch.");
  }
  return { source: source.replace(original, patched), changed: true };
}

/** Validate both distributions before writing either, making repeat installs safe. */
export function patchNextVary(nextDirectory) {
  const directory = path.resolve(nextDirectory);
  const metadata = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
  if (metadata.name !== "next" || metadata.version !== SUPPORTED_NEXT_VERSION) {
    throw new Error(`Vary compatibility patch supports Next ${SUPPORTED_NEXT_VERSION} only; found ${metadata.name}@${metadata.version}. Review the patch before upgrading Next.`);
  }
  const targets = PATCH_TARGETS.map(relative => {
    const filename = path.join(directory, relative);
    return { filename, ...patchVaryTemplate(readFileSync(filename, "utf8")) };
  });
  for (const target of targets) {
    if (target.changed) writeFileSync(target.filename, target.source, "utf8");
  }
  return targets.filter(target => target.changed).length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const require = createRequire(import.meta.url);
    const nextDirectory = path.dirname(require.resolve("next/package.json"));
    const changed = patchNextVary(nextDirectory);
    console.log(`Next ${SUPPORTED_NEXT_VERSION} Vary compatibility: ${changed ? `patched ${changed} templates` : "already applied"}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

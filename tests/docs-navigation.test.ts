import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";
import { componentLinks } from "../src/components/site/component-links";
import navigation, { documentationEntries } from "../src/content/_meta";

const installationSlugs = ["installation", "install-tailwind", "add-utilities", "cli"];
const entries = documentationEntries;

test("sidebar groups every published documentation file once and keeps installation first", async () => {
  const files = (await readdir(new URL("../src/content/", import.meta.url)))
    .filter(file => file.endsWith(".mdx") && file !== "index.mdx")
    .map(file => file.slice(0, -4));
  const published = entries.filter(([, entry]) => typeof entry === "string").map(([slug]) => slug);
  const groups = new Map<string, string[]>();
  let currentGroup: string | undefined;

  for (const [slug, entry] of entries) {
    if (typeof entry === "object" && entry.type === "separator") {
      assert.ok(!groups.has(entry.title), `Duplicate group: ${entry.title}`);
      currentGroup = entry.title;
      groups.set(currentGroup, []);
    } else if (typeof entry === "string") {
      assert.ok(currentGroup, `${slug} must belong to a section`);
      groups.get(currentGroup)!.push(slug);
    }
  }

  assert.deepEqual(published.toSorted(), files.toSorted());
  assert.equal(new Set(published).size, published.length);
  assert.equal(groups.keys().next().value, "Installation");
  assert.deepEqual(groups.get("Installation"), installationSlugs);
  assert.equal(navigation.index.display, "hidden");
  for (const [title, slugs] of groups) assert.ok(slugs.length > 0, `${title} must not be empty`);

  const expectedCategories: Record<string, string> = {
    "active-sessions": "Components",
    "analytics-dashboard": "Blocks",
    "dashboard-shell": "Blocks",
    "status-bars": "Components",
    "hover-img": "Components",
    "split-showcase": "Components",
    "text-stream": "Components",
    "draggable-marquee": "Components",
  };
  for (const [slug, group] of Object.entries(expectedCategories)) {
    assert.ok(groups.get(group)?.includes(slug), `${slug} belongs in ${group}`);
  }
});

test("component search includes all sections alphabetically without setup pages or headings", () => {
  const expected = entries
    .filter(([slug, entry]) => typeof entry === "string" && !installationSlugs.includes(slug))
    .map(([slug, name]) => ({ name, href: `/docs/${slug}` }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  assert.deepEqual(componentLinks, expected);
  assert.equal(new Set(componentLinks.map(link => link.href)).size, componentLinks.length);
  assert.deepEqual(componentLinks.slice(0, 5).map(link => link.name), [
    "Active Sessions", "Analytics Dashboard", "Art Gallery", "Dashboard Shell", "Discover Button",
  ]);
  for (const slug of [...installationSlugs, "missing-page", "index", "---1", "---2"]) {
    assert.ok(!componentLinks.some(link => link.href === `/docs/${slug}`));
  }
});

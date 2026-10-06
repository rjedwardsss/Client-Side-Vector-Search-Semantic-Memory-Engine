import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MemoryStore } from "./engine.js";

type FixtureDoc = {
  id: string;
  text: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const fixturesPath = resolve(here, "..", "fixtures", "docs.json");

async function main() {
  const docs = JSON.parse(await readFile(fixturesPath, "utf8")) as FixtureDoc[];
  const store = new MemoryStore();
  for (const doc of docs) {
    store.add(doc.text, doc.id);
  }

  const query =
    process.argv.slice(2).join(" ").trim() ||
    "local browser search over notes";
  const results = store.query(query, 4);

  console.log(`Query: ${query}`);
  console.log(`Loaded memories: ${store.all().length}`);
  console.log("Top results:");
  for (const [index, result] of results.entries()) {
    console.log(
      `${index + 1}. ${result.id} (${result.score.toFixed(3)}) ${result.text}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { makeArtifacts, root } from "./registry";
const outputs = await makeArtifacts();
for (const [file, expected] of outputs) {
  const actual = await readFile(path.join(root, file), "utf8").catch(() => "");
  if (actual !== expected)
    throw new Error(`${file} is stale. Run npm run registry:build.`);
}
for (const file of await readdir(path.join(root, "public/r"))) {
  if (file.endsWith(".json") && !outputs.has(`public/r/${file}`))
    throw new Error(`Orphan registry item: ${file}`);
}
console.log("Catalog, demos and registry payloads are in sync.");

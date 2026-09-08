import { mkdir, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { makeArtifacts, root } from "./registry";
const outputs = await makeArtifacts();
for (const [file, content] of outputs) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), content);
}
for (const file of await readdir(path.join(root, "public/r"))) {
  if (file.endsWith(".json") && !outputs.has(`public/r/${file}`))
    await unlink(path.join(root, "public/r", file));
}
console.log(`Built ${outputs.size - 4} installable components.`);

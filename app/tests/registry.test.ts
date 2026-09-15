import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { collectFiles, makeArtifacts } from "../scripts/registry";
import { scaffold } from "../scripts/new-component";

async function fixture(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(path.join(tmpdir(), "jungui-registry-"));
  try {
    for (const folder of [
      "components/ui",
      "components/demos",
      "lib",
      "registry/items",
    ])
      await mkdir(path.join(directory, folder), { recursive: true });
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
test("an item carries transitive helpers, styles and npm dependencies", async () =>
  fixture(async (dir) => {
    await writeFile(
      path.join(dir, "components/ui/sample.tsx"),
      'import "./sample.css"; import { value } from "@/lib/helper"; export { value };',
    );
    await writeFile(
      path.join(dir, "components/ui/sample.css"),
      ".sample{color:red}",
    );
    await writeFile(
      path.join(dir, "lib/helper.ts"),
      'import { clsx } from "clsx"; export const value = clsx("sample");',
    );
    const result = await collectFiles("components/ui/sample.tsx", dir);
    assert.deepEqual(result.files, [
      "components/ui/sample.css",
      "components/ui/sample.tsx",
      "lib/helper.ts",
    ]);
    assert.deepEqual(result.dependencies, ["clsx"]);
  }));
test("site dependencies and missing files fail before publication", async () =>
  fixture(async (dir) => {
    await writeFile(
      path.join(dir, "components/demos/demo.tsx"),
      "export const Demo = 1;",
    );
    await writeFile(
      path.join(dir, "components/ui/sample.tsx"),
      'import { Demo } from "../demos/demo";',
    );
    await assert.rejects(
      collectFiles("components/ui/sample.tsx", dir),
      /site-only/,
    );
    await writeFile(
      path.join(dir, "components/ui/sample.tsx"),
      'import "./missing.css";',
    );
    await assert.rejects(
      collectFiles("components/ui/sample.tsx", dir),
      /unresolved import/,
    );
    await writeFile(
      path.join(dir, "components/ui/sample.tsx"),
      'import Link from "next/link";',
    );
    await assert.rejects(
      collectFiles("components/ui/sample.tsx", dir),
      /outside Next/,
    );
  }));
test("generated components enter catalog, demo loader and install registry together", async () =>
  fixture(async (dir) => {
    for (const [file, content] of scaffold("kinetic-label", "动态标签", "text"))
      await writeFile(path.join(dir, file), content);
    await writeFile(
      path.join(dir, "lib/utils.ts"),
      'export const cn = (...values: unknown[]) => values.filter(Boolean).join(" ");',
    );
    await writeFile(path.join(dir, "package.json"), '{"dependencies":{}}');
    const artifacts = await makeArtifacts(dir);
    const payload = JSON.parse(artifacts.get("public/r/kinetic-label.json")!);
    assert.equal(payload.name, "kinetic-label");
    assert.ok(
      payload.files.some(
        (file: { target: string }) => file.target === "@ui/kinetic-label.css",
      ),
    );
    assert.ok(
      payload.files.some(
        (file: { target: string }) => file.target === "@lib/utils.ts",
      ),
    );
    assert.match(
      artifacts.get("components/demos/index.generated.ts")!,
      /kinetic-label/,
    );
    assert.equal(
      JSON.parse(artifacts.get("lib/catalog.generated.json")!)[0].title,
      "动态标签",
    );
    await rm(path.join(dir, "components/demos/kinetic-label.tsx"));
    await assert.rejects(makeArtifacts(dir), /demo is required/);
  }));
test("source URLs do not silently depend on the original site's public folder", async () =>
  fixture(async (dir) => {
    await writeFile(
      path.join(dir, "components/ui/sample.css"),
      ".sample{background:url(/assets/missing.png)}",
    );
    await assert.rejects(
      collectFiles("components/ui/sample.css", dir),
      /root-relative asset/,
    );
  }));
test("scaffold rejects invalid paths", () => {
  assert.throws(() => scaffold("../oops", "Oops"), /kebab-case/);
  assert.throws(() => scaffold("Bad Name", "Oops"), /kebab-case/);
});

test("published items include declared types for imported JS packages only", async () =>
  fixture(async (dir) => {
    for (const [file, content] of scaffold("typed-effect", "Effect", "feedback"))
      await writeFile(path.join(dir, file), content);
    await writeFile(path.join(dir, "components/ui/typed-effect.tsx"), 'import confetti from "canvas-confetti"; export const TypedEffect = () => confetti();');
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ dependencies: { "canvas-confetti": "1.9.4", "@types/canvas-confetti": "1.9.0", "@types/unused": "1.0.0" } }));
    const artifacts = await makeArtifacts(dir);
    const payload = JSON.parse(artifacts.get("public/r/typed-effect.json")!);
    assert.deepEqual(payload.dependencies, ["@types/canvas-confetti@1.9.0", "canvas-confetti@1.9.4"]);
  }));

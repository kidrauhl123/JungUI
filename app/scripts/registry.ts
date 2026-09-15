import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { registryItemSchema } from "shadcn/schema";
import type { ComponentDefinition, CatalogItem } from "../lib/catalog-types";

export const root = path.resolve(import.meta.dirname, "..");
export async function readDefinitions(
  base = root,
): Promise<ComponentDefinition[]> {
  const files = (await readdir(path.join(base, "registry/items")))
    .filter((name) => name.endsWith(".json"))
    .sort();
  const items: ComponentDefinition[] = [];
  for (const file of files) {
    const item = JSON.parse(
      await readFile(path.join(base, "registry/items", file), "utf8"),
    ) as ComponentDefinition;
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(item.name) ||
      file !== `${item.name}.json`
    )
      throw new Error(`Invalid component name: ${file}`);
    for (const key of [
      "title",
      "english",
      "description",
      "interaction",
      "usage",
      "entry",
    ] as const) {
      if (typeof item[key] !== "string" || !item[key].trim())
        throw new Error(`${item.name}: missing ${key}`);
    }
    if (
      !["display", "text", "backgrounds", "inputs", "feedback"].includes(
        item.category,
      )
    )
      throw new Error(`${item.name}: invalid category`);
    if (
      !Array.isArray(item.props) ||
      !Array.isArray(item.credits) ||
      !Number.isFinite(item.order)
    )
      throw new Error(`${item.name}: missing props, credits or order`);
    if (item.previewMode && !["inline", "page"].includes(item.previewMode))
      throw new Error(`${item.name}: invalid preview mode`);
    for (const prop of item.props)
      if (!prop.name || !prop.type || !prop.description)
        throw new Error(`${item.name}: incomplete prop documentation`);
    await stat(path.join(base, `components/demos/${item.name}.tsx`)).catch(
      () => {
        throw new Error(`${item.name}: demo is required`);
      },
    );
    items.push(item);
  }
  return items.sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );
}
export async function collectFiles(entry: string, base = root) {
  const seen = new Set<string>();
  const packages = new Set<string>();
  async function visit(file: string) {
    file = path.posix.normalize(file);
    if (
      !/^(components\/ui|lib|hooks)\//.test(file) ||
      /(?:^|\/)\.\.(?:\/|$)/.test(file) ||
      /(?:catalog|site|components)\.ts$/.test(file)
    )
      throw new Error(`Component imports site-only code: ${file}`);
    if (seen.has(file)) return;
    const source = await readFile(path.join(base, file), "utf8").catch(() => {
      throw new Error(`Missing shipped file: ${file}`);
    });
    seen.add(file);
    if (file.endsWith(".js")) {
      const declaration = file.slice(0, -3) + ".d.ts";
      if (
        await stat(path.join(base, declaration))
          .then((s) => s.isFile())
          .catch(() => false)
      )
        await visit(declaration);
    }
    if (file.endsWith(".css")) {
      if (/url\(\s*["']?\//.test(source))
        throw new Error(
          `${file}: root-relative asset would break after installation`,
        );
      return;
    }
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const imports = new Set<string>();
    const walk = (node: ts.Node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        imports.add(node.moduleSpecifier.text);
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        imports.add(node.arguments[0].text);
      ts.forEachChild(node, walk);
    };
    walk(ast);
    for (const specifier of imports) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        const target = specifier.startsWith("@/")
          ? specifier.slice(2)
          : path.posix.join(path.posix.dirname(file), specifier);
        let resolved: string | undefined;
        for (const suffix of [
          "",
          ".ts",
          ".tsx",
          ".js",
          ".jsx",
          "/index.ts",
          "/index.tsx",
        ]) {
          if (
            await stat(path.join(base, target + suffix))
              .then((s) => s.isFile())
              .catch(() => false)
          ) {
            resolved = target + suffix;
            break;
          }
        }
        if (!resolved)
          throw new Error(`${file}: unresolved import ${specifier}`);
        await visit(resolved);
      } else {
        const pkg = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0];
        if (pkg === "next" || specifier.startsWith("node:"))
          throw new Error(
            `${file}: shipped components must work outside Next.js`,
          );
        if (pkg !== "react" && pkg !== "react-dom") packages.add(pkg);
      }
    }
  }
  await visit(entry);
  return { files: [...seen].sort(), dependencies: [...packages].sort() };
}
export async function makeArtifacts(base = root) {
  const definitions = await readDefinitions(base);
  const manifest = JSON.parse(
    await readFile(path.join(base, "package.json"), "utf8"),
  );
  const catalog: CatalogItem[] = [];
  const outputs = new Map<string, string>();
  const items = [];
  for (const definition of definitions) {
    const closure = await collectFiles(definition.entry, base);
    for (const pkg of closure.dependencies)
      if (!manifest.dependencies?.[pkg])
        throw new Error(
          `${definition.name}: ${pkg} must be a runtime dependency`,
        );
    // Published TypeScript needs declaration packages for untyped JS dependencies.
    for (const pkg of [...closure.dependencies]) {
      const types = `@types/${pkg.replace(/^@/, "").replace("/", "__")}`;
      if (manifest.dependencies?.[types] && !closure.dependencies.includes(types))
        closure.dependencies.push(types);
    }
    closure.dependencies.sort();
    const baseNames = closure.files
      .filter((file) => /\.(tsx?|jsx?)$/.test(file) && !file.endsWith(".d.ts"))
      .map((file) => path.basename(file).replace(/\.[^.]+$/, ""));
    if (new Set(baseNames).size !== baseNames.length)
      throw new Error(
        `${definition.name}: source basenames must be unique for shadcn import rewriting`,
      );
    catalog.push({ ...definition, ...closure });
    const files = await Promise.all(
      closure.files.map(async (file) => ({
        path: file,
        type: file.endsWith(".css")
          ? ("registry:file" as const)
          : file.startsWith("components/ui/")
            ? ("registry:ui" as const)
            : file.startsWith("hooks/")
              ? ("registry:hook" as const)
              : ("registry:lib" as const),
        target: file
          .replace(/^components\/ui\//, "@ui/")
          .replace(/^lib\//, "@lib/")
          .replace(/^hooks\//, "@hooks/"),
        content: await readFile(path.join(base, file), "utf8"),
      })),
    );
    const payload = registryItemSchema.parse({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: definition.name,
      type: "registry:ui",
      title: definition.title,
      description: definition.description,
      dependencies: closure.dependencies.map(
        (pkg) => `${pkg}@${manifest.dependencies[pkg]}`,
      ),
      files,
    });
    outputs.set(
      `public/r/${definition.name}.json`,
      JSON.stringify(payload, null, 2) + "\n",
    );
    items.push({
      ...payload,
      files: files.map(({ path, type, target }) => ({ path, type, target })),
    });
  }
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "jungui",
    homepage: "https://jungui-cle.pages.dev",
    items,
  };
  outputs.set("registry.json", JSON.stringify(registry, null, 2) + "\n");
  outputs.set(
    "public/r/registry.json",
    JSON.stringify(registry, null, 2) + "\n",
  );
  outputs.set(
    "lib/catalog.generated.json",
    JSON.stringify(catalog, null, 2) + "\n",
  );
  outputs.set(
    "components/demos/index.generated.ts",
    '"use client";\nimport dynamic from "next/dynamic";\nimport type { ComponentType } from "react";\nimport type { DemoProps } from "@/lib/catalog-types";\nexport const demos: Record<string, ComponentType<DemoProps>> = {\n' +
      catalog
        .map(
          (item) =>
            `  "${item.name}": dynamic(() => import("./${item.name}")),`,
        )
        .join("\n") +
      "\n};\n",
  );
  return outputs;
}

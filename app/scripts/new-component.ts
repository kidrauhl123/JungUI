import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { root } from "./registry";
import type { Category } from "../lib/catalog-types";

export function scaffold(
  name: string,
  title: string,
  category: Category = "display",
) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name))
    throw new Error(
      "Use a kebab-case component name, for example: kinetic-label",
    );
  if (
    !["display", "text", "backgrounds", "inputs", "feedback"].includes(category)
  )
    throw new Error("Unknown category");
  const symbol = name
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
  const usage = `import { ${symbol} } from "@/components/ui/${name}"\n\nexport function Demo() {\n  return <${symbol}>Hello, JungUI</${symbol}>\n}`;
  return new Map([
    [
      `components/ui/${name}.tsx`,
      `"use client";\nimport type { ComponentProps } from "react";\nimport { cn } from "@/lib/utils";\nimport "./${name}.css";\n\nexport type ${symbol}Props = ComponentProps<"div">;\nexport function ${symbol}({ children, className, ...props }: ${symbol}Props) {\n  return <div {...props} data-slot="${name}" className={cn("jui-${name}", className)}>{children}</div>;\n}\n`,
    ],
    [
      `components/ui/${name}.css`,
      `.jui-${name}{display:inline-flex;align-items:center;justify-content:center;padding:24px;border-radius:12px}\n`,
    ],
    [
      `components/demos/${name}.tsx`,
      `"use client";\nimport { ${symbol} } from "@/components/ui/${name}";\nimport type { DemoProps } from "@/lib/catalog-types";\nexport default function Demo({ compact }: DemoProps) { return <${symbol}>{compact ? "Hello" : "Hello, JungUI"}</${symbol}>; }\n`,
    ],
    [
      `registry/items/${name}.json`,
      JSON.stringify(
        {
          name,
          title,
          english: symbol.replace(/([a-z])([A-Z])/g, "$1 $2"),
          category,
          entry: `components/ui/${name}.tsx`,
          description: `可自定义内容的 ${title} 组件。`,
          interaction: "通过参数调整组件内容。",
          usage,
          props: [
            { name: "children", type: "ReactNode", description: "组件内容。" },
          ],
          credits: [],
          order: 100,
        },
        null,
        2,
      ) + "\n",
    ],
  ]);
}
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      category: { type: "string", default: "display" },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const name = positionals[0];
  if (!name)
    throw new Error(
      'Usage: npm run component:new -- kinetic-label --title "动态标签" --category text',
    );
  const files = scaffold(
    name,
    values.title ?? name,
    values.category as Category,
  );
  for (const file of files.keys()) {
    const exists = await access(path.join(root, file))
      .then(() => true)
      .catch(() => false);
    if (exists) throw new Error(`Refusing to overwrite ${file}`);
  }
  if (values["dry-run"]) {
    console.log([...files.keys()].join("\n"));
    return;
  }
  for (const [file, source] of files) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), source, { flag: "wx" });
  }
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/build-registry.ts"],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exitCode = 1;
  else
    console.log(
      `Created ${name}. Edit the component, demo and metadata, then run npm run check and npm run build.`,
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  await main();

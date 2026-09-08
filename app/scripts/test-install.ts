import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { root, makeArtifacts } from "./registry";
import type { CatalogItem } from "../lib/catalog-types";
const outputs = await makeArtifacts();
const catalog = JSON.parse(
  outputs.get("lib/catalog.generated.json")!,
) as CatalogItem[];
const fixture = await mkdtemp(path.join(tmpdir(), "jungui-consumer-"));
const server = createServer((request, response) => {
  const content = outputs.get(`public${request.url}`);
  response.writeHead(content ? 200 : 404, {
    "Content-Type": "application/json",
  });
  response.end(content ?? "{}");
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string")
  throw new Error("No registry server");
const origin = `http://127.0.0.1:${address.port}`;
async function file(name: string, content: string) {
  await mkdir(path.dirname(path.join(fixture, name)), { recursive: true });
  await writeFile(path.join(fixture, name), content);
}
async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: fixture,
      stdio: "inherit",
      env: { ...process.env, CI: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)),
    );
  });
}
try {
  const host = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  await file(
    "package.json",
    JSON.stringify(
      {
        name: "jungui-install-verification",
        private: true,
        type: "module",
        scripts: { build: "tsc --noEmit && vite build" },
        dependencies: {
          react: host.dependencies.react,
          "react-dom": host.dependencies["react-dom"],
        },
        devDependencies: {
          vite: "^8.0.12",
          "@vitejs/plugin-react": "^6.0.1",
          "@tailwindcss/vite": host.devDependencies.tailwindcss,
          tailwindcss: host.devDependencies.tailwindcss,
          typescript: host.devDependencies.typescript,
          "@types/react": host.devDependencies["@types/react"],
          "@types/react-dom": host.devDependencies["@types/react-dom"],
          "@types/node": host.devDependencies["@types/node"],
        },
      },
      null,
      2,
    ),
  );
  await file(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          skipLibCheck: true,
          allowJs: false,
          esModuleInterop: true,
          noEmit: true,
          baseUrl: ".",
          paths: { "@/*": ["./src/*"] },
        },
        include: ["src"],
      },
      null,
      2,
    ),
  );
  await file(
    "components.json",
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: false,
        tsx: true,
        tailwind: {
          config: "",
          css: "src/index.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
      },
      null,
      2,
    ),
  );
  await file(
    "vite.config.ts",
    'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; import tailwindcss from "@tailwindcss/vite"; import { fileURLToPath } from "node:url"; export default defineConfig({plugins:[react(),tailwindcss()],resolve:{alias:{"@":fileURLToPath(new URL("./src",import.meta.url))}}});',
  );
  await file(
    "index.html",
    '<html><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  await file("src/index.css", '@import "tailwindcss";\n');
  await file("src/env.d.ts", 'declare module "*.css";\n');
  await run("npm", ["install", "--no-audit", "--no-fund"]);
  await run(process.execPath, [
    path.join(root, "node_modules/shadcn/dist/index.js"),
    "add",
    ...catalog.map((item) => `${origin}/r/${item.name}.json`),
    "--yes",
  ]);
  for (const item of catalog)
    await file(`src/examples/${item.name}.tsx`, item.usage);
  await file(
    "src/main.tsx",
    'import { createRoot } from "react-dom/client";\nimport "./index.css";\n' +
      catalog
        .map(
          (item, i) =>
            `import { Demo as Demo${i} } from "./examples/${item.name}";`,
        )
        .join("\n") +
      '\ncreateRoot(document.getElementById("root")!).render(<main>' +
      catalog
        .map(
          (item, i) =>
            `<section aria-label="${item.name}"><Demo${i} /></section>`,
        )
        .join("") +
      "</main>);",
  );
  await run("npm", ["run", "build"]);
  console.log(
    `Verified all ${catalog.length} published usage examples through the real shadcn CLI in a clean Vite project: ${fixture}`,
  );
} finally {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (!process.env.KEEP_CONSUMER)
    await rm(fixture, { recursive: true, force: true });
}

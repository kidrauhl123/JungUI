# Component library architecture

## Decision

On 2026-09-08 the product direction was changed from a personal iframe specimen gallery to a Rare UI-style reusable component library, at the owner's request.

The implementation uses Next.js App Router, TypeScript, Tailwind CSS, Motion/GSAP where appropriate, and shadcn-compatible source registries. Next.js exports static HTML to the existing Cloudflare Pages `app/dist` output. There is no runtime API server.

## Dependency direction

```text
registry/items/*.json + components/ui + lib/hooks
             ↓ build-registry
catalog.generated.json   demos/index.generated.ts   public/r/*.json
             ↓                    ↓                       ↓
       navigation/docs        previews              shadcn CLI
                                                        ↓
                                                 consumer project
```

`components/ui` cannot import `components/demos`, `components/catalog`, app routes or Next.js. Those boundaries are checked before generating payloads. Demos import the real components, and may use site-only helpers such as copy controls. Full-page scroll previews use an iframe as a presentation convenience; installation always delivers source.

## Registry

The schema is validated using the installed `shadcn/schema` package. A TypeScript AST walk resolves local imports recursively, adds companion declarations for JavaScript helpers, and finds required npm dependencies. Each item contains its complete dependency closure, avoiding URL-dependent transitive registry lookups. File targets use `@ui/`, `@lib/` and `@hooks/` so the CLI follows the consumer's aliases.

Generated files are committed and checked for deterministic equality. Production builds regenerate them. Stale payloads and orphan registry entries fail `registry:check`.

The site uses public HTTP item URLs instead of GitHub shorthand because the repository is private. Installation exposes precisely the source listed in each payload, not the entire private repository. The toolbar uses the current origin so local and branch previews install their own build.

## Retained implementation

All previous categories remain represented. The two telegraph specimens are one parameterized component; the previously internal ripple effect is now independently installable. The original HTML Base CTA is a React button with the same effect. GSAP button graphics are inline and have instance-specific IDs. The existing Ando Sora shader engine is retained as JavaScript with a companion declaration; its wrapper is TypeScript. This avoids rewriting shader code solely for the framework migration.

The scroll stack takes cover and card content as React nodes. The original reference artwork and copy now belong to its demo. Visual-reference acquisition instructions have been replaced by component completion rules.

## Validation

- TypeScript and ESLint validate code.
- Node tests validate dependency closure, missing demos, forbidden site imports, path safety and text transitions.
- `test:install` creates a temporary Vite project, serves the generated payloads, runs the real shadcn CLI for all items, and compiles every documented usage example without allowing JavaScript imports to become implicit `any`.
- Browser review covers navigation, preview controls, install commands, source dialog, mobile layout and interaction callbacks.

## Deployment compatibility

Cloudflare root/build/output settings remain `app`, `npm run build`, `dist`. `_redirects` maps old specimen and pattern paths. New routes and source files are exported together. A local successful build does not mean production has been updated.

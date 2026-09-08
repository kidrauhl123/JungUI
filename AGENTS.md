# JungUI

Read `CONVENTIONS.md` and `CONTRIBUTING.md` before changing components or their docs. See `docs/architecture.md` for boundaries.

The user's intended product is a Rare UI-style component library: reusable React components, separate demos, explicit props, and working source-code installation. Do not revert it to an iframe collection or accept visual reproduction alone as completion.

- Project root for commands: `app/`.
- Source of truth: `app/registry/items/*.json` and the files they reference.
- Use `npm run component:new -- <name> --title "..." --category <category>` for new entries.
- Do not hand-edit generated registry/catalog/demo-index files.
- Run `npm run registry:build`, `npm run check`, and `npm run build`.
- Run `npm run test:install` when changing shipped components, metadata usage, the registry, dependencies or file layout.
- Preserve existing effects and demo intent, defaults, comparison labels and presentation while separating demo content from the reusable component. Nudge Instead must retain its Bad/Good comparison in both compact and full previews.
- Keep copy and prop defaults accurate to implementation. Source credits must remain truthful.
- Production is Cloudflare Pages, `app` build root, `dist` output. Pushing `main` triggers production deployment.
- Read relevant installed Next.js documentation in `app/node_modules/next/dist/docs/` before changing unfamiliar framework behavior.

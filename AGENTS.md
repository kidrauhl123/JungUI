# JungUI

Read `CONVENTIONS.md` and `CONTRIBUTING.md` before changing components or their docs. See `docs/architecture.md` for boundaries. When building UI, follow `skills/jungui/SKILL.md`.

The user's intended product is a Rare UI-style component library: reusable React components, separate demos, explicit props, and working source-code installation. Do not revert it to an iframe collection or accept visual reproduction alone as completion.

## Reference fidelity

- When collecting a referenced UI, first locate and inspect its real implementation: official source/registry, upstream repository, or the publicly delivered bundle and styles. Reverse-engineer structure, state changes, layout IDs, timing, easing, dimensions and event handling before writing a replacement. Do not substitute a familiar library or guessed animation for an implementation that can be inspected.
- Prefer reuse/adaptation where the source license allows redistribution. If it does not, independently implement the verified behavior; record what was observed, what was inferred and what cannot be reused. A Pro source button alone does not establish that the publicly delivered interaction cannot be studied.
- Preserve the reference's appearance and behavior by default. Do not add skip buttons, focus rings, extra controls inside the component, new spacing, effects or fallback animations without a user request. Necessary accessibility support must preserve the pointer interaction's appearance; demo-only controls belong outside the component.
- Reproduce and compare the original transition before extracting the reusable API. Verify opening, closing, intermediate animation frames, pointer/keyboard interaction, and relevant viewport sizes in a browser. Match measured values rather than tuning by taste. If fidelity is incomplete, say precisely what differs; do not call an approximation a faithful recreation.
- If an approach fails, return to the original source and identify the architectural mismatch before applying another visual patch.

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

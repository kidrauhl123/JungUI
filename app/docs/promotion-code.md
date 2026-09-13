# Promotion Code provenance

The interaction was observed in Memorae's Stripe-hosted checkout on 2026-09-13. Reference: https://stripe.com/payments/checkout.

This is an independent React implementation, not Stripe's original React source. Rendered DOM, computed styles and exported public stylesheets confirmed the persistent text input, intrinsic collapsed width, 200ms ease-out expansion, 36px height, 12px corners, and Apply's 300ms opacity/scale transition. Source styles remain in the local research archive and are not distributed by JungUI.

A nonempty value remains expanded when focus leaves. Empty values collapse. Enter invokes onApply with trimmed text; Tab reaches Apply; Escape blurs the input. External loading makes the input read-only and prevents repeated submissions. Error text is associated with the input. Motion is disabled with prefers-reduced-motion.

The demo contains only the compact input and its Apply affordance, with no business validation or surrounding checkout content. No Stripe scripts, payment integration, checkout session identifiers, or customer data are included. The component forwards input attributes; className applies to the wrapping div. Colors can be customized through --promotion-accent, --promotion-surface, --promotion-text, --promotion-idle, and --promotion-ring.

The `theme` prop explicitly selects light (default) or dark colors, including the input surface, text, placeholder, focus ring and error message. Only the demo listens to the site's theme event. Its transparent, 320px-wide presentation follows the surrounding canvas and has 112px minimum height (76px in compact previews).

The complete demo simulates a 1.2-second request: JUNGUI succeeds, other values fail. Small success/failure/reset controls make every state reproducible. Loading replaces Apply with a spinner; success shows a green check and Applied; errors show a red border, brief shake and associated message. These result states are independently designed additions, not verified reproductions of Stripe's server-backed responses. Real consumers control loading, success and error themselves. The demo cancels pending timers on reset and unmount.

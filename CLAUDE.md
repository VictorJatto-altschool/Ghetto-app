# GHETTO APP project instructions

Build GHETTO APP as a maintainable social communication product for African digital culture, branded **Night Culture**. Read `docs/PRODUCT_BRIEF.md`, `docs/ARCHITECTURE.md`, `docs/FEATURE_STATUS.md`, and the master specifications before making substantial changes.

## Non-negotiable product rules

- Build in vertical slices. Do not claim a feature works until it has been implemented and verified.
- Clearly distinguish real, local-only, simulated, and planned behaviour. Never invent users, activity counts, delivery/read receipts, online presence, or connection status.
- Preserve privacy: phone numbers and private conversations never appear publicly. Enforce permissions in trusted backend services, not only in the interface.
- Do not claim end-to-end encryption, live voice, multiplayer, cloud sync, or authentication before a suitable service is implemented and verified.
- Never put secrets or privileged provider keys in browser code or Git. Do not add paid services, publish, or touch production without the owner's approval.
- Keep to HTML, CSS, TypeScript, Vite, and vanilla modules. Phaser 3 may be used for Campus Life after its slice is planned. Do not add a frontend framework without explicit approval.
- Keep accessible labels, keyboard operation, visible focus, 44px touch targets where practical, responsive layouts, and reduced-motion support.

## Commands

- `npm install` — install free development dependencies.
- `npm run dev` — run the local development server.
- `npm run build` — type-check and create a production build.
- `npm run preview` — preview the production build locally.

Document meaningful architecture and product decisions in `docs/`. Update feature status and known limitations as implementation changes.

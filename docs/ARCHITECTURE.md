# Architecture

## Initial stack

- Browser client: semantic HTML, CSS tokens, strict TypeScript, vanilla modules.
- Development/build: Vite and TypeScript.
- Current client: responsive shell, local-only profile/chat previews, and a solo Phaser 3 campus prototype. Campus Life uses a 2D ray-cast first-person view with continuous 360° turning, human student sprites, enterable spaces, touch movement, and a device-local classroom builder.
- Backend foundation: a Supabase SQL/RLS draft exists under `supabase/`; no database project is connected and the migration is unapplied. Validate policies in a disposable project before integration.
- Future real-time voice: evaluate LiveKit when the lecture slice is scoped. Multiplayer Campus Life will need a dedicated presence/movement transport rather than high-frequency database writes.

## Boundaries

Keep UI rendering, domain logic, persistence, authentication, authorization, realtime transport, and integrations separable. The present `src/main.ts` is only a small presentation and local-preview module; it is not an application backend.

## Data and privacy

There is no connected remote database or account system. Preview messages and profile data are stored in browser local storage and must not be interpreted as delivered or published. No phone number or contact book is collected. The message schema's ciphertext fields are storage only; E2EE, client keys, and multi-account authorization are not implemented.

## Cost and vendor considerations

The current toolchain is open-source and runs locally without a paid service. Supabase, SMS delivery, media storage, voice, hosting, monitoring, and domain costs need current plan/quota review before adoption. Do not configure paid services or publish without owner approval.

## Dependency map

Design tokens and responsive shell → identity/authentication → profiles/privacy → contacts and requests → secure direct/group messaging → public Street Views → Explore/Communities/Crews → Campus Life rooms → lectures/materials → voice → progression and beta hardening.

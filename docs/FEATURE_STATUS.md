# Feature status

Updated: 2026-10-21

| Area | Status | Notes |
|---|---|---|
| Vite + TypeScript foundation | Implemented | Phaser 3 is installed; `npm run build` verifies TypeScript and production bundling. |
| Night Culture tokens and responsive shell | Implemented; preview reviewed in browser | Warm paper/ink/citron visual direction; light default, dark option, mobile navigation; reviewed at a 714px browser viewport. |
| Chat interface | Expanded local workspace preview | Search, unread/group filters, archive, pin, mute, request decisions, direct/group preview creation, local group member editing, replies, reactions, and small local attachments. No real recipients, delivery, live group roles, sync, backend safety tools, or encryption. Voice/video calls are excluded from Chats. |
| Profile editor | Local-only profile setup implemented | Display name, username, campus/community, and bio save in this browser and render in a private preview. No signup, remote account, or public profile. |
| Appearance preference | Local-only | Light/dark preference is stored in this browser. |
| Authentication and onboarding | Not started | Requires real identity flow and abuse controls. |
| Contacts and hosted groups | Not connected | Message requests and group member previews are local only. Real contacts, group roles, and permissions require accounts and backend authorization. |
| Street Views | Video-first local feed preview implemented | MP4/WEBM videos (up to 100 MB), images and text save as IndexedDB previews on this device. The default Videos tab plays muted inline with scroll-aware autoplay; For You prioritizes videos, with Posts and audience-intent filters. Nothing is published or synced; no external creator feed, likes, comments, or profiles yet. |
| Public profiles and social graph | Not started | No real users, follows, or public profile access. |
| Explore, Communities, Crews | Not started | — |
| Campus Life | Solo first-person prototype | Phaser 3 2D ray-cast view supports full rotation, keyboard/drag/touch movement, human student sprites, enterable spaces, and a local host builder for room name, environment, and 2–48 chairs. No real users, hosted rooms, chat, or synced state. |
| Backend foundation | Hardened SQL draft; not applied or executed | Explicit client table grants and RLS policies, plus narrow RPCs for relationship response, first conversation membership, and capacity-checked public room joins. No Supabase project is connected; no PostgreSQL/Supabase/Docker runtime is available here for execution. |
| Encryption | Not implemented | Schema can store ciphertext, but there is no client encryption, key exchange, or reviewed E2EE protocol. |
| Moderation, reporting, blocking | Not started | Must be enforced by trusted backend logic. |
| Production build | Verified | `npm run build` passes TypeScript checking and Vite production bundling. |
| Deployment | Not started | No service has been provisioned or published. |

This status deliberately distinguishes the interface preview from a production social product.

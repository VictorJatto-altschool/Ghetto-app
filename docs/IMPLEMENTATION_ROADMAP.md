# Implementation roadmap

## Phase 0 — foundation

- Project setup, Night Culture tokens, responsive shell, page map, and honest feature statuses.
- Acceptance: local setup instructions work; no secrets; no controls imply unsupported online features.

## Phase 1a — local profile and preferences (implemented)

- Profile editor and light/dark preference stored only in this browser, with an explicit private preview.
- Real account signup is deferred at the owner's request.

## Phase 1b — account and onboarding (deferred)

- Choose authentication/SMS approach after quota, cost, privacy, and abuse review.
- Build username, affiliation, profile, recovery, and privacy flows.
- Acceptance: multiple-account signup/recovery, rate limits, session handling, and negative authorization cases.

## Phase 2 — contacts and private messaging

- Local chat workspace slice implemented: searchable inbox, unread/group filters, device-only message requests, direct/group previews, archive/pin/mute, replies, reactions, and small local file attachments. Voice/video calls are intentionally excluded from Chats.
- Remaining before real messaging: contact discovery and privacy, live group roles, delivery/status, production media storage, blocking/reporting, notifications, backend authorization, and reviewed E2EE.
- Design and review encryption and key lifecycle before any E2EE claims.
- Acceptance: multi-account access tests, delivery/failure handling, membership changes, privacy and reporting.

## Phase 3 — Street Views and profiles

- Local preview slice implemented: text/image drafts, audience intent, campus tag, local filtering, and delete. Nothing publishes or syncs.
- Remaining: hosted posts, likes/comments/reshares, follows, discovery, reporting, and public profiles.
- Acceptance: authorization, media constraints, blocking/muting, and responsive usability.

## Phase 4 — Explore, Communities, and Crews

- Directory, membership, invitations, roles, events and announcements.

## Phase 5 — Campus Life

- Solo Phaser 3 prototype implemented: 2D ray-cast first-person view, continuous 360° turning, keyboard/drag/touch movement, human student sprites, enterable spaces, and a local classroom builder with style and 2–48 chairs.
- Remaining: multiplayer presence/reconnect, room permissions and chat, hosted session state, live classes/voice, content and progression.

## Phase 6 — lectures and voice

- Class chat, participant roles, presentations, Lecture Box permissions, real voice integration.
- Verify two-way audio and host permissions before describing the feature as live.

## Phase 7 — progression and beta hardening

- Server-validated quests/XP, notifications, safety tooling, observability, accessibility, load/security checks, backup recovery, staged beta.

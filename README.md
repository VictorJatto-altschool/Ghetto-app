# GHETTO APP

**Your people. Your world.** A Night Culture social communication and campus community product, being built in small, verifiable steps.

## Run locally

1. Install Node.js (LTS) if it is not already installed.
2. In this folder, run `npm install` once.
3. Run `npm run dev` and open the local address shown in the terminal.

The app is still a work in progress and has no connected account or backend. Chats now has a device-only workspace preview with search, inbox filters, requests, direct/group threads, archive/pin/mute, replies, reactions, and small local attachments. Messages are not delivered or end-to-end encrypted; voice and video calls are excluded from Chats. Profile previews and host-created classroom settings also stay in this browser. Campus Life has a Phaser 3 2D ray-cast first-person view with full 360° turning, human student sprites, enterable rooms, and a classroom preview builder for its name, environment, and chair count. These rooms are local previews; multiplayer, live classes, and room hosting are not connected.

## Current milestone

Responsive shell, local messaging/profile previews, a playable solo first-person campus slice, and an unapplied Supabase schema draft. See [Feature status](docs/FEATURE_STATUS.md) and [Architecture](docs/ARCHITECTURE.md) for what is implemented and what remains to build.

## Product reference

The canonical brief and specification were provided by the product owner in October 2026. See `docs/PRODUCT_BRIEF.md` for the distilled product direction and `docs/IMPLEMENTATION_ROADMAP.md` for the phased plan.

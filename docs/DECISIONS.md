# Architecture decisions

## 2026-10-20 — Start with Vite and vanilla TypeScript

The owner-supplied product specification explicitly selects HTML/CSS/TypeScript, Vite, and vanilla modules, and prohibits a UI framework without approval. This project follows that direction rather than the generic framework default.

## 2026-10-20 — Build incrementally, show preview status

The platform depends on real identity, privacy, database permissions, encryption, voice, and multiplayer systems. The first deliverable is a local-only interface slice. Sample content and device-local messages are labeled so they cannot be mistaken for live service behavior.

## 2026-10-20 — No provider provisioned

The product has free-plan constraints. Avoid external paid services until their current quotas/costs are checked and the owner approves their use.

## 2026-10-20 — Refresh visual direction after owner feedback

The owner rejected the first purple/dark treatment as generic. The app now defaults to warm paper surfaces, a deep green-black rail, and a citron action accent, with Syne display type and a dotted campus/map graphic. The original product brief remains in `docs/reference/` as source context; the direct visual preference takes precedence for the interface.

## 2026-10-20 — Defer real signup; implement local profile setup

At the owner's request, no real account signup is included yet. The profile editor and appearance preference save only in browser local storage and clearly state that nothing is published. Real identity, cloud persistence, and server authorization remain deferred.

## 2026-10-20 — Campus Life uses a 2D-rendered first-person 360° view

The owner specified a 2D game with a first-person view that can turn around fully, human characters in good clothing, and host-created classrooms with a configurable chair count. This overrides the supplied brief's top-down camera direction. The current local prototype uses Phaser 3 and device-local room settings; multiplayer hosting is not connected.

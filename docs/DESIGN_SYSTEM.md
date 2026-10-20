# Night Culture design system

## Direction

The owner rejected the first purple/dark treatment as generic. The current direction is **paper, ink, and campus signal**: warm chalk surfaces, a deep green-black navigation rail, and sharp citron actions, with burnt coral used sparingly. It aims for an editorial campus zine impression with disciplined layouts and confident type.

## Tokens

The app defines semantic light and dark tokens in `src/style.css`: canvas, surface, raised/elevated surfaces, border, text levels, primary action, selected tint, rail, and accent. Light is the default. Radius varies by component; most elements use tighter corners, while avatars remain round.

## Type and layout

Syne headings/brand and DM Sans interface copy, with system fallbacks. Desktop uses a deep-green navigation rail, conversation list, active conversation, and editorial brand panel. Mobile gets a full-screen conversation and a bottom bar with safe-area insets.

## Interaction

44px controls where practical, visible keyboard focus, named controls, reduced-motion support, and no color-only statuses. Avoid implying presence or delivery in preview data. The lowercase `g` mark and dotted campus/map artwork are the visual signature. No external reference was supplied; this iteration follows the owner's request for a modern, non-generic treatment.

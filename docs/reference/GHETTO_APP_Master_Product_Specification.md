# GHETTO APP — MASTER PRODUCT, EXPERIENCE & TECHNICAL SPECIFICATION
**Version:** 1.0  
**Purpose:** Canonical source of truth for Claude Code and future developers  
**Product owner:** Founder  
**Target:** Desktop-first web app with responsive mobile experience; first controlled beta of 500–1,000 users  
**Brand:** NIGHT CULTURE — rounded, fluid, distinctive, dark/light themes

---

## 1. Instructions to Claude Code

Read this document completely before making implementation changes. Treat it as the canonical product specification. Preserve the product decisions below unless you identify a genuine technical, security, legal, accessibility, or usability conflict. If a conflict exists, explain it in plain language and propose the safest alternative.

The founder is not a professional developer. Explain important decisions simply, do not assume the founder knows command-line terminology, and provide exact commands and steps for running, testing, configuring, and deploying the app.

Do not attempt to create the entire platform in one uncontrolled code-generation pass. Build an integrated product incrementally, with working vertical slices, tests, diagnostics, and acceptance criteria. Do not create attractive mock interfaces and label them as functional. Never claim a feature works until it has been tested.

Before coding:
1. Inspect the repository and available environment.
2. Summarise the existing files and tools.
3. Create or update `CLAUDE.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/FEATURE_STATUS.md`, `docs/KNOWN_ISSUES.md`, and `docs/OPERATIONS.md`.
4. Turn this specification into actionable milestones and a dependency map.
5. Identify required third-party accounts, service costs, secrets, and founder actions.
6. Ask for approval before spending money, publishing the app, performing destructive operations, or using paid services.
7. Never put secrets, service-role keys, database passwords, or private tokens in frontend code or Git.

Maintain a clear distinction between implemented, partially implemented, simulated, and not implemented features.

## 2. Product vision

GHETTO APP is a social communication and interactive community platform built around:
- Personal messaging and contacts.
- Public social discovery through **Street Views**.
- Groups, Communities, and Crews.
- **Campus Life**, a playable multiplayer 2D campus world with classrooms, lecture halls, gist rooms, and live sessions.
- Live lectures with voice, a class chat box, presentation tools, a Lecture Box for shared resources, and host/audience controls.
- University, alumni, and regional identity.
- A polished, rounded design system with Night Culture branding.

It should feel welcoming, lively, fast, and trustworthy. It must not simply look like WhatsApp or a generic social-media clone. The distinctive experience is a combination of public campus culture and interactive virtual spaces, while private chats remain personal.

## 3. Core product principles

1. **Real features over fake completeness.** A smaller feature that genuinely works is better than many fake buttons.
2. **Privacy by default.** Personal phone numbers and private chats are never exposed to classmates, group members, followers, or the public.
3. **Clear permission boundaries.** Public/private visibility and host/moderator permissions are enforced by the backend, not just by hiding UI controls.
4. **Mobile usability.** Responsive layouts and touch controls are required even though desktop is the primary development target.
5. **Debuggability.** Use typed interfaces, modular services, structured logs, automated tests, error boundaries, clear status indicators, and documented setup.
6. **Maintainability.** Keep components, data access, domain logic, real-time systems, and game logic separate.
7. **Honest status.** Do not describe encryption, live voice, notifications, or multiplayer as complete until tested.
8. **Cost awareness.** Prefer free tiers and open-source tools where practical, but disclose quota limits and likely costs before beta.
9. **No fabricated activity.** Never invent users, views, online counts, messages, or engagement.
10. **Safe social interaction.** Include block, mute, report, remove-from-room, moderation, and rate limits.

## 4. Supported technology stack

Use the following as the preferred stack, but document any proposed change and why it is better before introducing it.

### Frontend
- HTML5 for document structure.
- CSS3 for styling and responsive layout.
- **TypeScript** for application logic instead of plain JavaScript where practical. TypeScript compiles to JavaScript, remains compatible with HTML/CSS, and helps catch type errors before runtime. Do not use React, Vue, Angular, or another UI framework unless the founder approves a change.
- Vite for development server and build tooling.
- Phaser 3 for the Campus Life 2D game world.
- Accessible, reusable vanilla TypeScript components and modules.
- Optional PWA support after core flows work.

### Backend and data
- Supabase for PostgreSQL, authentication, database access, storage and selected realtime features, subject to architecture validation.
- Use Row Level Security (RLS) on every exposed table and test policies with different user roles.
- Server-side TypeScript functions for trusted actions such as room permissions, XP rewards, moderation, and sensitive workflows.
- Keep privileged keys server-side only.
- Avoid using database presence as a high-frequency movement transport.

### Voice and realtime
- Evaluate LiveKit for real-time voice/media, including room tokens, participant permissions and moderation.
- Use an appropriate realtime transport for multiplayer movement and game events. Supabase Broadcast may be sufficient for a small prototype's lower-frequency events, but test latency and message volume; use a dedicated authoritative game service if needed.
- Voice, game-state sync, class chat, and persistent application data are separate concerns. Do not force all traffic through one mechanism.

### Testing and quality
- Vitest for unit tests.
- Playwright for end-to-end browser tests.
- TypeScript strict mode.
- ESLint and Prettier.
- Browser developer tools, structured client/server logs, correlation IDs where useful, and documented reproduction steps.
- Git and GitHub for version control and change history.
- Deployment target may be Vercel or another suitable static frontend host, with backend services configured separately. Verify current plan limits and costs before selecting a production setup.

### Important architecture note
Do not add a new language just to make the stack sound more advanced. TypeScript is the recommended addition because it improves maintainability while compiling to JavaScript. A separate server language is not required for the first beta. If load testing later proves a need for a dedicated realtime/game server, evaluate the simplest maintainable option and document the trade-offs.

## 5. Brand and visual identity: NIGHT CULTURE

### Personality
Balanced: youthful, modern, confident, warm, and technically polished. Not childish, overly corporate, or visually noisy.

### Palette
Use semantic tokens; do not hardcode colours throughout components.

**Dark theme**
- Night Ink background: `#0E0F14`
- Elevated surface: `#171923`
- Raised surface: `#202331`
- Border: `#2C3040`
- Primary text: `#F5F4FA`
- Secondary text: `#B5B5C5`
- Muted text: `#85879A`
- Electric Violet primary: `#8B5CF6`
- Violet hover: `#A78BFA`
- Violet deep: `#6D28D9`
- Signal Orange: `#FF8A3D`
- Success: `#36C98F`
- Warning: `#F4BE4F`
- Error: `#F16C78`

**Light theme**
- Background: `#F7F7FB`
- Elevated surface: `#FFFFFF`
- Raised surface: `#F0EFF7`
- Border: `#E2E0EC`
- Primary text: `#171622`
- Secondary text: `#5F6070`
- Muted text: `#77798A`
- Electric Violet primary: `#7543E8`
- Violet hover: `#6334D3`
- Violet tint: `#EEE7FF`
- Signal Orange: `#D9631F`
- Success: `#167A53`
- Warning: `#8A5B00`
- Error: `#B42335`

### Typography
Use Inter or another well-supported modern sans-serif for UI. Use a consistent scale for page headings, section headings, body, labels, and metadata. Prioritise readability over stylistic effects. Avoid overly tiny metadata.

### Radius scale
```css
:root {
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 26px;
  --radius-2xl: 32px;
  --radius-3xl: 40px;
  --radius-pill: 999px;
  --radius-circle: 50%;
}
```
Use generous rounded corners consistently, not every component as a pill. Media must clip cleanly. Respect reduced-motion settings.

### Visual rules
- Smooth, rounded, fluid surfaces.
- Strong hierarchy and generous spacing.
- Violet is the main interaction accent; orange is selective for live/event emphasis.
- Do not mimic WhatsApp's signature green chat bubbles.
- Include dark and light themes.
- Use keyboard focus states, contrast checks, accessible labels, and responsive layouts.
- Use smooth, restrained transitions; avoid excessive bounce.

## 6. Information architecture: all main pages

### Public / unauthenticated
1. Welcome / landing page.
2. Sign up.
3. Log in.
4. OTP verification / account verification.
5. Password reset / account recovery.
6. Terms, privacy, community standards and safety information.
7. Service status/error pages as needed.

### Onboarding
8. Choose unique `@username` for Street Views.
9. Add display name and avatar.
10. Select affiliation type: current student, graduate/alumnus, prospective student, or regional/community affiliation.
11. Select university/institution and, where relevant, campus; non-students can choose an institution they identify with, graduated from, or a region/community they identify with. Make the relationship label clear so affiliation is not misrepresented.
12. Choose interests and content preferences.
13. Optional contact discovery/sync with clear consent and explanation.
14. Privacy and notification preferences.
15. Find people / follow suggestions / join communities (skippable).
16. Completion screen → Chats homepage.

### Authenticated app navigation
17. Chats (default homepage).
18. Conversation view.
19. New chat / new contact.
20. Message requests.
21. Contacts and friend connections.
22. New group.
23. Group conversation and group info/settings.
24. Communities directory.
25. Community page, member list, posts, events and settings.
26. Street Views feed.
27. Create Street Views post.
28. Post detail: likes, comments, views, reshares.
29. Search and discovery: people, posts, universities, public groups, communities, and public Campus Life rooms.
30. User public profile (`@username`) and followers/following.
31. Private profile/settings view.
32. Campus Life lobby and campus map.
33. Campus Life room browser.
34. Create/edit room.
35. Campus Life game world / room interior.
36. Live class/lecture interface.
37. Class chat box.
38. Participant list / audience controls.
39. Presentation stage.
40. Lecture Box / materials library.
41. Material preview/download.
42. Crews directory and Crew page.
43. Quests / achievements / XP.
44. Notifications centre.
45. Global search results.
46. Saved posts/resources.
47. Report / block / mute flows.
48. Settings hub.
49. Account and security settings.
50. Privacy settings.
51. Contact and discovery settings.
52. Notification settings.
53. Theme/accessibility settings.
54. Connected devices/sessions.
55. Help, feedback and bug report.
56. Admin/moderation console (restricted, server-authorised).
57. Admin audit log (restricted).
58. Not-found, offline, loading, empty and error states.

## 7. Core navigation and connections

- Signup → OTP verification → onboarding → Chats.
- Chats → conversation, message requests, contacts, new contact, new group, Communities, Street Views, Campus Life, Crews, Quests, profile and settings.
- Street Views → public profiles, follow/unfollow, post detail, comments, reshares, report/block, share to permitted chat/group, and campus/community discovery.
- Public profile → follow, view public posts, and optionally send a message request. A username-based message request is not the same as an accepted private contact.
- Message request → accept, ignore, or block. Acceptance creates the allowed conversation/connection according to privacy settings.
- Chats/groups/communities → group info, member roles, privacy, invites, mute/report/block and leave.
- Campus Life → lobby/map → discover rooms or create room → room world → live class interface → class chat, participants, presentation, Lecture Box, audio controls and host controls → post-class summary/resources (if enabled) → return to Chats.
- Host can share a lecture/session invitation into a group or one-to-one chat, subject to that chat's permissions.
- Lecture materials can be shared only with authorised recipients and must not become public just because they are linked from a class.
- Notifications deep-link to the relevant conversation, post, request, room or event.
- Settings are accessible from the profile/navigation and affect all relevant parts of the product.

## 8. Signup and identity rules

At signup, collect only what is necessary:
- Account identifier and verification.
- Unique `@username`.
- Display name.
- Affiliation type and selected institution or region.
- Optional avatar and interests.

Phone OTP may require a paid SMS provider; do not assume SMS delivery is free. Document options, country support, rate limits and expected costs. Offer an appropriate alternative such as email verification if the product owner approves. Never claim OTP is live until the provider is configured and real delivery is tested.

Affiliation:
- Current student: university/institution and optional campus.
- Graduate: institution and optional graduation year, if desired.
- Prospective student: institution they identify with, clearly labelled.
- Regional/community member: selected region or community.
Do not falsely label someone as a verified student unless a separate verification process exists.

## 9. Messaging, contacts and phone-number privacy

### Personal chats
Personal one-to-one chats are private and distinct from public Street Views. Users may chat through existing contacts or accepted requests. Usernames from Street Views can initiate a message request; the recipient can accept, ignore or block.

### Phone number rules — mandatory
- **Phone numbers must never be visible to other people merely because they share a class, lecture hall, room, group, Community, Crew, or Street Views feed.**
- Do not show phone numbers on public profiles, class participant lists, group member lists, posts, comments, or room overlays.
- Classmates can see display names, avatars and relevant public `@usernames`, not private contact details.
- Do not expose phone numbers through APIs, realtime events, logs, analytics, uploaded contact lists or frontend payloads to users who are not authorised.
- Contact discovery must be opt-in and clearly explained.
- The app must not assume it can inspect a phone's address book without permission.
- If mutual phone contact recognition is offered, use a privacy-preserving, consent-based contact discovery design and document its limits. Do not reveal either person's number simply because a match is found.
- Any in-app display of a phone number should require a deliberate user action, a legitimate private-contact relationship, and appropriate consent from the number owner. The safest default is to keep the number hidden in Campus Life even for contacts; people who already have each other's numbers can use their device address book or personal chat.
- Users can block people, control message requests, and decide who can discover them.

### End-to-end encryption
Treat end-to-end encryption (E2EE) as a high-risk, specialist feature. Do not invent a home-grown cryptographic protocol or label ordinary TLS/database security as E2EE. Before claiming E2EE, choose a reviewed protocol/library, define multi-device and recovery behaviour, and obtain an expert security review. If full E2EE cannot be completed and reviewed for the beta, disclose the actual protection accurately and do not falsely market the chats as end-to-end encrypted.

## 10. Groups, Communities and Crews

Support:
- Create group, add/invite participants and assign admins/moderators.
- Public/private group or Community settings.
- Public groups can be searched and joined according to their configured rules.
- Private groups require invitation or approval.
- Member roles and permissions.
- Group description, image, rules and announcements.
- Member management, report, mute, block and leave.
- Crews can focus on interests, campuses, hobbies, study and events.
- Community posts/events should link into Street Views or Campus Life where appropriate.
- Do not expose phone numbers or private chats to group members.

## 11. Street Views

Street Views is a public social feed where users can discover activity across universities, regions and communities.

Features:
- Text posts, images and videos.
- Public profile with unique `@username`.
- Follow/unfollow and follower/following lists.
- Views, likes, comments and reshares.
- Search and discovery.
- Report/block/mute.
- Share posts into eligible chats/groups.
- Privacy controls for profile fields and interactions.
- Upload limits, media validation, rate limiting, content moderation and storage lifecycle.
- Define view counting carefully and prevent obvious automated inflation.
- Do not expose phone numbers or private contact details.

## 12. Campus Life game and room model

Use Phaser 3 for a browser-based 2D world, with the game rendered in a canvas and surrounding app UI in HTML/CSS/TypeScript.

### Game features
- Campus map with recognisable spaces: courtyard, lecture halls, classrooms, study spaces, hangout areas and buildings.
- Avatar selection/customisation, with accessible fallbacks.
- Movement using WASD/arrow keys on desktop and touch controls on mobile.
- Collision detection, map boundaries, room entrances/exits and transitions.
- Multiple users can see each other and move in the same room.
- Visible names/avatars and presence state.
- Smooth interpolation and reconnect behaviour.
- Avoid sending high-frequency position changes to the persistent database.
- Keep game logic separate from UI and backend.

### Room types
- Lecture hall.
- Classroom.
- Gist/hangout room.
- Debate room.
- Workshop/event room.

### Room access
- Public.
- Friends-only (if implemented and correctly enforced).
- Invite-only/private.
- Capacity limits.
- Room topic, title, host, participants, speaking policy and available tools.
- Server-authorised entry and room actions.

## 13. Live lecture/classroom experience

A live classroom is a real interactive experience, not just a static room screen.

### Interface layout
- Game/room world.
- Presentation stage.
- Participant list.
- **Dedicated class chat box**.
- Lecture Box/resources panel.
- Audio controls.
- Raise-hand/question controls.
- Host/moderator controls, shown only to authorised roles.
- Connection status and error feedback.

### Class chat box
The class chat is scoped to the current room/session. It is separate from a user's personal Chats inbox.
- Participants can send and receive real-time text messages while in the class.
- Messages show display name/avatar and timestamp.
- Support basic moderation, rate limiting, reporting and mute/block behaviour.
- Host/moderator may slow mode, restrict chat, remove a message where supported, or temporarily disable chat.
- Define whether chat history persists after class. Default: retain only according to an explicit room policy and product retention setting; do not expose it to the public by default.
- Private messages and phone numbers must never be leaked into the class chat.
- Class chat must work alongside the presentation and not cover essential controls, particularly on mobile.
- Test with at least two independent accounts/browser sessions.

### Real voice
Evaluate LiveKit or a suitable managed WebRTC media service.
- Real two-way audio, not a fake microphone icon.
- Self mute/unmute.
- Visible microphone status and speaking indicator.
- Host/moderator mute and speaking permissions.
- Raise-hand requests and approval.
- Connection quality and reconnection feedback.
- Browser permission-denied/device-not-found handling.
- A host must never secretly activate another participant's microphone.
- Participants must explicitly enable their own microphone.
- Do not claim voice is complete until two separate users have successfully communicated.

### Roles and audience controls
Roles: host/lecturer, co-host, moderator, speaker and attendee.
Host/moderator actions, enforced server-side:
- Approve/reject entry when enabled.
- Lock/unlock room.
- Mute participants where supported.
- Restrict who may speak.
- Approve speaker requests.
- Manage chat and reactions.
- Remove disruptive participants.
- Assign/revoke moderators.
- Transfer host role through a controlled process.
- End the session.
- Configure attendee sharing permissions.
A client must not be able to grant itself a role by editing browser state or API payloads.

### Lecture Box
The host can upload and organise PDFs, notes, slides, images, videos, links and eligible Street Views posts. Participants can browse resources while the lecture continues, preview supported files, and download where permitted. The host can select the current presentation item and remove outdated materials. Resource access must follow the room policy and server-side authorization. Private file URLs must not be exposed as unrestricted public links.

### Presentation stage
Support a host-selected slide/image/document/video where feasible, synchronized stage changes, clear loading/error states, and return to the current presentation. Screen sharing may be a later milestone if it adds too much complexity, but must use explicit browser permission and a visible sharing indicator.

## 14. Security, safety and moderation

Minimum requirements:
- Secure authentication and session management.
- OTP/email verification rate limits and abuse protection.
- Strong server-side authorization for every sensitive operation.
- RLS policies and tests.
- Input validation and output escaping.
- Upload validation and size limits.
- Rate limiting for messages, requests, comments, posts and room actions.
- Report/block/mute and moderator workflows.
- Session/device management and logout.
- Audit events for sensitive admin/moderator actions.
- Backups and documented recovery procedures.
- No secrets in the client.
- Avoid logging message bodies, tokens, phone numbers, or other sensitive data.
- Clear privacy policy and data retention decisions before public beta.
- Never promise E2EE until implemented with a reviewed protocol and validated by specialist review.

## 15. Admin, feedback and operations

Build basic founder/admin tools with server-side role protection:
- View and action safety reports.
- Review reports with minimal necessary context.
- Suspend or restrict accounts according to policy.
- Review room/group abuse reports.
- View operational health and errors without exposing private content.
- Audit sensitive actions.
- Collect bug reports and suggestions.
- Let users select issue type, add steps to reproduce and optionally attach non-sensitive diagnostics.
- Provide a way to report a feature that is broken or confusing.

## 16. Performance and accessibility

- Responsive desktop, tablet and mobile layouts.
- Keyboard navigation and visible focus.
- Reduced-motion support.
- Meaningful loading, empty, offline and failure states.
- Lazy-load media and use appropriate image/video sizes.
- Avoid unnecessary rerenders and excessive realtime events.
- Handle weak networks and reconnection.
- Establish measurable performance budgets and test on modest devices.
- Test Android mobile browsers and desktop browsers.
- Provide touch controls for Campus Life.

## 17. Definition of done

A feature is complete only when:
1. It works end-to-end with real data where required.
2. It is connected to the intended backend/service.
3. Authorization is enforced server-side.
4. Loading, empty, error and offline states are handled.
5. Automated tests pass.
6. Relevant multi-account scenarios are tested.
7. Desktop and mobile layouts are checked.
8. Accessibility basics are reviewed.
9. Limitations and known issues are documented.
10. No placeholder control is represented as functional.

## 18. Initial beta scope and success criteria

Target: 500–1,000 users in a controlled beta. Do not assume that this number can be supported by any free tier without testing current service limits and costs.

Core beta priority:
1. Authentication and onboarding.
2. Chats, contacts, message requests and groups.
3. Street Views with posts and interactions.
4. Campus Life with real multiplayer movement.
5. Room creation and access control.
6. Class chat box.
7. Lecture Box and presentation.
8. Real voice and audience controls if integration and tests pass.
9. Communities/Crews, notifications, reporting and settings.
10. Operational monitoring, feedback and recovery.

The founder values a product users enjoy, but privacy, correctness and honesty are not optional. Launch the features that pass acceptance tests; clearly mark or disable the rest.

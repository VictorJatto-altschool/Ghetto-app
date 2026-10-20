# GHETTO APP — Master Product Brief and Claude Code Build Specification

**Document type:** Canonical product vision, UX requirements, architecture principles, brand system, and implementation instructions  
**Product:** GHETTO APP  
**Brand direction:** Night Culture — premium technology × youth culture  
**Platforms:** Responsive desktop and mobile web; installable PWA initially  
**Initial target:** Controlled beta of 500–1,000 registered users  
**Status:** Product requirements baseline; technical choices must be validated before implementation

---

## How Claude Code must use this document

Treat this document as the canonical description of what GHETTO APP is meant to become. Read it fully before making structural changes or implementing features. Do not treat the page inventory as a demand to generate every screen in one operation.

Your first responsibility is to convert the vision into an actionable, internally consistent project plan and maintainable architecture. Inspect the repository, preserve existing work, create durable project documentation, identify material ambiguities, and recommend implementation milestones. Then build the application incrementally in verified vertical slices.

The founder is a product owner who understands the product concept but is not a professional software developer. Explain significant technical decisions in simple language. Keep a record of assumptions and decisions. Do not claim a feature is implemented, secure, tested, deployed, or production-ready unless you have evidence from actual work and verification.

Do not spend money, provision paid infrastructure, publish publicly, delete important data, change production data, rotate credentials, or perform irreversible external actions without explicit permission. Use safe local development and test data by default.

Where details are not specified, propose sensible defaults and document them. Ask the founder only about decisions that materially change product behaviour, cost, privacy, safety or long-term architecture. Do not silently change the approved product vision.

## 1. Product vision

GHETTO APP is a connected social communication platform that brings together five major experiences:

1. **Private communication:** contacts, one-to-one conversations, group chats, Communities and message requests.
2. **Public social discovery:** Street Views, a public feed for everyday experiences, text, images, videos, campus moments and creator activity.
3. **Campus and community discovery:** search and explore universities, regions, public groups, Communities, Crews and public live sessions.
4. **Campus Life:** a multiplayer, top-down 2D virtual world where users move avatars, create and enter classrooms, lecture halls, gist rooms and other social spaces.
5. **Progression and identity:** profiles, followers, achievements, quests, XP, notifications and personal settings.

The experiences must connect naturally. A user may discover a lecturer's public post on Street Views, follow the lecturer, join a public virtual lecture, see the host's presentation, open the Lecture Box for notes, meet other attendees, and continue an accepted private conversation afterward.

GHETTO APP should not feel like a bundle of unrelated mini-apps. It should feel like one coherent platform with distinct privacy boundaries and a distinctive visual identity.

### Product promise

**Your people. Your world.**  
Supporting line: **Chat privately. Share publicly. Meet in Campus Life.**

### Primary product principles

- Chats is the default homepage after onboarding.
- Private communication and public social activity are distinct.
- Public discovery must never expose private messages or phone numbers by default.
- Users can belong through university affiliation, alumni status, an aspirational university connection, or a region.
- Public/private group and room settings must be enforced by trusted backend systems, not just hidden UI controls.
- Campus Life is a signature feature, but its initial playable scope should be realistic and testable.
- Visual quality, accessibility, security, maintainability and usability are product requirements, not polish to consider only at the end.
- The initial beta is for learning and validation. It is not a justification for knowingly shipping critical security defects.

## 2. Target users and identity

GHETTO APP is campus-centred but not limited to currently enrolled university students. Users may be current students, graduates, people who identify with a university, prospective students, or people who prefer a regional identity.

### Signup and account setup

The signup/onboarding experience should support:

- Phone number and one-time passcode (OTP) verification through a configured provider.
- Unique public Street Views username in the form `@username`.
- Display name.
- Secure authentication and account recovery.
- Required university/affiliation choice, with a regional option.
- Optional avatar/profile image and bio.
- Optional interests for discovery personalisation.
- Explicit and optional contact synchronisation, with an explanation of what matching does.
- Clear privacy choices and links to the applicable terms and privacy information.

A phone OTP verifies control of a phone number; it does not prove university attendance or alumni status. Do not describe self-declared university affiliations as verified.

### Affiliation choices

Every new user must choose one of these relationship types:

1. **Currently attends a university** — select the university.
2. **Graduated from a university** — select the university; profile label may say “Alumni of”.
3. **Identifies with a university** — select the university; profile label should not imply attendance.
4. **Regional connection** — select a country and appropriate region/state/city-level option where available.

Provide a searchable university directory, initially prioritising the launch campuses. If a university is missing, let the user submit its name for review rather than creating duplicates. Keep university records centrally managed. Affiliation visibility must be controllable by the user.

### Profile fields and privacy

The public profile may show display name, username, avatar, bio, interests, public Street Views posts, followers/following and selected achievements. University/region visibility must follow the user's setting. A user's phone number is private by default and must not appear on their public profile merely because the user has followers or joins a public group.

## 3. Two connection systems: contacts and Street Views

This separation is fundamental to the product.

### 3.1 Private messaging identity

One-to-one Chats are personal and private, similar in purpose to WhatsApp. Users should be able to communicate with family, friends and people with whom they have exchanged contact details or established an accepted connection.

- Users can add contacts by phone number or select a device contact if they grant permission.
- Contact matching must follow explicit privacy and data-minimisation rules.
- A matching number must not automatically publish the user's phone number to other users.
- Contact-based chat access is subject to blocking, account status and the recipient's privacy rules.
- Existing friends/accepted connections can use normal private chat.
- One-to-one conversations and group conversations must be designed for correctly implemented end-to-end encryption (E2EE).

Do not invent a cryptographic protocol. Evaluate established protocols and maintained implementations. Clearly distinguish E2EE from ordinary TLS or server-side storage encryption. Plan key verification, device changes, multiple devices, recovery trade-offs and membership changes. Do not claim encryption is working until the actual implementation is tested and independently reviewed where appropriate.

### 3.2 Public Street Views identity

Every user has a unique `@username`. Users can follow each other without becoming friends or gaining permission to initiate unrestricted private chats.

Street Views users can:
- Discover and follow public accounts.
- View public posts and public profile information.
- Like, comment, reply and reshare where enabled.
- See their own public post engagement metrics.
- Start a username-based message request when there is no existing permitted contact/friend relationship.

### 3.3 Username-based message requests

If a user discovers an account through Street Views and does not already have a permitted direct-chat relationship, pressing Message creates a request rather than immediately opening an unrestricted private conversation.

The recipient can:
- **Accept:** create a mutual friendship/accepted connection and allow a normal private chat.
- **Decline:** dismiss the request without automatically blocking the sender.
- **Block:** prevent the blocked account from contacting or interacting with the recipient as defined by the block policy.
- **Report:** submit abusive or suspicious content for review.

Rate-limit repeated requests and prevent a user from bypassing a block by resending requests from the same account. Explain what happens after decline or block. Following, contacts, friendships, group membership and Crew membership are separate relationships.

## 4. Main navigation and information architecture

### Desktop

Use a persistent, compact navigation rail with the main content area adapting to the selected section. Chats should use a conversation list and active conversation panel, but should not copy another app's exact layout, colour treatment or signatures.

Primary navigation should expose:
- Chats (default homepage)
- Street Views
- Campus Life
- Explore / The Yard
- Communities
- Crews
- Quests
- Notifications
- My Profile
- Settings (also accessible from the profile/menu area)

Global search should be reachable from the main interface. Show appropriate badges for unread messages, requests and notifications without excessive noise.

### Mobile

The responsive mobile experience must be intentionally designed, not just a compressed desktop layout. Evaluate a bottom navigation for core destinations such as Chats, Street Views, Campus Life, Explore and Profile, with additional destinations under a clearly labelled menu. Ensure accessible touch targets, readable forms, proper keyboard handling and a usable full-screen conversation view.

### Navigation rule

After successful onboarding, users land on Chats. They may navigate freely between sections. Do not force users to post, follow someone, join a Crew or enter Campus Life before they can message their contacts.

## 5. Chats and messaging

Chats is the primary daily-use destination. It should contain:

- Conversations inbox with search and unread indicators.
- One-to-one conversations.
- Group conversations.
- Visible Message Requests entry.
- New Contact, New Group and New Community actions.
- Archived chats.
- Shared media/links/files views.
- Group information and member management.
- Blocking/reporting entry points.
- Notification and privacy controls.

### New Contact

Allow entering a phone number, selecting a permitted device contact, or finding a user by `@username`. If the number is not registered, offer an optional invitation. Contact matching must not reveal another user's private number or bypass block/message-request rules.

### Direct chats

Support reliable message delivery, status, replies, reactions and supported attachments. Provide conversation-level controls such as view profile, block, report, manage notifications and review shared media. The privacy model and encryption design must be documented before shipping real private conversations.

### New Group and group chats

Users can select members, set the group name and image, and configure visibility and permissions. Support admins, member lists, invitations, relevant group settings and shared media. Group messages must use E2EE, including in discoverable public groups.

A public group's name, description, topic, cover image, campus tag and joining information may be visible in search. Its encrypted conversation content must not become public simply because the group is listed publicly. New members should not silently receive confidential historical messages by default; define a clear policy for prior messages and deliberately re-shared resources.

### New Community

A Community is an organisational container for related groups and an announcements area. Example: a university Community with announcement posts, department groups, class-level groups and event groups. Support Community details, visibility, administrators, group organisation, invitations, member management and reporting. Community membership does not automatically make someone a friend or expose phone numbers.

## 6. Street Views — public social network

Street Views is public social discovery, where users can see what is happening at other campuses and in other communities.

### Content formats

Support public text posts, daily experiences, images, videos, campus moments, announcements and reshares of eligible public posts. Make the posting audience explicit before publication. Do not accidentally publish private messages or private room materials.

### Feed and discovery

Plan for:
- For You / discovery feed.
- Following feed.
- Campus feed.
- Topic/hashtag pages where supported.
- Public profiles and creator pages.
- Search and shareable post links.

The feed should have useful basic ranking and filtering, but sophisticated recommendations can come later. Provide reporting, blocking and controls for muted users/topics where appropriate.

### Post engagement

For public posts, support views, likes/unlikes, comments/replies and reshares. Creators should see views, likes, comments and reshares for their posts. Define a sensible view-counting policy that avoids trivial inflation by repeated refreshes or automated traffic. Distinguish total counts from a list of people who interacted; display the latter only where product/privacy rules permit.

Provide post details, media viewer, edit/delete controls for the author, reporting, and shared-post previews inside Chats, groups and other eligible places. Public posts are not E2EE conversations; secure public content in transit and at rest and apply privacy and moderation rules.

## 7. Explore / The Yard

Explore is a discovery directory, separate from the scrolling Street Views feed. Include:
- Global search results.
- People and creators.
- Campus directory and campus hubs.
- Public group directory and group previews.
- Communities and Crews discovery.
- Public live classes and room previews.
- Topics and interest-based discovery.

Campus hubs can show public posts, public groups, Community listings and eligible live sessions associated with a university or region. Private group content, private profiles and private room details must not leak into search results.

## 8. Campus Life — multiplayer virtual campus

Campus Life is the signature experience: a multiplayer, top-down 2D campus where users control avatars, walk around, enter buildings, join sessions and socialise.

### Baseline world functionality

Plan for avatar rendering, movement, room entrances/exits, collision/boundaries, participant presence, room state synchronisation, chat, reactions, reconnect handling and moderation. Desktop movement should support arrow keys and WASD where suitable. Mobile should have touch controls appropriate for the world. Do not write every movement step to the primary database; choose suitable real-time transport/state synchronisation.

### Room types

The architecture should support classrooms, lecture halls, gist rooms, discussion/debate rooms, workshops, interest-based meetups and future room types. Avoid hardcoding the entire platform around one room category.

### Room privacy

The host chooses room visibility on creation and can manage it through Room Settings:
- **Public:** appears in eligible public listings, supports previews and allows eligible users to join while capacity and rules permit.
- **Private:** is not listed as an open room and requires invitation or the configured approval flow.

Enforce room permissions server-side. Hiding a Join button is not sufficient. Capacity, invitations, host privileges, moderator roles, speaking permissions and admission should be enforced by trusted logic.

### Inside a room

The interactive room view should make it possible to see who is present and entering/leaving; identify the host/lecturer; show the current presentation; and open participant, chat, audio and resource panels without unnecessarily navigating away from the live session.

## 9. Live lectures, presentations and Lecture Box

A host creating a classroom or lecture hall can run a live session. The interface should show participants, the current presentation and all available room controls.

### Presentation stage

Support appropriate host-shared content such as slides, images, documents, PDFs, videos, a lecture board, links and shared Street Views posts. The currently presented item is distinct from the resource collection.

### Lecture Box

Every applicable lecture room has a persistent Lecture Box: a clickable object in the virtual room and a corresponding interface panel. It holds the host's uploaded/shared resources, including notes/documents, images/slides, videos, permitted public/shared posts and links.

Attendees should be able to browse or open permitted resources without interrupting the current presentation. File access, downloads, uploads, replacement and removal must respect the room's permissions. Store large media in object storage or an appropriate media service, not directly in database rows.

### Real-time voice and controls

Implement real two-way audio using an appropriate WebRTC-compatible or managed media solution. Required controls include:
- Mute/unmute microphone.
- Output volume and device selection where supported.
- Speaking indicators and connection state.
- Raise hand / request to speak.
- Host-controlled speaking permission.
- Authorised participant mute/removal controls.
- Leave room and reconnect handling.

Formal lectures may begin with attendees muted and allow the host to grant permission. Gist rooms may use more open conversation settings. The host can choose a suitable policy for each room. Optional video, captions and recording can be later milestones.

Do not present a decorative button as functioning audio. Validate actual audio between multiple independent accounts/devices before calling the feature complete.

### Share Live

Hosts can share session invitations to direct Chats, group Chats and suitable Community/Crew spaces. The invitation card should show title, topic, host, state (upcoming/live/ended/full) and join action. Access restrictions must continue to apply after sharing. The card must not claim a session is live after it ends.

## 10. Crews

Crews are interest/activity-oriented communities tied to participation: coding, music, football, fashion, business, comedy and similar interests.

Support Crew profile, description, membership, Crew chat, events/activities, Crew members and roles, invitations, shareable posts, linked Campus Life sessions, moderation and reporting. Crews are not simply aliases for Communities. Communities organise related groups; Crews emphasise shared interests and participation. Membership must not automatically transfer between them.

## 11. Quests, XP and achievements

Support daily/weekly quests, quest details, completion tracking, XP, levels, achievements, optional leaderboards, reward details and shareable achievement cards.

All XP/reward decisions must be validated by trusted backend logic. Do not accept arbitrary XP amounts from browser requests. Prevent duplicate reward claims and repeated event processing from granting repeated rewards. Avoid rewards that can be easily farmed through fake accounts or spam.

## 12. Profiles, notifications and settings

### Profiles

Provide My Profile, Edit Profile, avatar customisation, public profile, friends/connections, followers, following, public posts, visible achievements and blocked users. From another profile, allow appropriate actions such as follow/unfollow, message request, friend/connection actions, invite to eligible session, report and block. All actions must respect privacy settings.

### Notifications

Support incoming messages/requests, friend requests, follows, post engagement, group/Community invitations, Crew activity, live lecture invitations, room announcements, quests/achievements and security alerts. Offer notification preferences so users can control categories and avoid excessive alerts.

### Settings

Include:
- Account and authentication methods.
- Phone number and contact-discovery privacy.
- Active sessions, devices and security alerts.
- Encryption/key verification and recovery options where supported.
- Chat preferences and shared-media settings.
- Notifications.
- Privacy and safety.
- Blocked accounts.
- Street Views/content preferences.
- Campus Life controls and audio devices.
- Appearance and theme.
- Accessibility.
- Data/storage usage.
- Help/support and community guidelines.
- Terms/privacy information.
- Account deactivation and deletion.

Provide a clear path to settings from profile/menu and context-specific settings for groups and rooms. Individual Settings must not be the only place an admin can manage a group.

## 13. Complete page inventory

Build shared layouts and route/view components appropriately; this inventory is a coverage checklist, not a demand for one HTML file per page.

### Entry and authentication
1. Welcome/Landing.
2. Sign Up.
3. Log In.
4. OTP Verification.
5. Forgot Password/Account Recovery.
6. Password Reset.
7. Device/Encryption Setup as applicable.
8. Profile Setup.
9. Find Friends/Contact Discovery.
10. Privacy Introduction/Consent.

### Chats
11. Chats Inbox.
12. New Chat.
13. Direct Chat.
14. New Group.
15. Group Chat.
16. Group Information.
17. Group Member Management.
18. Message Requests.
19. Shared Media/Links/Files.
20. Chat Search.
21. Archived Chats.
22. Block/Report flow.

### Street Views
23. Street Views Feed.
24. Create Post.
25. Media Preview/Editor.
26. Post Details.
27. Comments/Replies.
28. Image/Video Viewer.
29. Topic/Hashtag Page.
30. Campus Feed.
31. Shared Post Preview.
32. Post Management.
33. Report Post/Comment.

### Explore / The Yard
34. Explore Home.
35. Global Search Results.
36. Campus Directory.
37. Campus Hub.
38. Public Group Directory.
39. Public Group Preview.
40. Public Live Classes.
41. Live Class Preview.

### Campus Life
42. Campus Life Lobby.
43. Campus Map.
44. Live Room Browser.
45. Room Preview.
46. Create Room.
47. Room Setup.
48. Interactive Room/World.
49. Lecture Presentation View.
50. Participants Panel.
51. Room Chat.
52. Lecture Box.
53. Resource Viewer.
54. Host/Lecturer Controls.
55. Audio Controls.
56. Raise Hand/Request to Speak.
57. Share Live Session.
58. Room/Session Settings.
59. End-of-Session Summary.
60. Leave Room/return destination.

### Crews and Communities
61. Crews Home.
62. Discover Crews.
63. Create Crew.
64. Crew Details.
65. Crew Feed.
66. Crew Chat.
67. Crew Members.
68. Crew Events/Sessions.
69. Crew Administration.
70. Communities Home/Directory.
71. Create Community.
72. Community Details.
73. Community Announcements.
74. Community Groups.
75. Community Members/Admin.

### Progression
76. Quests Home.
77. Quest Details.
78. XP/Level Progress.
79. Achievements.
80. Leaderboards.
81. Rewards/Achievement Details.

### Profiles and relationships
82. My Profile.
83. Edit Profile.
84. Avatar Customisation.
85. Public User Profile.
86. Friends/Connections.
87. Following/Followers.
88. User's Street Views.
89. User's Achievements.
90. Blocked Users.

### Notifications, settings and support
91. Notifications Centre.
92. Friend Requests.
93. Invitations.
94. Privacy and Safety.
95. Settings Home.
96. Account Settings.
97. Security and Devices.
98. Encryption and Keys.
99. Chat Settings.
100. Notification Settings.
101. Appearance and Accessibility.
102. Data and Storage.
103. Content Preferences.
104. Privacy Controls.
105. Help Centre.
106. Contact Support.
107. Community Guidelines.
108. Terms and Privacy Policy.
109. Deactivate/Delete Account.

### Administrative/operational pages
110. Admin Dashboard.
111. Report Review.
112. User Safety Actions.
113. Public Content Moderation.
114. Campus/Group Listing Management.
115. Appeals.
116. Audit/Security Logs.

Administrative views must be access-controlled and must never offer a hidden way to read E2EE conversation content.

## 14. Primary user journeys

Document the following flows with diagrams and explicit success/failure paths:

1. Landing → signup → phone OTP → unique username → affiliation choice → onboarding → Chats.
2. Add contact → find/match account under privacy rules → start permitted direct chat.
3. Discover username → send Message Request → accept/decline/block/report.
4. Create Street Views post → publish publicly → receive views/likes/comments/reshares.
5. Find a creator/campus → view public profile → follow → optionally send message request.
6. Search public group → preview → join → access encrypted group chat.
7. Create private group → invite/approve members → manage roles and encrypted chat.
8. Create Community → add announcements and groups → administer membership.
9. Create or join Crew → engage in events/activities → connect to Campus Life.
10. Create room → set public/private access → publish/list/invite as appropriate.
11. Join lecture → observe arrivals and participants → view presentation → open Lecture Box → ask question or request to speak.
12. Use mute/unmute, volume, speaking permission and host moderation in an actual live audio session.
13. Share Live card into Chats/group/Crew → recipient opens card → access checks → join eligible session.
14. Complete eligible quest → backend validates → XP/achievement appears → optional share.
15. Report/block abusive user or content → moderation review and clear user-facing status.
16. Manage security/device or recover account.
17. Deploy a release → monitor errors → disable feature/roll back if necessary.

## 15. Brand identity and visual design

### Brand direction: Night Culture

Personality: a balance of premium technology and youth culture. Do not imitate WhatsApp's brand identity, logo shape, messaging colours or exact visual patterns.

Brand line: **Your people. Your world.**  
Supporting line: **Chat privately. Share publicly. Meet in Campus Life.**

### Core palette

| Token | Hex | Use |
|---|---|---|
| Night Ink | `#111116` | Dark theme canvas |
| Deep Graphite | `#171821` | Dark surfaces |
| Raised Graphite | `#1E2029` | Cards/panels |
| Elevated Graphite | `#252735` | Menus and selected panels |
| Border Graphite | `#343644` | Dark borders |
| Pure Violet | `#7C3AED` | Primary interactions |
| Violet Hover | `#6D28D9` | Hover state |
| Deep Violet | `#5B21B6` | Pressed state |
| Bright Violet | `#B8A1FF` | Dark-theme accents |
| Violet Tint | `#302043` | Dark selected surfaces |
| Signal Orange | `#FF8A3D` | Secondary expressive/live accent |
| Light Orange | `#FFB078` | Accent text on dark surfaces |
| Soft White | `#F7F5FA` | Light-theme canvas |
| Pure White | `#FFFFFF` | Light panels |
| Light Lavender | `#F0EDF6` | Secondary surfaces |
| Pale Lavender | `#E9E4F0` | Selected/elevated light surfaces |
| Light Border | `#E4DFEA` | Light borders |
| Dark Text | `#191622` | Light-theme primary text |
| Secondary Text | `#5F5A6B` | Light-theme secondary text |
| Muted Text | `#706B7D` | Low-emphasis light labels |

Use violet as the primary action colour and orange selectively for expressive highlights and live status. Most surfaces should remain neutral. Orange is not a substitute for danger/error red. Always pair status colour with text/icon where needed.

### Light and dark themes

Provide `system`, `light` and `dark` preferences. Follow system preference by default until a user explicitly selects a theme. Persist their selection. Switch themes consistently across the entire app.

Use semantic CSS variables for surfaces, text, borders, brand action, status, cards, inputs, messages, focus and overlays. Do not hardcode arbitrary colour values throughout component styles. Check actual colour-pair contrast and adjust tokens where needed.

### Rounded geometry and curves

GHETTO APP has a smooth, curved design language. Rounded geometry is part of the identity, but not every component should be a pill.

Official radius tokens:

| Token | Radius | Use |
|---|---:|---|
| `--radius-sm` | 10px | Small controls |
| `--radius-md` | 14px | Inputs and standard buttons |
| `--radius-lg` | 20px | Cards |
| `--radius-xl` | 26px | Large cards/panels |
| `--radius-2xl` | 32px | Modals/prominent panels |
| `--radius-3xl` | 40px | Hero sections/feature showcases |
| `--radius-pill` | 999px | Pills/tags/selected chips |
| `--radius-circle` | 50% | Avatars/circular controls |

Use rounded cards, curved panels, consistent media clipping, soft navigation highlights and restrained smooth motion. Do not overuse blobs, decorative waves, glows or shadows. Avoid nested radii that look awkward. All corners and curves must remain responsive and not hide focus states or content.

Suggested spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48 and 64 pixels. Typical control height is 44px or more where practical. Prefer borders and surface contrast to excessive shadows.

### Typography

- **Space Grotesk:** display/heading/brand expression.
- **Plus Jakarta Sans:** main interface/body text.
- Body text should generally be 14–16px with comfortable line height.
- Main page heading around 32px, major sections around 24px, card titles around 18–20px, captions no smaller than necessary.
- Load only required weights. Prefer self-hosting where practical, with appropriate licences and system fallbacks.

### Iconography and logo

Use a consistent stroke-based icon family such as Lucide. Standard icon sizes: approximately 20–22px; compact 16px; prominent 24px. Avoid mixing unrelated icon families or using emoji as primary navigation icons.

Explore three original logo concepts before finalising:
1. **Signal Link:** geometric paths forming a subtle G with junctions/negative space representing connected people and destinations.
2. **Open Circuit:** an asymmetric connecting route suggesting movement without a literal map or telephone.
3. **Portal Mark:** overlapping geometric forms representing entry into different connected spaces.

Use `GHETTO APP` as the primary wordmark, exploring Space Grotesk Semibold/Bold. Do not use a telephone handset inside a speech bubble, distressed graffiti lettering or generic esports typography. Create horizontal, square/app icon, symbol-only, monochrome and reversed variants. Test recognisability at small sizes. Treat concepts as provisional and do not claim trademark uniqueness without appropriate checks.

### Product-specific expression

- **Chats:** calm, readable, neutral incoming/outgoing surfaces with restrained violet tint; do not use signature WhatsApp-like green bubbles.
- **Street Views:** media-led posts, profile identity and clean engagement rows.
- **Campus Life:** spatial/immersive panels, room maps and avatar elements, while keeping controls readable.
- **Groups/Communities/Crews:** cover artwork, group avatars and clear membership/visibility labels.
- **Quests:** violet progression with selective orange highlights.
- **Settings/security:** calm, legible and trustworthy; minimise decorative noise.

### Motion and accessibility

Use restrained transitions around 150–240ms, appropriate easing, and respect `prefers-reduced-motion`. Meet WCAG 2.2 AA as a target, including readable text contrast, visible keyboard focus, accessible names and usable touch targets. Do not use colour alone to convey status.

## 16. Suggested technical architecture

Use a change-friendly architecture without premature complexity. A modular monolith is the preferred starting point unless analysis reveals a clear reason to choose differently. Define clean boundaries so real-time/game or media systems can be separated later if required.

### Frontend

HTML, CSS, vanilla JavaScript and Vite build tooling. Keep components, route/view rendering, design tokens, feature state and integration clients separate. Reuse the same responsive design system across desktop and mobile. PWA support can include manifest, install behaviour and a carefully designed service worker; do not let aggressive caching serve stale security-sensitive data.

### Backend and data

Evaluate Supabase/Postgres/Auth/Storage/Realtime as a likely initial option, but verify current capabilities, pricing/quotas, data location, OTP delivery, realtime limitations and appropriate alternatives before commitment. Do not assume the free tier will support all usage or live media.

Enforce authorisation at trusted server/database/service boundaries. Keep schema changes as versioned migrations. Use server-side functions for sensitive operations and rewards. Never expose privileged service keys in browser code.

### Real-time systems

Chat delivery, presence, game movement/state and voice have different latency and scaling characteristics. Do not force every event through a database table. Choose an appropriate real-time transport and media architecture; document connection handling, reconnection, abuse protection and operating cost.

### Storage and services

Use suitable object/media storage for images, videos, documents and lecture resources. Keep secrets and provider credentials in environment/secret management. Design replaceable integration boundaries for OTP/SMS, email/push notification, storage, audio/video, monitoring and hosting.

### Source control and environments

Use Git and a remote repository such as GitHub. Maintain development, staging/test and production configurations. Use automated checks, explicit migrations, code review where possible, safe releases, feature flags for risky functionality and documented rollback procedures.

Suggested structural areas (adapt based on actual implementation):
- `CLAUDE.md`
- `docs/`
- `public/`
- `src/app/`
- `src/components/`
- `src/features/`
- `src/styles/`
- `src/lib/`
- `src/services/`
- `tests/`
- backend migrations/functions/policies
- `.github/workflows/`

Do not create large numbers of empty placeholder files just to match a proposed tree. Create meaningful modules as features are implemented.

## 17. Conceptual data domains

Prepare a data model that can represent these separate domains (final table names are a design decision):

- User accounts and profiles.
- University/region directory and user affiliations.
- Contact matches, friendships, follows/followers and blocks.
- Message requests.
- Conversations, conversation membership and encrypted message payloads/metadata.
- Groups, group roles and invitations.
- Communities, announcements and Community-group relationships.
- Crews, membership and events.
- Street Views posts, media, comments, likes, reshares and view aggregates/events.
- Campuses, rooms, room access/roles, participants and session state.
- Lecture resources, resource permissions and session invitations.
- Quests, eligible completion events, XP ledger and achievements.
- Notifications and user preferences.
- Reports, moderation actions, appeals and relevant audit records.
- Feature flags, settings and operational metadata.

Avoid duplicate or inconsistent sources of truth. Add unique constraints, indexes and relationships appropriate to expected queries. Use idempotency and server-side validation for rewards and sensitive actions. Minimise collection and retention of personal data. Do not store private phone contact books unnecessarily.

## 18. Security, privacy and moderation

Security is not a feature to defer until funding. Minor UI imperfections can be improved after launch; critical privacy, access-control, encryption and data-loss problems must be addressed before real users depend on the platform.

Requirements include:
- Expiring, one-time OTPs, attempt limits, resend cooldowns and abuse controls.
- Secure session lifecycle and account recovery.
- Server-side authorisation and appropriate database row-level/resource permissions.
- No secrets in browser code or committed `.env` files.
- E2EE architecture and accurate security claims for private conversations.
- Contact privacy and consent-aware matching.
- Server-enforced public/private groups, Communities, rooms and Lecture Box resources.
- File type/size controls and safe media handling.
- Block/report/rate limits and moderation workflows.
- Protection against spam, impersonation, automated abuse and repeated reward claims.
- Backup and restore testing.
- Appropriate logging without leaking message content, credentials or unnecessary personal data.
- Account deletion and reasonable data-retention behaviour.

Administrators must not have a hidden means to read E2EE private messages. For encrypted-message reports, a user should deliberately submit the message/context they want reviewed, with the limits explained.

Add reporting entry points from public posts/comments, profiles, chats, groups, Communities, Crews and Campus Life rooms. Provide moderation review, safety actions, appeals and relevant audit logs. Moderation pages must be access-controlled.

## 19. Testing, quality and beta

The first launch target is 500–1,000 registered users, introduced through a controlled beta. Registered users are not the same as simultaneous online users; capacity planning must distinguish them.

### Beta rollout

1. Internal testing with a few trusted accounts/devices.
2. Small invited cohort to validate core journeys and collect defects.
3. Gradually expand toward 500–1,000 users after fixing severe problems.
4. Add campuses and larger loads based on actual usage, costs and feedback.

### Required testing

Test multiple accounts, roles and devices, including negative/unauthorised cases. Verify that prohibited access is actually blocked.

Test:
- Signup/OTP/recovery and account/session security.
- Contact matching, username requests, friendship, following and blocking.
- E2EE implementation and key/membership workflows.
- Direct/group chat and media sharing.
- Public post creation, analytics, comments, likes and reshares.
- Public group listing/joining and private invitation flows.
- Community/Crew permissions.
- Campus Life movement, presence, room access and reconnects.
- Lecture Box resource access and sharing.
- Actual two-way live audio and mute/speaking permissions.
- Responsive desktop/mobile screens and accessibility.
- Performance, error logging, backups/restore and deployment rollback.

### User feedback

Provide a feedback/reporting pathway that differentiates visual issue, functional bug, suggestion and safety/security issue. Ask for helpful reproduction details such as screen, action, expected behaviour and actual behaviour. Do not collect passwords, secret tokens or unnecessary private message contents. Track issues by severity, frequency, number of affected users and user impact.

Monitor sign-up/OTP success, returning usage, messages sent, posts published, meaningful engagement, lecture attendance/hosting, error rate, latency, storage, realtime load and operating cost. Do not use registration count as the only success measure.

## 20. Required documentation and maintainability

Before implementation, create or update these project files:

- `CLAUDE.md` — durable project instructions and coding/test rules.
- `docs/PRODUCT_BRIEF.md` — summary of the product vision.
- `docs/FEATURE_SPECIFICATION.md` — feature requirements and acceptance criteria.
- `docs/PAGE_MAP.md` — page inventory and navigation links.
- `docs/USER_FLOWS.md` — Mermaid user journeys and permission boundaries.
- `docs/ARCHITECTURE.md` — system architecture and service responsibilities.
- `docs/DATA_MODEL.md` — conceptual/physical schema and relationships.
- `docs/SECURITY_AND_PRIVACY.md` — threat model, permissions, encryption and privacy.
- `docs/DESIGN_SYSTEM.md` — visual tokens and component rules.
- `docs/BRAND_IDENTITY.md` — this brand direction and logo guidance.
- `docs/TEST_STRATEGY.md` — tests and quality gates.
- `docs/IMPLEMENTATION_ROADMAP.md` — phase-by-phase development plan.
- `docs/DECISIONS.md` — important architectural decisions and trade-offs.
- `docs/DEPLOYMENT_AND_OPERATIONS.md` — deployment, secrets, monitoring, backups and rollback.
- `docs/BETA_LAUNCH_PLAN.md` — controlled beta, feedback and success measures.

These files should be specific to GHETTO APP, internally consistent and actionable. Use diagrams where they add clarity. Update documentation when implementation or a decision materially changes.

## 21. Implementation roadmap

Use vertical milestones that produce testable working functionality. Suggested order:

**Phase 0 — Foundation and specification**  
Inspect repository, confirm architecture and costs, establish documentation, design tokens, route strategy, test tooling and development environment.

**Phase 1 — Application shell and onboarding**  
Responsive layout, light/dark/system themes, design system, signup/OTP integration, username, affiliation selection and profile setup. Use a testable auth configuration before real launch.

**Phase 2 — Secure messaging core**  
Contacts, requests, friendship transitions, direct chats, groups and role-based access. Encryption must be designed and tested; do not ship placeholder security claims.

**Phase 3 — Street Views**  
Posts, image/video storage, public feed, likes, comments, reshares, views, profile/following and reporting.

**Phase 4 — Explore, Groups, Communities and Crews**  
Campus directory, public group discovery, private invitations, Communities, Crew functions and roles.

**Phase 5 — Campus Life prototype**  
Small playable world, avatars, movement, entrances, basic presence, public/private room creation and join.

**Phase 6 — Lecture experience**  
Presentation, Lecture Box, resource viewer, live participant list, room chat, share invitations and host controls.

**Phase 7 — Real-time audio**  
Integrate and verify actual two-way audio, mute/unmute, device handling, raise-hand requests, host permissions and reconnection.

**Phase 8 — Quests and progression**  
Backend-validated XP, quests, achievements, notifications and optional leaderboards.

**Phase 9 — Beta hardening and launch**  
Security review, accessibility, performance tests, backup recovery, monitoring, feedback/triage, staged deployment and operating-cost validation.

Reorder only with documented reasons. Do not build fake controls to make a phase appear complete. Each milestone requires acceptance criteria, automated checks where practical, hands-on tests, known limitations and a clear rollback path.

## 22. Instructions for your first response and first work session

When this document is provided to Claude Code:

1. Read the entire specification.
2. Inspect the repository and report what is already present.
3. Identify missing information, conflicting requirements and high-risk decisions.
4. Create/update the project documentation listed above, including complete page/navigation maps and user-flow diagrams.
5. Recommend a practical architecture and explain trade-offs, real-time service needs, security requirements, estimated cost categories and possible vendor lock-in.
6. Propose the first implementation milestone with concrete acceptance tests.
7. Do not attempt to generate the entire application in one operation.
8. Do not provision paid services, publish, perform destructive operations or modify production resources without permission.
9. Do not state that security, E2EE, audio, multiplayer, backups or deployment is complete unless it has been implemented and verified.
10. Keep the build modular and understandable to future hired developers.

The first completion report must distinguish clearly between **documented**, **implemented**, **tested**, **independently reviewed**, and **deployed**. Those terms are not interchangeable.

The ultimate goal is to build a desirable, coherent, secure and maintainable GHETTO APP that a controlled cohort of 500–1,000 users can genuinely use and test, and that a future professional engineering team can improve and scale without starting over.

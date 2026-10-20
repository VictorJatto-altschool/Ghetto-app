# Feature specification and acceptance criteria

## Phase 1 — Accounts and onboarding

- Sign up and recover account using a configured, rate-limited identity provider.
- Choose unique username, affiliation, profile fields, and privacy options.
- **Accept when:** identity verification and recovery work across multiple accounts; expired/replayed OTPs and unauthorized access are rejected; private phone numbers never appear in public or community views.

## Phase 2 — Contacts and messaging

- Contact match, username request, accept/ignore/block, direct and group conversation, replies/reactions/media, archive and conversation controls.
- **Accept when:** only authorized members access content; requests and membership transitions work across accounts; delivery failures are clear; reviewed encryption and key lifecycle are implemented before E2EE claims.

## Phase 3 — Street Views

- Explicitly public text/media posts, For You/Following/Campus feeds, profiles/follows, comments, likes, reshares, reporting, muting and blocking.
- **Accept when:** audience is visible before posting; unauthorized content stays private; media limits, reporting, and audience changes are enforced.

## Phase 4 — Explore, Communities and Crews

- Search campuses, public groups, people and rooms; community announcements/groups/roles; crew membership/events.
- **Accept when:** discovery never grants private membership or phone access; invitations and roles are checked by backend policy.

## Phases 5–6 — Campus Life, classes and voice

- Phaser world with movement/collision/rooms/touch input; room access and presence; class chat, participants, lecture materials, presentation and host controls; real-time voice only after provider integration.
- **Accept when:** two accounts can move and reconnect; roles/access are enforced; materials remain scoped; actual two-way voice, mute, host permissions, and reconnect behavior are verified.

## Phase 7 — Safety, notifications and progression

- Reports, blocks, mutes, moderation/appeals, notifications, server-validated quests/XP, account deletion, support and operations.
- **Accept when:** rewards are idempotent and server-validated, moderation actions are auditable, and account deletion/retention is documented and tested.

Every slice also needs keyboard and responsive review, loading/empty/error/offline states, tests of unauthorized paths, and honest status labels. None of these acceptance criteria are satisfied by the current visual preview alone.

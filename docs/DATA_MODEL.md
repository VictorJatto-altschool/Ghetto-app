# Data model direction

No production database exists yet. The following domains guide a later Supabase/Postgres design; table and key choices require validation before migrations.

- `profiles`, `affiliations`, university/region directory.
- Contact matches, friendships, follows, blocks, and message requests.
- Conversations, conversation membership/roles, encrypted payloads and message metadata.
- Groups, Communities, Crews, invitations, events, and membership roles.
- Street Views posts/media/comments/reactions/reshares and view-event aggregates.
- Campuses, rooms, access policies, lecture sessions, participants and resources.
- Quests, eligible completion events, idempotent XP ledger, achievements.
- Notifications/preferences, safety reports, moderation actions/appeals, audit records.

Use foreign keys, uniqueness and query indexes; minimize personal data retention. Enforce row/resource authorization in the backend. Never put service-role credentials in the browser.

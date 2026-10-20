# Security and privacy plan

## Current preview

The chat inbox, sample conversations, message requests, and sent preview messages are local browser data. Small supported attachments are serialized into that browser storage too. Anyone with access to this browser profile may see them; do not enter sensitive content. There is no identity, remote authorization, encryption, cloud sync, or server-side data protection. Voice and video calls are intentionally not part of Chats.

Profile photos are also stored as small image data in this browser only. They are not uploaded or shared. The chat GIF panel can use the GIPHY search and trending endpoints when a user provides a GIPHY API key; the key stays in this browser and requests go directly to GIPHY. Locally attached and selected GIF previews are saved with the local chat preview. GIF results are rated PG and the panel displays provider attribution. Without a key, users can still attach a GIF from their device and reuse GIFs already in the local preview.

## End-to-end encryption status

End-to-end encryption is not implemented. This app currently has neither user/device identities nor remote message delivery, so there are no recipient keys to establish or verify. Local browser storage is not a substitute for E2EE and must not be described as encrypted. Before real messaging is connected, select a maintained protocol implementation for direct chats and group chats, establish identity and device-key verification, define key rotation and membership-change behavior, and ensure the service receives and stores ciphertext only. Verify that design between at least two real clients before presenting an E2EE indicator.

The Supabase migration is an unexecuted draft. It includes explicit table grants, RLS, and scoped database functions, but none of those controls have been run against PostgreSQL or tested across multiple users. The frontend is not connected to this schema.

## Required before real users

- One-time, expiring OTPs with attempt limits, resend cooldowns, abuse controls, recovery, and secure sessions.
- Server-side authorization and tested row-level security for every exposed database table.
- Private-number protection and consent-aware contact matching.
- Reviewed end-to-end encryption protocol, key lifecycle, membership changes, and recovery before any E2EE claim.
- Upload type/size constraints, safe media handling, rate limits, blocking, reporting, appeals, and moderation audit logs.
- Account deletion and reasonable retention; logs must not leak message content or credentials.
- Tested backup/restore and incident/release rollback procedures.

Admin interfaces must be access-controlled. Administrators must not gain hidden access to E2EE messages. User-reported encrypted content is reviewed only when the user chooses to submit it.

# Deployment and operations

## Current state

The application runs locally through Vite. No hosting provider, database, domain, SMS provider, voice provider, analytics, error monitoring, or production environment has been configured. Nothing has been published.

## Before deployment

1. Choose hosting and data providers after reviewing free-tier limits, quotas, privacy terms, data region, and likely cost.
2. Create separate development and production projects; define secrets only in server-side provider settings.
3. Configure migrations and row-level security; verify backup/restore, log retention, monitoring, and rollback.
4. Run multi-account authorization, security, accessibility, responsive, performance, and recovery acceptance checks.
5. Obtain owner approval before provisioning paid services or publishing.

## Release/rollback

No release process is active. For beta, keep releases reversible, document migration rollback/forward strategy, disable risky features via server-side flags, and maintain incident contacts and recovery steps. Avoid logging credentials, phone numbers, or private message content.

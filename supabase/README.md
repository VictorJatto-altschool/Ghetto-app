# Supabase backend foundation

The migration in `migrations/` is a first backend schema draft for Supabase. It has **not** been applied to a Supabase project or executed against a database. The app currently runs without a remote backend. No `psql`, Supabase CLI, or Docker runtime is available in the current workspace, so the SQL cannot be executed locally here.

The draft explicitly revokes client table privileges before granting the minimum operations used by its RLS policies. Membership transitions use narrow database functions: conversation creators can add their first membership, friend-request recipients can accept/ignore requests, and public campus-room joins serialize on the room row so capacity is enforced. These functions and policies still require execution and adversarial RLS tests in a disposable Supabase environment before they are relied on.

Before connecting a project, review and test every policy and database function, add required indexes and operational controls, and apply migrations in a disposable development project first. Do not put a Supabase service role key in browser code. The app currently has no real account flow, API client, or remote data access.

The `ciphertext` message column is only a storage shape. It does not provide encryption. Client-side encryption, key generation and recovery, membership/key-change behavior, and independent protocol review remain unimplemented. Do not store sensitive messages in this prototype.

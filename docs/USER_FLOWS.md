# User flows and permission boundaries

```mermaid
flowchart TD
  A[Sign up] --> B[Verify identity]
  B --> C[Choose username and affiliation]
  C --> D[Set profile and privacy]
  D --> E[Chats]
  E --> F[Existing contact conversation]
  E --> G[Username / phone contact request]
  G --> H{Recipient response}
  H -->|Accept| I[Allowed conversation]
  H -->|Ignore or block| J[No conversation access]
  E --> K[Street Views]
  K --> L[Explicit public post]
  E --> M[Campus Life]
  M --> N[Discover or create room]
  N --> O[Room access check]
  O --> P[Lecture, class chat, resources, optional voice]
```

## Boundaries

- A public profile or username is not proof of an accepted private contact.
- A private phone number is never shown to profile viewers, followers, groups, or room participants.
- Public listing of a group or room never grants access to private content/materials.
- Room hosts/moderators can take only server-authorized actions.
- Reports of encrypted chat content require the reporting user to deliberately submit the relevant context.
- Current preview has no accounts or permission boundaries; it is not safe for private data.

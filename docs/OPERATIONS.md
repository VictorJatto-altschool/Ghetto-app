# Local operations

## Development

Run `npm install`, then `npm run dev`. Vite prints the local URL. Stop the server with Ctrl+C. `npm run build` performs TypeScript checking and creates `dist/`.

## Configuration and secrets

No provider credentials or environment variables are currently required. Keep future secrets out of browser bundles and source control. Use a server-side secret store for privileged keys.

## Releases

No deployment target is configured. Before a beta, select a host, document its costs and limits, configure separate development/production services, test backup and rollback procedures, and request approval before publishing.

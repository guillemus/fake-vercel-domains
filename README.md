# Fake Vercel Domains

Vercel Domains, recreated with [Datastar](https://data-star.dev) and Cloudflare Workers.

Everything is fake: no real domain lookups happen. Live at https://fake-vercel-domains.guillemus.workers.dev

## How it works

The page is rendered on the server with Hono JSX and styled with Tailwind. Datastar handles browser interactions and applies HTML updates from the server.

1. **Connect.** On page load, the Worker creates a random session ID. Datastar opens an SSE connection through the Worker to a Cloudflare Durable Object identified by that ID.
2. **Search.** Typing sends the query to the Worker, which forwards it to the session's Durable Object. The object renders placeholders for all extensions and streams the HTML back over SSE.
3. **Load results.** The object starts simulated lookups for the top results and extensions near the scroll position. Each lookup waits for a random time, generates fake availability and pricing, and streams an HTML patch when it finishes. No registrar requests are made.
4. **Scroll.** As placeholder rows come into view, the browser sends `/more` requests. The object starts lookups around those positions, skipping any already requested.
5. **Avoid stale results.** Each search gets a run number. Lookup requests and completed lookups from an older run are ignored after a new search starts.

The Durable Object keeps the session's query, run number and lookup state in memory; it does not use durable storage. Refreshing creates a new session, and Cloudflare eventually removes the old object's in-memory state.

Cloudflare Workers and Durable Objects are a convenient way to host this demo, not a requirement of the frontend. A VPS or another server capable of maintaining sessions and streaming SSE could implement the same flow.

## Development

```sh
npm install
npm run dev
npm run deploy
```

# Fake Vercel Domains

Vercel Domains, recreated with [Datastar](https://data-star.dev) and Cloudflare Workers.

Everything is fake: no real domain lookups happen. Live at https://fake-vercel-domains.guillemus.workers.dev

## How it works

- The page is server-rendered with Hono JSX and styled with Tailwind.
- On load, Datastar opens an SSE connection (`@get('/connect')`) that the Worker hands to a Durable Object, one per browser tab.
- Typing posts the query (`@post('/search')`). The Durable Object streams back a skeleton of all results, then fires one fake lookup per TLD with a random latency and patches each row and top card as it resolves.
- Results from stale queries are dropped, so fast typing never shows old rows.

## Development

```sh
npm install
npm run dev
npm run deploy
```

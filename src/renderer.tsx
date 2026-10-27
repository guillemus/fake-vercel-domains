import type { Child } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

const Document = ({ children }: { children?: Child }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Vercel Domains</title>
      <meta name="description" content="Find a domain for your passion project. Fast. At-cost. Private." />
      <link rel="icon" href="/favicon.svg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono&display=swap" />
      <ViteClient />
      <Link href="/src/style.css" rel="stylesheet" />
      <script type="module" async src="/datastar.js" />
    </head>
    <body class="bg-black font-sans text-ink antialiased">{children}</body>
  </html>
)

export const renderer = jsxRenderer(Document)

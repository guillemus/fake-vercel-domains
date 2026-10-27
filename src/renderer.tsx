import type { Child } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

const Document = ({ children }: { children?: Child }) => (
  <html lang="en" class="touch-manipulation overflow-clip bg-black">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <title>(fake) Vercel Domains</title>
      <meta name="description" content="Find a domain for your passion project. Fast. At-cost. Private." />
      <link rel="icon" href="/favicon.svg" />
      <link rel="preload" href="/fonts/geist.woff2" as="font" type="font/woff2" crossorigin="" />
      <ViteClient />
      <Link href="/src/style.css" rel="stylesheet" />
      <script type="module" async src="/datastar.js" />
    </head>
    <body class="relative min-h-full bg-black font-sans text-ink antialiased">{children}</body>
  </html>
)

export const renderer = jsxRenderer(Document)

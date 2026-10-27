import { ServerSentEventGenerator } from '@starfederation/datastar-sdk/web'
import { DurableObject } from 'cloudflare:workers'
import type { JSX } from 'hono/jsx/jsx-runtime'
import { EmptyState, ResultRow, Results, TopResult } from './components/results'
import { lookup, parseQuery } from './domains'
import type { Env } from './env'

export class SearchSession extends DurableObject<Env> {
  stream?: ServerSentEventGenerator
  query?: string
  run = 0
  queue = Promise.resolve()

  async fetch(request: Request) {
    const q = this.query ?? new URL(request.url).searchParams.get('q') ?? ''
    this.stream?.close()
    let current: ServerSentEventGenerator | undefined
    let heartbeat: ReturnType<typeof setInterval>
    return ServerSentEventGenerator.stream(
      (stream) => {
        current = this.stream = stream
        heartbeat = setInterval(() => stream.patchSignals('{}'), 20_000)
        if (q) this.search(q)
      },
      {
        keepalive: true,
        onAbort: () => {
          clearInterval(heartbeat)
          if (this.stream === current) this.stream = undefined
        },
      },
    )
  }

  search(input: string) {
    this.query = input
    const run = ++this.run
    const query = parseQuery(input)
    if (!query) return this.patch(<EmptyState />)
    this.patch(<Results query={query} />)
    for (const tld of query.tlds) {
      const domain = { name: query.name, tld }
      lookup(domain).then((quote) => {
        if (run !== this.run) return
        this.patch(<ResultRow domain={domain} quote={quote} />)
        if (query.top.includes(tld)) this.patch(<TopResult domain={domain} quote={quote} />)
      })
    }
  }

  patch(element: JSX.Element) {
    this.queue = this.queue.then(async () => {
      const html = (await element).toString()
      try {
        this.stream?.patchElements(html)
      } catch {
        this.stream = undefined
      }
    })
  }
}

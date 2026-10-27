import { ServerSentEventGenerator } from '@starfederation/datastar-sdk/web'
import { DurableObject } from 'cloudflare:workers'
import type { JSX } from 'hono/jsx/jsx-runtime'
import { lookupStride, ResultRow, ResultsPane, TopResult } from './components/results'
import { lookup, parseQuery, type Query } from './domains'
import type { Env } from './env'

export class SearchSession extends DurableObject<Env> {
  stream?: ServerSentEventGenerator
  query?: string
  current?: { run: number; query: Query; requested: Set<number> }
  run = 0
  queue = Promise.resolve()

  subscribe(initial: string) {
    const q = this.query ?? initial
    this.stream?.close()

    let current: ServerSentEventGenerator | undefined
    let heartbeat: ReturnType<typeof setInterval>

    return ServerSentEventGenerator.stream(
      (stream) => {
        current = this.stream = stream
        heartbeat = setInterval(() => stream.patchSignals('{}'), 20_000)

        if (q) {
          this.search(q)
        }
      },
      {
        keepalive: true,
        onAbort: () => {
          clearInterval(heartbeat)

          if (this.stream === current) {
            this.stream = undefined
          }
        },
      },
    )
  }

  search(input: string) {
    this.query = input
    const run = ++this.run
    const query = parseQuery(input)
    this.current = query ? { run, query, requested: new Set() } : undefined

    this.patch(<ResultsPane query={query} run={run} searching />, { selector: '#results', mode: 'replace' })

    if (query) {
      this.request(query.top.map((tld) => query.tlds.indexOf(tld)))
    }
  }

  more(run: number, from: number) {
    if (run !== this.current?.run) {
      return
    }

    const count = this.current.query.tlds.length
    const start = Math.max(0, from - lookupStride)
    const end = Math.min(count, from + lookupStride * 4)

    this.request(Array.from({ length: end - start }, (_, i) => start + i))
  }

  request(indexes: number[]) {
    const current = this.current
    if (!current) {
      return
    }

    const { run, query, requested } = current
    for (const index of indexes) {
      if (requested.has(index)) {
        continue
      }

      requested.add(index)

      const domain = { name: query.name, tld: query.tlds[index] }
      lookup(domain).then((quote) => {
        if (run !== this.run) {
          return
        }

        this.patch(<ResultRow domain={domain} quote={quote} index={index} run={run} />)

        if (query.top.includes(domain.tld)) {
          this.patch(<TopResult domain={domain} quote={quote} />)
        }
      })
    }
  }

  patch(element: JSX.Element, options?: Parameters<ServerSentEventGenerator['patchElements']>[1]) {
    this.queue = this.queue.then(async () => {
      const html = (await element).toString()
      try {
        this.stream?.patchElements(html, options)
      } catch {
        this.stream = undefined
      }
    })
  }
}

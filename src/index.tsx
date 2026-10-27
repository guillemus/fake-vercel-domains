import { ServerSentEventGenerator } from '@starfederation/datastar-sdk/web'
import { Hono } from 'hono'
import { createBrotliCompress } from 'node:zlib'
import type { Env } from './env'
import { DomainsPage } from './page'
import { renderer } from './renderer'

export { SearchSession } from './session'

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

app.get('/', (c) => {
  c.header('Cache-Control', 'private, no-store')
  return c.render(<DomainsPage sid={crypto.randomUUID()} q="" searching={false} />)
})

app.get('/search', (c) => {
  c.header('Cache-Control', 'private, no-store')
  return c.render(<DomainsPage sid={crypto.randomUUID()} q={c.req.query('q') ?? ''} searching />)
})

function brotli(body: ReadableStream<Uint8Array>) {
  const encoder = createBrotliCompress()
  const reader = body.getReader()

  return new ReadableStream<Uint8Array>({
    start(controller) {
      encoder.on('data', (chunk: Uint8Array) => controller.enqueue(new Uint8Array(chunk)))
      encoder.on('end', () => controller.close())
      encoder.on('error', (error) => controller.error(error))
    },
    async pull() {
      const { done, value } = await reader.read()
      if (done) {
        encoder.end()
        return
      }

      encoder.write(value)
      encoder.flush()
    },
    cancel(reason) {
      encoder.destroy()
      return reader.cancel(reason)
    },
  })
}

async function readSession(c: { req: { raw: Request }; env: Env }) {
  const result = await ServerSentEventGenerator.readSignals(c.req.raw)
  if (!result.success) {
    return null
  }

  const { sid, q } = result.signals
  if (typeof sid !== 'string' || !sid) {
    return null
  }

  const session = c.env.SESSIONS.get(c.env.SESSIONS.idFromName(sid))

  return { session, q: typeof q === 'string' ? q : '' }
}

app.get('/connect', async (c) => {
  const signals = await readSession(c)
  if (!signals) {
    return c.body(null, 400)
  }

  const response = await signals.session.subscribe(signals.q)
  if (!response.body || !c.req.header('Accept-Encoding')?.includes('br')) {
    return response
  }

  const headers = new Headers(response.headers)
  headers.set('Content-Encoding', 'br')

  return new Response(brotli(response.body), { status: response.status, headers, encodeBody: 'manual' })
})

app.post('/search', async (c) => {
  const signals = await readSession(c)
  if (!signals) {
    return c.body(null, 400)
  }

  await signals.session.search(signals.q)
  return c.body(null, 204)
})

app.post('/more', async (c) => {
  const signals = await readSession(c)
  if (!signals) {
    return c.body(null, 400)
  }

  await signals.session.more(Number(c.req.query('run')), Number(c.req.query('from')))
  return c.body(null, 204)
})

export default app

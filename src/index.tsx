import { ServerSentEventGenerator } from '@starfederation/datastar-sdk/web'
import { Hono } from 'hono'
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

async function readSession(c: { req: { raw: Request }; env: Env }) {
  const result = await ServerSentEventGenerator.readSignals(c.req.raw)
  if (!result.success) {
    return null
  }

  const { sid, q } = result.signals
  if (typeof sid !== 'string' || !sid) {
    return null
  }

  return { session: c.env.SESSIONS.get(c.env.SESSIONS.idFromName(sid)), q: typeof q === 'string' ? q : '' }
}

app.get('/connect', async (c) => {
  const signals = await readSession(c)
  if (!signals) {
    return c.body(null, 400)
  }

  return signals.session.fetch(`https://session/connect?q=${encodeURIComponent(signals.q)}`)
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

import type { SearchSession } from './session'

export type Env = {
  SESSIONS: DurableObjectNamespace<SearchSession>
}

export type Domain = {
  name: string
  tld: string
}

export type Quote = Domain & ({ status: 'unavailable' } | { status: 'available'; price: number; pro?: boolean; premium?: boolean })

export type Query = {
  name: string
  tlds: string[]
  top: string[]
}

const popular = ['com', 'dev', 'app', 'io', 'ai', 'xyz', 'org', 'me', 'net', 'tech', 'space', 'cloud', 'studio', 'sh', 'academy']

const longTail = `accountants actor agency airforce apartments archi army associates attorney auction band bargains bet bike bingo bio black blue
boutique broker builders business cab cafe camera camp capital cards care careers cash casino catering center chat cheap church city claims
cleaning clinic clothing club coach codes coffee college community company computer condos construction consulting contractors cool coupons
credit creditcard cruises dance dating deals degree delivery dental design diamonds digital direct directory discount dog domains education
email energy engineer engineering enterprises equipment estate events exchange expert exposed express fail farm finance financial fish fitness
flights florist football foundation fund furniture futbol fyi gallery games gifts glass gmbh gold golf graphics gratis gripe group guide guru
haus healthcare hockey holdings holiday house immo industries institute insure international investments jewelry kitchen land lease legal life
lighting limited limo live loans ltd maison management market marketing mba media memorial moda money mortgage navy network news ninja partners
parts photography photos pictures pizza place plumbing plus productions properties pub recipes rehab reise reisen rentals repair report
restaurant reviews rip rocks run sale salon sarl school schule services shoes shopping show singles soccer social software solar solutions style
supplies supply support surgery systems tax taxi team technology tennis theater tienda tips tires today tools tours town toys trading training
university vacations ventures vet viajes video villas vin vision voyage watch wine works world wtf zone`.split(/\s+/)

export const tlds = [...popular, ...longTail]

const prices: Record<string, number> = {
  com: 11.25,
  dev: 9.99,
  app: 9.99,
  io: 14.99,
  ai: 160,
  xyz: 12.99,
  org: 7.99,
  me: 19.99,
  net: 13.5,
  tech: 49.99,
  space: 24.99,
  cloud: 21.99,
  studio: 21.99,
  sh: 33,
  academy: 21.99,
  accountants: 43.99,
  actor: 19.99,
  agency: 5.99,
  airforce: 117.35,
  apartments: 19.99,
  archi: 24.99,
  army: 19.99,
  associates: 21.99,
  attorney: 58,
  auction: 4.99,
  band: 29.99,
  bargains: 21.99,
  bet: 17.99,
  bike: 14.99,
  bingo: 14.99,
  bio: 9.99,
  black: 29.99,
  blue: 23.99,
  boutique: 3.99,
  broker: 14.99,
  builders: 7.99,
  business: 3.99,
  cab: 23.99,
  cafe: 7.99,
}

const fallbackPrices = [3.99, 4.99, 7.99, 9.99, 14.99, 17.99, 19.99, 21.99, 23.99, 24.99, 29.99, 33, 43.99, 58]

const proEligible = new Set(['dev', 'app', 'studio', 'agency', 'design', 'digital', 'software', 'tools', 'codes'])

export const badges: Record<string, string> = { ai: '2 Year Domain' }

function hash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

export function parseQuery(input: string): Query | null {
  const [first = '', ...rest] = input.trim().toLowerCase().split('.')
  const name = first
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
  if (!name) return null
  const typed = rest.join('.')
  const ordered = tlds.includes(typed) ? [typed, ...tlds.filter((tld) => tld !== typed)] : tlds
  return { name, tlds: ordered, top: ordered.slice(0, 4) }
}

function quote({ name, tld }: Domain): Quote {
  const roll = hash(`${name}.${tld}`)
  const taken = popular.includes(tld) ? Math.max(0.2, 1 - name.length * 0.08) : Math.max(0.03, 0.5 - name.length * 0.1)
  if (roll < taken) return { name, tld, status: 'unavailable' }
  if (roll > 0.97) return { name, tld, status: 'available', premium: true, price: Math.round(80 + hash(`${name}.${tld}!`) * 400) }
  const price = prices[tld] ?? fallbackPrices[Math.floor(hash(tld) * fallbackPrices.length)]
  return { name, tld, status: 'available', price, pro: proEligible.has(tld) }
}

export async function lookup(domain: Domain) {
  await scheduler.wait(120 + Math.random() ** 1.6 * 2400)
  return quote(domain)
}

export const formatPrice = (price: number) => `$${price.toFixed(2)}`

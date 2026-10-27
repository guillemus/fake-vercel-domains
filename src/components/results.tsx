import { badges, formatPrice, type Domain, type Query, type Quote } from '../domains'
import { cx } from './cx'
import { Icon, type IconName } from './icons'

function DomainName({ domain, muted }: { domain: Domain; muted?: boolean }) {
  return (
    <span class={cx('truncate', muted ? 'text-faint' : 'text-ink')}>
      {domain.name}
      <span class="font-semibold">.{domain.tld}</span>
    </span>
  )
}

function CartButton() {
  return (
    <button
      class="flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-[#1a1a1a]"
      aria-label="Add to cart"
      data-on:click="$cart++"
    >
      <Icon name="cartPlus" />
    </button>
  )
}

function Price({ quote }: { quote: Extract<Quote, { status: 'available' }> }) {
  return (
    <span class="animate-fade-in whitespace-nowrap">
      {quote.pro && (
        <>
          <a class="text-link hover:underline" href="#">
            Free with Pro
          </a>
          <span class="text-muted"> or </span>
        </>
      )}
      {formatPrice(quote.price)}
    </span>
  )
}

function Badge({ children, premium }: { children: string; premium?: boolean }) {
  return (
    <span
      class={cx(
        'ml-2 inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-medium',
        premium ? 'animate-fade-in bg-premium text-premium-ink' : 'bg-pill text-ink',
      )}
    >
      {children}
    </span>
  )
}

export function TopResult({ domain, quote }: { domain: Domain; quote?: Quote }) {
  const unavailable = quote?.status === 'unavailable'
  return (
    <div id={`top-${domain.tld}`} class="h-[110px] min-w-0 rounded-lg border border-line bg-surface p-5">
      <div class="flex text-[19px]/7">
        <DomainName domain={domain} muted={unavailable} />
      </div>
      {!quote ? (
        <div id={`top-${domain.tld}-pending`} class="mt-2.5 flex h-8 items-center justify-between gap-3">
          <span class="h-[18px] w-[60px] rounded bg-skeleton" />
          <span class="size-8 rounded-md bg-skeleton" />
        </div>
      ) : quote.status === 'unavailable' ? (
        <div id={`top-${domain.tld}-unavailable`} class="mt-2.5 flex h-8 animate-fade-in items-center text-base text-faint">
          Unavailable
        </div>
      ) : (
        <div id={`top-${domain.tld}-available`} class="mt-2.5 flex h-8 items-center justify-between gap-3 text-base">
          <Price quote={quote} />
          <CartButton />
        </div>
      )}
    </div>
  )
}

export function ResultRow({ domain, quote }: { domain: Domain; quote?: Quote }) {
  const badge = badges[domain.tld]
  return (
    <div id={`row-${domain.tld}`} class="flex h-14 min-w-0 items-center justify-between gap-3 bg-surface px-3.5 text-[13.5px]">
      <span class="flex min-w-0 items-center">
        <DomainName domain={domain} muted={quote?.status === 'unavailable'} />
        {badge && <Badge>{badge}</Badge>}
        {quote?.status === 'available' && quote.premium && <Badge premium>Premium</Badge>}
      </span>
      {!quote ? (
        <span id={`row-${domain.tld}-pending`} class="h-8 w-[90px] shrink-0 rounded-md bg-skeleton" />
      ) : quote.status === 'unavailable' ? (
        <span id={`row-${domain.tld}-unavailable`} class="shrink-0 animate-fade-in pr-1 text-faint">
          Unavailable
        </span>
      ) : (
        <span id={`row-${domain.tld}-available`} class="flex shrink-0 items-center gap-2">
          <Price quote={quote} />
          <CartButton />
        </span>
      )}
    </div>
  )
}

function FilterButton({ label, icon = 'chevron', class: className }: { label: string; icon?: IconName; class?: string }) {
  return (
    <button
      class={cx(
        'flex h-8 items-center justify-between gap-2 rounded-md border border-line px-3 text-sm whitespace-nowrap transition-colors hover:bg-[#1a1a1a]',
        className,
      )}
    >
      {label}
      <Icon name={icon} class="size-4" />
    </button>
  )
}

export function Results({ query }: { query: Query }) {
  const domains = query.tlds.map((tld) => ({ name: query.name, tld }))
  const filler = (3 - (domains.length % 3)) % 3
  return (
    <div id={`results-${query.name}`} class="mx-auto max-w-[1192px] px-6 pt-3 pb-16">
      <h2 class="text-2xl/8 font-semibold tracking-tight">Top Results</h2>
      <div class="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {query.top.map((tld) => (
          <TopResult domain={{ name: query.name, tld }} />
        ))}
      </div>
      <div class="mt-6 flex items-center justify-between gap-4">
        <h2 class="text-2xl/8 font-semibold tracking-tight">All Results</h2>
        <div class="flex gap-2">
          <FilterButton label="Free with Pro" icon="plus" class="border-dashed border-[#282828]" />
          <FilterButton label="All TLDs" class="w-[97px] bg-surface" />
          <FilterButton label="Show All" class="w-[114px] bg-surface" />
          <FilterButton label="Relevance" class="w-[128px] bg-surface" />
        </div>
      </div>
      <div class="mt-3 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <ResultRow domain={domain} />
        ))}
        {Array.from({ length: filler }, () => (
          <div class="hidden bg-surface lg:block" />
        ))}
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div id="results-empty" class="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pb-[3px] text-center">
      <span class="flex size-[34px] items-center justify-center rounded-md border border-line">
        <Icon name="search" class="size-4" />
      </span>
      <h2 class="mt-[11px] text-xl/7 font-semibold tracking-tight">Begin your search</h2>
      <p class="mt-1.5 max-w-[320px] text-sm/5 text-muted">Enter a domain name, keyword, or prompt to find available domains for your next project</p>
    </div>
  )
}
